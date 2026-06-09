import { Queue } from 'bullmq'
import type { ConnectionOptions } from 'bullmq'
import Redis from 'ioredis'

const redisInstance = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

// Cast needed because bullmq and ioredis may resolve different patch versions
const connection = redisInstance as unknown as ConnectionOptions

// Queues
export const proxyHealthQueue = new Queue('proxy-health', { connection })
export const expiryNotifierQueue = new Queue('expiry-notifier', { connection })
export const autoRenewerQueue = new Queue('auto-renewer', { connection })
export const orderExpiryQueue = new Queue('order-expiry', { connection })
export const statsQueue = new Queue('stats-aggregator', { connection })

export { redisInstance as redisConnection }
