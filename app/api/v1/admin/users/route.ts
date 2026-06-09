import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/models/User'
import UserProxy from '@/lib/models/UserProxy'
import { requireRole } from '@/lib/utils/auth'
import { ok, serverError, unauthorized } from '@/lib/utils/response'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['admin'])
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
    const q     = searchParams.get('q') ?? ''

    const filter: Record<string, unknown> = {}
    if (q) filter.$or = [
      { username: { $regex: q, $options: 'i' } },
      { email:    { $regex: q, $options: 'i' } },
    ]

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter),
    ])

    // Attach proxy count per user
    const ids = users.map(u => u._id)
    const proxyCounts = await UserProxy.aggregate([
      { $match: { userId: { $in: ids }, status: 'active' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ])
    const proxyMap: Record<string, number> = {}
    proxyCounts.forEach(p => { proxyMap[String(p._id)] = p.count })

    const enriched = users.map(u => ({
      ...u,
      balance: u.balance ? parseFloat(u.balance.toString()) : 0,
      activeProxies: proxyMap[String(u._id)] ?? 0,
      isBanned: !!u.deletedAt,
    }))

    return ok({ items: enriched, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    if ((err as Error).message === 'Insufficient permissions') return ok({ items: [], total: 0, page: 1, pages: 1 })
    return serverError(err)
  }
}
