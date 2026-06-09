import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/models/User'
import Order from '@/lib/models/Order'
import { requireRole } from '@/lib/utils/auth'
import { ok, forbidden, serverError } from '@/lib/utils/response'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['admin'])
    await connectDB()

    const [recentUsers, recentOrders] = await Promise.all([
      User.find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(8)
        .select('username email createdAt role oauthProviders')
        .lean(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('userId', 'username email')
        .select('userId status totalUsdt paymentMethod createdAt')
        .lean(),
    ])

    return ok({ recentUsers, recentOrders })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}
