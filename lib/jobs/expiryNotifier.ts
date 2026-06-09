import { Worker } from 'bullmq'
import type { ConnectionOptions } from 'bullmq'
import { connectDB } from '../db/connect'
import UserProxy from '../models/UserProxy'
import Notification from '../models/Notification'
import { redisConnection } from './queue'

export function startExpiryNotifierWorker() {
  const worker = new Worker(
    'expiry-notifier',
    async () => {
      await connectDB()

      const in3days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      const in1day = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const now = new Date()

      // Find proxies expiring in 3 days
      const expiring3d = await UserProxy.find({
        status: 'active',
        expiresAt: { $lte: in3days, $gt: in1day },
      }).lean()

      for (const proxy of expiring3d) {
        await Notification.create({
          userId: proxy.userId,
          type: 'proxy_expiring_3d',
          title: 'Проксі закінчується через 3 дні',
          body: `Проксі ${proxy.host}:${proxy.port} закінчується через 3 дні. Оновіть підписку.`,
          meta: { proxyId: proxy._id },
        })
      }

      // Find proxies expiring in 1 day
      const expiring1d = await UserProxy.find({
        status: 'active',
        expiresAt: { $lte: in1day, $gt: now },
      }).lean()

      for (const proxy of expiring1d) {
        await Notification.create({
          userId: proxy.userId,
          type: 'proxy_expiring_1d',
          title: '⚠️ Проксі закінчується завтра',
          body: `Проксі ${proxy.host}:${proxy.port} закінчується завтра!`,
          meta: { proxyId: proxy._id },
        })
      }

      // Mark expired proxies
      const expired = await UserProxy.updateMany(
        { status: 'active', expiresAt: { $lte: now } },
        { status: 'expired' }
      )

      console.log(`[Expiry] Notified: ${expiring3d.length} (3d) + ${expiring1d.length} (1d). Expired: ${expired.modifiedCount}`)
    },
    { connection: redisConnection as unknown as ConnectionOptions }
  )

  return worker
}
