import { NextRequest } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import ProxyProduct from '@/lib/models/ProxyProduct'
import Order from '@/lib/models/Order'
import User from '@/lib/models/User'
import UserProxy from '@/lib/models/UserProxy'
import Notification from '@/lib/models/Notification'
import { requireAuth } from '@/lib/utils/auth'
import { ok, error, serverError, unauthorized } from '@/lib/utils/response'
import { encrypt } from '@/lib/utils/crypto'
import redis from '@/lib/utils/redis'
import type { PaymentMethod } from '@/types'

const DURATION_LABELS: Record<string, string> = {
  '1d': '1 день', '7d': '7 днів', '30d': '30 днів', '90d': '90 днів', '180d': '6 міс', '1y': '1 рік',
}

const PROXY_HOSTS = [
  '185.220.101.45', '185.220.101.46', '185.220.101.47',
  '195.154.122.10', '195.154.122.11', '91.108.4.10',
  '104.21.44.10',   '172.67.182.20',  '198.54.117.10',
]
const DURATION_DAYS: Record<string, number> = {
  '1d': 1, '7d': 7, '30d': 30, '90d': 90, '180d': 180, '1y': 365,
}

async function fulfillOrder(orderId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) {
  const order = await Order.findById(orderId)
  if (!order) return
  for (const item of order.items) {
    const product = await ProxyProduct.findById(item.productId)
    if (!product) continue
    const plan = product.plans.find((p: { _id: mongoose.Types.ObjectId }) => p._id.toString() === item.planId?.toString())
    const days = plan ? (DURATION_DAYS[plan.duration] ?? 30) : 30
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    for (let i = 0; i < item.ipCount; i++) {
      const host = PROXY_HOSTS[Math.floor(Math.random() * PROXY_HOSTS.length)]
      const port = 8080 + Math.floor(Math.random() * 920)
      const username = `ps_${item.productId.toString().slice(-6)}_${Date.now()}_${i}`
      const password = crypto.randomBytes(12).toString('base64url')
      await UserProxy.create({
        userId,
        productId: item.productId,
        orderId: order._id,
        host, port,
        username,
        password: encrypt(password),
        protocol: product.protocols[0] ?? 'http',
        expiresAt,
      })
    }
  }
  await Order.findByIdAndUpdate(orderId, { status: 'completed' })
}

