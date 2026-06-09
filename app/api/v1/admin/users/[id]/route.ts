import { NextRequest } from 'next/server'
import { z } from 'zod'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/models/User'
import UserProxy from '@/lib/models/UserProxy'
import Transaction from '@/lib/models/Transaction'
import Notification from '@/lib/models/Notification'
import AuditLog from '@/lib/models/AuditLog'
import { requireRole, getTokenFromRequest } from '@/lib/utils/auth'
import { verifyAccessToken } from '@/lib/utils/jwt'
import { ok, error, notFound, unauthorized, serverError } from '@/lib/utils/response'

const ActionSchema = z.object({
  action: z.enum(['ban', 'unban', 'refund', 'deactivate_proxies', 'reactivate_proxies', 'set_role', 'notify']),
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
  role:   z.enum(['user', 'admin']).optional(),
  title:  z.string().optional(),
  body:   z.string().optional(),
})

async function writeAudit(adminId: string, adminUsername: string, action: string, targetId: string, targetName: string, details?: Record<string, unknown>) {
  try {
    await AuditLog.create({ adminId, adminUsername, action, targetId, targetType: 'user', targetName, details })
  } catch { /* non-critical */ }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireRole(req, ['admin'])
    const { id } = await params
    const body = await req.json()
    const parsed = ActionSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Validation error')

    const token = getTokenFromRequest(req)!
    const adminPayload = verifyAccessToken(token)
    const adminUser = await User.findById(adminPayload.userId).select('username').lean() as { username: string } | null
    const adminUsername = adminUser?.username ?? 'admin'

    await connectDB()
    const user = await User.findById(id).select('+balance +role')
    if (!user) return notFound('User not found')

    const { action, amount, role, title, body: notifBody } = parsed.data

    switch (action) {
      case 'ban':
        user.deletedAt = new Date()
        await user.save()
        await writeAudit(adminPayload.userId, adminUsername, 'ban', id, user.username)
        return ok({ message: 'Акаунт заблокований', isBanned: true })

      case 'unban':
        user.deletedAt = undefined
        await user.save()
        await writeAudit(adminPayload.userId, adminUsername, 'unban', id, user.username)
        return ok({ message: 'Акаунт розблокований', isBanned: false })

      case 'refund': {
        if (!amount || amount <= 0) return error('Вкажіть суму повернення')
        const current = parseFloat(user.balance?.toString() ?? '0')
        user.balance = mongoose.Types.Decimal128.fromString((current + amount).toFixed(8))
        await user.save()
        await Transaction.create({
          userId: user._id, type: 'refund',
          amount: mongoose.Types.Decimal128.fromString(amount.toFixed(8)),
          currency: 'USDT',
          amountUsdt: mongoose.Types.Decimal128.fromString(amount.toFixed(8)),
          status: 'confirmed',
          description: `Повернення від адміна: $${amount}`,
        })
        await writeAudit(adminPayload.userId, adminUsername, 'refund', id, user.username, { amount })
        return ok({ message: `Повернено $${amount} на баланс`, newBalance: current + amount })
      }

      case 'deactivate_proxies': {
        const result = await UserProxy.updateMany({ userId: user._id, status: 'active' }, { status: 'suspended' })
        await writeAudit(adminPayload.userId, adminUsername, 'deactivate_proxies', id, user.username, { count: result.modifiedCount })
        return ok({ message: `Деактивовано ${result.modifiedCount} проксі`, count: result.modifiedCount })
      }

      case 'reactivate_proxies': {
        const result = await UserProxy.updateMany({ userId: user._id, status: 'suspended' }, { status: 'active' })
        await writeAudit(adminPayload.userId, adminUsername, 'reactivate_proxies', id, user.username, { count: result.modifiedCount })
        return ok({ message: `Активовано ${result.modifiedCount} проксі`, count: result.modifiedCount })
      }

      case 'set_role': {
        if (!role) return error('Вкажіть роль')
        if (user.role === 'admin' && adminPayload.userId === id) return error('Не можна змінити свою роль')
        const prev = user.role
        user.role = role
        await user.save()
        await writeAudit(adminPayload.userId, adminUsername, 'set_role', id, user.username, { from: prev, to: role })
        return ok({ message: `Роль змінено на ${role}`, role })
      }

      case 'notify': {
        if (!title?.trim() || !notifBody?.trim()) return error('Вкажіть заголовок і текст')
        await Notification.create({ userId: user._id, type: 'admin_message', title: title.trim(), body: notifBody.trim() })
        await writeAudit(adminPayload.userId, adminUsername, 'notify', id, user.username, { title })
        return ok({ message: 'Повідомлення надіслано' })
      }
    }
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    if ((err as Error).message === 'Insufficient permissions') return error('Forbidden', 403)
    return serverError(err)
  }
}
