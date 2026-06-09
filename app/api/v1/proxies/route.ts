import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import UserProxy from '@/lib/models/UserProxy'
import { requireAuth } from '@/lib/utils/auth'
import { ok, unauthorized, serverError } from '@/lib/utils/response'

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const filter: Record<string, unknown> = { userId: payload.userId }
    if (status) filter.status = status

    const proxies = await UserProxy.find(filter)
      .populate('productId', 'name type countryCode countryName countryFlag protocols speedMbps')
      .sort({ createdAt: -1 })
      .lean()

    return ok({ items: proxies, total: proxies.length })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}
