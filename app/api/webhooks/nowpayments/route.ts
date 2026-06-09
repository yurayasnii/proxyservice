import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import Order from '@/lib/models/Order'
import User from '@/lib/models/User'
import UserProxy from '@/lib/models/UserProxy'
import Transaction from '@/lib/models/Transaction'
import Notification from '@/lib/models/Notification'
import ProxyProduct from '@/lib/models/ProxyProduct'
import redis from '@/lib/utils/redis'
import { encrypt } from '@/lib/utils/crypto'

function verifySig(body: Record<string, unknown>, signature: string): boolean {
  const sorted = Object.keys(body)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => { acc[key] = body[key]; return acc }, {})

  const hmac = crypto
    .createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET!)
    .update(JSON.stringify(sorted))
    .digest('hex')

  return hmac === signature
}

function generateProxyCredentials(productId: string, index: number) {
  const hosts = [
    '185.220.101.45', '185.220.101.46', '185.220.101.47',
    '195.154.122.10', '195.154.122.11', '91.108.4.10',
  ]
  const host = hosts[Math.floor(Math.random() * hosts.length)]
  const port = 8080 + Math.floor(Math.random() * 100)
  const username = `ps_${productId.slice(-6)}_${Date.now()}_${index}`
  const password = crypto.randomBytes(12).toString('base64url')
  return { host, port, username, password }
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-nowpayments-sig')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const body = await req.json()

    if (!verifySig(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { payment_status, order_id, payment_id, pay_amount, pay_currency, actually_paid } = body

    if (!['confirmed', 'finished'].includes(payment_status)) {
      return NextResponse.json({ ok: true, status: 'ignored' })
    }

    await connectDB()

    const order = await Order.findById(order_id)
    if (!order || order.status === 'completed') {
      return NextResponse.json({ ok: true, status: 'already_processed' })
    }

    const expectedTotal = parseFloat(order.totalUsdt.toString())
    const paidUsdt = parseFloat(actually_paid ?? pay_amount ?? '0')
    if (paidUsdt < expectedTotal * 0.99) {
      return NextResponse.json({ error: 'Underpayment' }, { status: 400 })
    }

    // Mark order paid
    order.status = 'paid'
    order.paymentTxHash = body.outcome_amount ? body.outcome_hash : undefined
    order.paidAt = new Date()
    await order.save()

    // Create transaction record
    await Transaction.create({
      userId: order.userId,
      orderId: order._id,
      type: 'purchase',
      amount: mongoose.Types.Decimal128.fromString(String(pay_amount ?? 0)),
      currency: (pay_currency ?? 'USDT').toUpperCase(),
      amountUsdt: order.totalUsdt,
      status: 'confirmed',
      description: `Order ${order._id}`,
    })

    // Generate proxies for each order item
    for (const item of order.items) {
      const product = await ProxyProduct.findById(item.productId)
      if (!product) continue

      const durationDays: Record<string, number> = {
        '1d': 1, '7d': 7, '30d': 30, '90d': 90, '180d': 180, '1y': 365,
      }

      const plan = product.plans.find(p => p._id.toString() === item.planId?.toString())
      const days = plan ? durationDays[plan.duration] ?? 30 : 30
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

      for (let i = 0; i < item.ipCount; i++) {
        const { host, port, username, password } = generateProxyCredentials(
          item.productId.toString(), i
        )
        await UserProxy.create({
          userId: order.userId,
          productId: item.productId,
          orderId: order._id,
          host,
          port,
          username,
          password: encrypt(password),
          protocol: product.protocols[0] ?? 'http',
          expiresAt,
        })
      }
    }

    // Update order status to completed
    order.status = 'completed'
    await order.save()

    // Notify user
    await Notification.create({
      userId: order.userId,
      type: 'order_completed',
      title: 'Order completed',
      body: `Your proxies are ready! Order #${order._id.toString().slice(-8)}`,
      meta: { orderId: order._id },
    })

    // Publish to Redis pub/sub for SSE
    await redis.publish(
      `user:${order.userId}:events`,
      JSON.stringify({ type: 'order_completed', orderId: order._id })
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[NOWPayments webhook error]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
