import { NextRequest } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/models/User'
import Notification from '@/lib/models/Notification'
import UserProxy from '@/lib/models/UserProxy'
import { requireRole } from '@/lib/utils/auth'
import { ok, error, unauthorized, serverError } from '@/lib/utils/response'

const Schema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  type: z.enum(['all', 'active']).default('all'),
})

export async function POST(req: NextRequest) {
  try {
    const payload = requireRole(req, ['admin'])
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Validation error')

    await connectDB()

    let userIds: string[]

    if (parsed.data.type === 'active') {
      const activeProxies = await UserProxy.find({ status: 'active' }).select('userId').lean()
      userIds = [...new Set(activeProxies.map(p => String(p.userId)))]
    } else {
      const users = await User.find({ deletedAt: null }).select('_id').lean()
      userIds = users.map(u => String(u._id))
    }

    if (!userIds.length) return ok({ count: 0 })

    await Notification.insertMany(
      userIds.map(userId => ({
        userId,
        type: 'broadcast',
        title: parsed.data.title,
        body: parsed.data.body,
        isRead: false,
      }))
    )

    return ok({ count: userIds.length })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    if ((err as Error).message === 'Insufficient permissions') return error('Forbidden', 403)
    return serverError(err)
  }
}
