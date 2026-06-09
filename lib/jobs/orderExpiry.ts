import { Worker } from 'bullmq'
import type { ConnectionOptions } from 'bullmq'
import { connectDB } from '../db/connect'
import Order from '../models/Order'
import { redisConnection } from './queue'

export function startOrderExpiryWorker() {
  const worker = new Worker(
    'order-expiry',
    async () => {
      await connectDB()

      const result = await Order.updateMany(
        { status: 'awaiting_payment', expiresAt: { $lte: new Date() } },
        { status: 'cancelled' }
      )

      if (result.modifiedCount > 0) {
        console.log(`[OrderExpiry] Cancelled ${result.modifiedCount} expired orders`)
      }
    },
    { connection: redisConnection as unknown as ConnectionOptions }
  )

  return worker
}
