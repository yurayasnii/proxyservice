import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import UserProxy from '@/lib/models/UserProxy'
import { requireRole } from '@/lib/utils/auth'
import { ok, forbidden, serverError } from '@/lib/utils/response'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['admin'])
    await connectDB()

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') ?? '7')
    const deadline = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

    const proxies = await UserProxy.find({
      status: 'active',
      expiresAt: { $lte: deadline, $gte: new Date() },
    })
      .sort({ expiresAt: 1 })
      .limit(100)
      .populate('userId', 'username email')
      .select('userId host port protocol expiresAt autoRenew')
      .lean()

    return ok({ items: proxies, days })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}