const CreateOrderSchema = z.object({
  planId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().min(1).default(1),
  paymentMethod: z.enum(['btc', 'eth', 'usdt_trc20', 'usdt_erc20', 'ton', 'ltc', 'balance']),
  promoCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const body = await req.json()
    const parsed = CreateOrderSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Validation error")

    const { planId, productId, quantity, paymentMethod, promoCode } = parsed.data

    await connectDB()

    const product = await ProxyProduct.findOne({ _id: productId, isActive: true })
    if (!product) return error('Product not found', 404)

    const plan = product.plans.find((p) => p._id.toString() === planId)
    if (!plan) return error('Plan not found', 404)

    const priceUsdt = parseFloat(plan.priceUsdt.toString())
    const totalUsdt = priceUsdt * quantity
    const discountUsdt = priceUsdt * quantity * (plan.discount / 100)
    const finalTotal = totalUsdt - discountUsdt

    // Balance payment
    if (paymentMethod === 'balance') {
      const user = await User.findById(payload.userId)
      if (!user) return unauthorized()
      const balance = parseFloat(user.balance.toString())
      if (balance < finalTotal) return error('Insufficient balance')

      const order = await Order.create({
        userId: payload.userId,
        status: 'paid',
        totalUsdt: mongoose.Types.Decimal128.fromString(finalTotal.toFixed(8)),
        discountUsdt: mongoose.Types.Decimal128.fromString(discountUsdt.toFixed(8)),
        promoCode,
        paymentMethod: 'balance' as PaymentMethod,
        paidAt: new Date(),
        items: [{
          planId: plan._id,
          productId: product._id,
          quantity,
          priceUsdt: mongoose.Types.Decimal128.fromString(priceUsdt.toFixed(8)),
          ipCount: plan.ipCount,
        }],
      })

      user.balance = mongoose.Types.Decimal128.fromString((balance - finalTotal).toFixed(8))
      await user.save()

      await fulfillOrder(order._id as mongoose.Types.ObjectId, payload.userId as unknown as mongoose.Types.ObjectId)

      const totalIp = plan.ipCount * quantity
      const durationLabel = DURATION_LABELS[plan.duration] ?? plan.duration
      const notif = await Notification.create({
        userId: payload.userId,
        type: 'order_receipt',
        title: 'Замовлення виконано',
        body: `${product.name} · ${durationLabel} · ${totalIp} IP · -$${finalTotal.toFixed(2)}`,
        meta: {
          orderId: order._id.toString(),
          total: finalTotal,
          ipCount: totalIp,
          productName: product.name,
          duration: plan.duration,
          quantity,
        },
      })

      await redis.publish(`user:${payload.userId}:events`, JSON.stringify({
        type: 'notification',
        notification: {
          _id: notif._id.toString(),
          type: notif.type,
          title: notif.title,
          body: notif.body,
          isRead: false,
          createdAt: notif.createdAt,
          meta: notif.meta,
        },
      }))

      return ok({ orderId: order._id, status: 'completed', paymentMethod: 'balance' }, 201)
    }

    // Crypto payment via NOWPayments
    const paymentCurrencyMap: Record<string, string> = {
      btc: 'btc',
      eth: 'eth',
      usdt_trc20: 'usdttrc20',
      usdt_erc20: 'usdterc20',
      ton: 'ton',
      ltc: 'ltc',
    }

    const order = await Order.create({
      userId: payload.userId,
      status: 'awaiting_payment',
      totalUsdt: mongoose.Types.Decimal128.fromString(finalTotal.toFixed(8)),
      discountUsdt: mongoose.Types.Decimal128.fromString(discountUsdt.toFixed(8)),
      promoCode,
      paymentMethod: paymentMethod as PaymentMethod,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      items: [{
        planId: plan._id,
        productId: product._id,
        quantity,
        priceUsdt: mongoose.Types.Decimal128.fromString(priceUsdt.toFixed(8)),
        ipCount: plan.ipCount,
      }],
    })

    // Create NOWPayments payment
    const nowPaymentRes = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: finalTotal,
        price_currency: 'usd',
        pay_currency: paymentCurrencyMap[paymentMethod],
        order_id: order._id.toString(),
        order_description: `ProxyService order ${order._id}`,
        ipn_callback_url: `${process.env.NEXTAUTH_URL}/api/webhooks/nowpayments`,
      }),
    })

    if (!nowPaymentRes.ok) {
      await Order.findByIdAndUpdate(order._id, { status: 'cancelled' })
      return error('Payment provider error. Please try again.', 502)
    }

    const payment = await nowPaymentRes.json()

    await Order.findByIdAndUpdate(order._id, {
      paymentId: payment.payment_id,
      paymentAddress: payment.pay_address,
    })

    return ok({
      orderId: order._id,
      paymentId: payment.payment_id,
      paymentAddress: payment.pay_address,
      amountCrypto: payment.pay_amount,
      currency: paymentMethod,
      expiresAt: order.expiresAt,
      totalUsdt: finalTotal,
    }, 201)
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    await connectDB()

    const orders = await Order.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    const serialized = orders.map((o) => ({
      ...o,
      totalUsdt: parseFloat(o.totalUsdt?.toString() ?? '0'),
      discountUsdt: parseFloat(o.discountUsdt?.toString() ?? '0'),
      items: o.items.map((item) => ({
        ...item,
        priceUsdt: parseFloat(item.priceUsdt?.toString() ?? '0'),
      })),
    }))

    return ok({ items: serialized, total: serialized.length })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}
