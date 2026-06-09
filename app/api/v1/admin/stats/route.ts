import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/models/User'
import UserProxy from '@/lib/models/UserProxy'
import Order from '@/lib/models/Order'
import SupportTicket from '@/lib/models/SupportTicket'
import Transaction from '@/lib/models/Transaction'
import { requireRole } from '@/lib/utils/auth'
import { ok, forbidden, serverError } from '@/lib/utils/response'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['admin'])
    await connectDB()

    const [totalUsers, activeProxies, totalOrders, openTickets, pendingHumanTickets, revenue] =
      await Promise.all([
        User.countDocuments({ deletedAt: null }),
        UserProxy.countDocuments({ status: 'active' }),
        Order.countDocuments(),
        SupportTicket.countDocuments({ status: 'open' }),
        SupportTicket.countDocuments({ status: 'pending_human' }),
        Transaction.aggregate([
          { $match: { type: 'purchase', status: 'confirmed' } },
          { $group: { _id: null, total: { $sum: { $toDouble: '$amountUsdt' } } } },
        ]),
      ])

    return ok({
      totalUsers,
      activeProxies,
      totalOrders,
      openTickets,
      pendingHumanTickets,
      revenue: revenue[0]?.total ?? 0,
    })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}
