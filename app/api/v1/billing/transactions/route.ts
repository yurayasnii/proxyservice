import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import Transaction from '@/lib/models/Transaction'
import { requireAuth } from '@/lib/utils/auth'
import { ok, serverError, unauthorized } from '@/lib/utils/response'

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    await connectDB()

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))

    const filter: Record<string, unknown> = { userId: payload.userId }
    if (type) filter.type = type

    const [items, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Transaction.countDocuments(filter),
    ])

    const serialized = items.map((t) => ({
      ...t,
      amount: parseFloat(t.amount?.toString() ?? '0'),
      amountUsdt: parseFloat(t.amountUsdt?.toString() ?? '0'),
    }))

    return ok({ items: serialized, total, page, limit })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}
