import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import Order from '@/lib/models/Order'
import { requireRole } from '@/lib/utils/auth'
import { ok, forbidden, serverError } from '@/lib/utils/response'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['admin'])
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit  = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
    const status = searchParams.get('status') ?? ''
    const skip   = (page - 1) * limit

    const userId = searchParams.get('userId') ?? ''
    const filter: Record<string, unknown> = {}
    if (status) filter.status = status
    if (userId) filter.userId = userId

    const [items, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username email')
        .select('userId status totalUsdt paymentMethod createdAt items')
        .lean(),
      Order.countDocuments(filter),
    ])

    return ok({ items, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}
