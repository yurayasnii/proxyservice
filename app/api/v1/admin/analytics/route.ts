import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import Transaction from '@/lib/models/Transaction'
import User from '@/lib/models/User'
import { requireRole } from '@/lib/utils/auth'
import { ok, forbidden, serverError } from '@/lib/utils/response'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['admin'])
    await connectDB()

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') ?? '30')
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [revenueRaw, registrationsRaw, topSpendersRaw] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: 'purchase', status: 'confirmed', createdAt: { $gte: since } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: { $toDouble: '$amountUsdt' } },
          count: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { deletedAt: null, createdAt: { $gte: since } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'purchase', status: 'confirmed' } },
        { $group: { _id: '$userId', total: { $sum: { $toDouble: '$amountUsdt' } }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $project: { total: 1, count: 1, username: '$user.username', email: '$user.email' } },
      ]),
    ])

    // Fill missing days with 0
    const days_arr: string[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      days_arr.push(d.toISOString().slice(0, 10))
    }

    const revenueMap = Object.fromEntries((revenueRaw as { _id: string; amount: number; count: number }[]).map(r => [r._id, r]))
    const regMap    = Object.fromEntries((registrationsRaw as { _id: string; count: number }[]).map(r => [r._id, r]))

    const revenue       = days_arr.map(d => ({ date: d, amount: revenueMap[d]?.amount ?? 0, count: revenueMap[d]?.count ?? 0 }))
    const registrations = days_arr.map(d => ({ date: d, count: regMap[d]?.count ?? 0 }))

    return ok({ revenue, registrations, topSpenders: topSpendersRaw, days })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}
