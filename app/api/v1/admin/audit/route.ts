import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import AuditLog from '@/lib/models/AuditLog'
import { requireRole } from '@/lib/utils/auth'
import { ok, forbidden, serverError } from '@/lib/utils/response'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['admin'])
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = 30
    const skip  = (page - 1) * limit

    const [items, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(),
    ])

    return ok({ items, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}
