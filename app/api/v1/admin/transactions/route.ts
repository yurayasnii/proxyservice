import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import Transaction from '@/lib/models/Transaction'
import { requireRole } from '@/lib/utils/auth'
import { ok, forbidden, serverError } from '@/lib/utils/response'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['admin'])
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '25'))
    const type  = searchParams.get('type') ?? ''
    const skip  = (page - 1) * limit

    const filter: Record<string, unknown> = {}
    if (type) filter.type = type

    const [items, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username email')
        .select('userId type amountUsdt currency status description createdAt txHash network')
        .lean(),
      Transaction.countDocuments(filter),
    ])

    return ok({ items, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}
