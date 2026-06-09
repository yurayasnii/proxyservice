import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/models/User'
import Transaction from '@/lib/models/Transaction'
import Notification from '@/lib/models/Notification'
import redis from '@/lib/utils/redis'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2026-04-22.dahlia',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const userId = pi.metadata?.userId
    const amountUsd = pi.amount / 100

    if (!userId) return NextResponse.json({ ok: true })

    await connectDB()
    const user = await User.findById(userId)
    if (!user) return NextResponse.json({ ok: true })

    const currentBalance = user.balance ? parseFloat(user.balance.toString()) : 0
    user.balance = mongoose.Types.Decimal128.fromString((currentBalance + amountUsd).toFixed(2))
    await user.save()

    await Transaction.create({
      userId: new mongoose.Types.ObjectId(userId),
      type: 'deposit',
      amount: mongoose.Types.Decimal128.fromString(amountUsd.toFixed(2)),
      amountUsdt: mongoose.Types.Decimal128.fromString(amountUsd.toFixed(2)),
      currency: 'usd_card',
      status: 'confirmed',
      description: `Stripe card deposit $${amountUsd}`,
      txHash: pi.id,
    })

    await Notification.create({
      userId: new mongoose.Types.ObjectId(userId),
      type: 'payment',
      title: 'Баланс поповнено',
      body: `+$${amountUsd.toFixed(2)} через картку Stripe`,
    })

    try {
      await redis.publish(`notifications:${userId}`, JSON.stringify({ type: 'balance_update', balance: user.balance }))
    } catch { /* redis optional */ }
  }

  return NextResponse.json({ received: true })
}
