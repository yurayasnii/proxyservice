import { NextRequest } from 'next/server'
import { z } from 'zod'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/models/User'
import Transaction from '@/lib/models/Transaction'
import Notification from '@/lib/models/Notification'
import redis from '@/lib/utils/redis'
import { requireAuth } from '@/lib/utils/auth'
import { ok, error, unauthorized, serverError } from '@/lib/utils/response'

const Schema = z.object({
  amount: z.number().min(5).max(10000),
  method: z.enum(['card', 'crypto']),
  currency: z.string().default('USDT'),
})

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const body    = await req.json()
    const parsed  = Schema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Validation error')

    const { amount, method, currency } = parsed.data
    await connectDB()

    const user = await User.findById(payload.userId).select('+balance')
    if (!user) return error('User not found', 404)

    const prev    = parseFloat(user.balance?.toString() ?? '0')
    const newBal  = prev + amount
    user.balance  = mongoose.Types.Decimal128.fromString(newBal.toFixed(8))
    await user.save()

    const tx = await Transaction.create({
      userId:    user._id,
      type:      'deposit',
      amount:    mongoose.Types.Decimal128.fromString(amount.toFixed(8)),
      currency:  method === 'card' ? 'USD' : currency,
      amountUsdt: mongoose.Types.Decimal128.fromString(amount.toFixed(8)),
      status:    'confirmed',
      description: `Поповнення ${method === 'card' ? 'карткою' : 'криптовалютою'}: $${amount}`,
    })

    const notif = await Notification.create({
      userId: user._id,
      type:   'deposit_receipt',
      title:  'Баланс поповнено',
      body:   `+$${amount.toFixed(2)} зараховано на рахунок`,
      isRead: false,
      meta: {
        txId:     tx._id.toString(),
        amount,
        currency: method === 'card' ? 'USD' : currency,
        method,
        newBalance: newBal,
      },
    })

    try {
      await redis.publish(`user:${user._id}:events`, JSON.stringify({
        type: 'notification',
        notification: {
          _id:       notif._id.toString(),
          type:      notif.type,
          title:     notif.title,
          body:      notif.body,
          isRead:    false,
          createdAt: notif.createdAt,
          meta:      notif.meta,
        },
      }))
    } catch {}

    return ok({ newBalance: newBal, amount, message: `$${amount} зараховано` })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}
