import { Worker } from 'bullmq'
import type { ConnectionOptions } from 'bullmq'
import crypto from 'crypto'
import mongoose from 'mongoose'
import { connectDB } from '../db/connect'
import UserProxy from '../models/UserProxy'
import User from '../models/User'
import Transaction from '../models/Transaction'
import Notification from '../models/Notification'
import ProxyProduct from '../models/ProxyProduct'
import { encrypt } from '../utils/crypto'
import { redisConnection } from './queue'

const PROXY_HOSTS = [
  '185.220.101.45', '185.220.101.46', '195.154.122.10',
  '91.108.4.10', '104.21.44.10', '172.67.182.20',
]

const DURATION_DAYS: Record<string, number> = {
  '1d': 1, '7d': 7, '30d': 30, '90d': 90, '180d': 180, '1y': 365,
}

export function startAutoRenewerWorker() {
  const worker = new Worker(
    'auto-renewer',
    async () => {
      await connectDB()

      const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000)

      // Find proxies with auto-renew enabled expiring within 24h
      const toRenew = await UserProxy.find({
        status: 'active',
        autoRenew: true,
        expiresAt: { $lte: in24h },
      }).populate('productId').lean()

      let renewed = 0

      for (const proxy of toRenew) {
        try {
          const product = await ProxyProduct.findById(proxy.productId)
          if (!product || !product.isActive) continue

          const plan = product.plans.find((p: { _id: mongoose.Types.ObjectId }) =>
            p._id.toString() === proxy.orderId?.toString()
          ) ?? product.plans[0]

          if (!plan) continue

          const price = parseFloat(plan.priceUsdt.toString())
          const user = await User.findById(proxy.userId).select('+balance')
          if (!user) continue

          const balance = parseFloat(user.balance.toString())
          if (balance < price) {
            // Not enough balance — notify user
            await Notification.create({
              userId: proxy.userId,
              type: 'auto_renew_failed',
              title: 'Авто-поновлення не вдалося',
              body: `Недостатньо коштів для поновлення ${proxy.host}:${proxy.port}. Поповніть баланс.`,
            })
            continue
          }

          // Deduct balance
          user.balance = mongoose.Types.Decimal128.fromString((balance - price).toFixed(8))
          await user.save()

          // Create transaction
          await Transaction.create({
            userId: proxy.userId,
            type: 'purchase',
            amount: mongoose.Types.Decimal128.fromString(price.toFixed(8)),
            currency: 'USDT',
            amountUsdt: mongoose.Types.Decimal128.fromString(price.toFixed(8)),
            status: 'confirmed',
            description: `Авто-поновлення ${proxy.host}:${proxy.port}`,
          })

          // Extend or replace proxy
          const days = DURATION_DAYS[plan.duration] ?? 30
          const newExpiry = new Date(Math.max(Date.now(), proxy.expiresAt.getTime()) + days * 24 * 60 * 60 * 1000)
          const newHost = PROXY_HOSTS[Math.floor(Math.random() * PROXY_HOSTS.length)]
          const newPort = 8080 + Math.floor(Math.random() * 920)
          const newUser = `ps_${proxy.productId.toString().slice(-6)}_${Date.now()}`
          const newPass = crypto.randomBytes(12).toString('base64url')

          await UserProxy.findByIdAndUpdate(proxy._id, {
            host: newHost, port: newPort,
            username: newUser,
            password: encrypt(newPass),
            expiresAt: newExpiry,
            status: 'active',
          })

          await Notification.create({
            userId: proxy.userId,
            type: 'auto_renewed',
            title: '✅ Проксі поновлено',
            body: `Проксі автоматично поновлено на ${plan.duration}. Новий термін: ${newExpiry.toLocaleDateString('uk-UA')}.`,
          })

          renewed++
        } catch (err) {
          console.error(`[AutoRenew] Failed for proxy ${proxy._id}:`, err)
        }
      }

      console.log(`[AutoRenew] Renewed ${renewed}/${toRenew.length} proxies`)
    },
    { connection: redisConnection as unknown as ConnectionOptions }
  )

  worker.on('failed', (job, err) => {
    console.error(`[AutoRenew] Job ${job?.id} failed:`, err.message)
  })

  return worker
}
