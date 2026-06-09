import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import mongoose from 'mongoose'
import { requireRole } from '@/lib/utils/auth'
import { ok, forbidden, serverError } from '@/lib/utils/response'

async function checkRedis(): Promise<boolean> {
  try {
    const redisModule = await import('@/lib/utils/redis')
    await redisModule.default.ping()
    return true
  } catch { return false }
}

async function checkWorkers(): Promise<Record<string, { ok: boolean; status: string }>> {
  try {
    const { Queue } = await import('bullmq')
    const redisModule = await import('@/lib/utils/redis')
    const connection = redisModule.default

    const workerNames = ['expiryNotifier', 'autoRenewer', 'orderExpiry', 'proxyHealthCheck']
    const results: Record<string, { ok: boolean; status: string }> = {}

    await Promise.all(workerNames.map(async name => {
      try {
        const q = new Queue(name, { connection })
        const counts = await q.getJobCounts('active', 'waiting', 'delayed', 'failed')
        await q.close()
        results[name] = { ok: true, status: `a:${counts.active} w:${counts.waiting} f:${counts.failed}` }
      } catch {
        results[name] = { ok: false, status: 'unreachable' }
      }
    }))

    return results
  } catch {
    return {}
  }
}

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['admin'])

    const [mongoOk, redisOk, workers] = await Promise.all([
      connectDB().then(() => mongoose.connection.readyState === 1).catch(() => false),
      checkRedis(),
      checkWorkers(),
    ])

    const nowPaymentsOk = !!(process.env.NOWPAYMENTS_API_KEY && process.env.NOWPAYMENTS_API_KEY !== 'demo')
    const resendOk      = !!(process.env.RESEND_API_KEY)
    const stripeOk      = !!(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder'))

    return ok({
      services: {
        mongodb:     { ok: mongoOk,       status: mongoOk       ? 'connected'  : 'error' },
        redis:       { ok: redisOk,       status: redisOk       ? 'connected'  : 'error' },
        nowpayments: { ok: nowPaymentsOk, status: nowPaymentsOk ? 'configured' : 'demo'  },
        resend:      { ok: resendOk,      status: resendOk      ? 'configured' : 'missing' },
        stripe:      { ok: stripeOk,      status: stripeOk      ? 'configured' : 'missing' },
      },
      workers,
    })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}
