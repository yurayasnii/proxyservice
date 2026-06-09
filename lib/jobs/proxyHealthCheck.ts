import { Worker } from 'bullmq'
import type { ConnectionOptions } from 'bullmq'
import { connectDB } from '../db/connect'
import UserProxy from '../models/UserProxy'
import { redisConnection } from './queue'

export function startProxyHealthWorker() {
  const worker = new Worker(
    'proxy-health',
    async () => {
      await connectDB()

      const proxies = await UserProxy.find({ status: 'active' }).select('_id host port').lean()

      for (const proxy of proxies) {
        // Simulate health check — in production: actual TCP connect
        const isAlive = Math.random() > 0.02

        await UserProxy.findByIdAndUpdate(proxy._id, {
          lastCheckedAt: new Date(),
          ...(isAlive ? {} : { status: 'suspended' }),
        })
      }

      console.log(`[Health Check] Checked ${proxies.length} proxies`)
    },
    { connection: redisConnection as unknown as ConnectionOptions }
  )

  worker.on('failed', (job, err) => {
    console.error(`[Health Check] Job ${job?.id} failed:`, err.message)
  })

  return worker
}
