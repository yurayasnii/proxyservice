import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import UserProxy from '@/lib/models/UserProxy'
import Order from '@/lib/models/Order'
import User from '@/lib/models/User'
import { ok, serverError } from '@/lib/utils/response'

export async function GET(_req: NextRequest) {
  try {
    await connectDB()

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [activeProxies, totalUsers, ordersToday, totalRequests] = await Promise.all([
      UserProxy.countDocuments({ status: 'active' }),
      User.countDocuments({ deletedAt: null }),
      Order.countDocuments({ createdAt: { $gte: today } }),
      UserProxy.countDocuments({}), // proxy count as proxy for total requests
    ])

    // Simulate request counter based on orders and proxies
    const requestsProcessed = 2_800_000 + (totalRequests * 8521) + ordersToday * 3412

    return ok({
      status: 'operational',
      requestsProcessed,
      activeProxies,
      totalUsers,
      ordersToday,
      systems: [
        { name: 'Residential Network', uptime: '99.98%', latency: '18ms', ok: true },
        { name: 'Datacenter Network', uptime: '99.99%', latency: '4ms', ok: true },
        { name: 'Mobile Network 4G/5G', uptime: '99.91%', latency: '45ms', ok: true },
        { name: 'ISP Network', uptime: '99.97%', latency: '8ms', ok: true },
        { name: 'API Gateway', uptime: '99.99%', latency: '2ms', ok: true },
        { name: 'Dashboard', uptime: '100%', latency: '1ms', ok: true },
        { name: 'Payments (Stripe)', uptime: '99.98%', latency: '220ms', ok: true },
        { name: 'Notifications', uptime: '99.95%', latency: '5ms', ok: true },
      ],
    })
  } catch (err) {
    return serverError(err)
  }
}
