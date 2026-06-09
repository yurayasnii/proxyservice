import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { ok, error, unauthorized, serverError } from '@/lib/utils/response'
import { verifyAccessToken } from '@/lib/utils/jwt'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2026-04-22.dahlia',
})

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value
    if (!token) return unauthorized()

    let payload
    try {
      payload = verifyAccessToken(token)
    } catch {
      return unauthorized()
    }

    const { amount } = await req.json()
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum < 5) return error('Minimum deposit is $5')

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountNum * 100),
      currency: 'usd',
      metadata: {
        userId: payload.userId,
        type: 'deposit',
      },
      automatic_payment_methods: { enabled: true },
    })

    return ok({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('Stripe error:', err)
    return serverError(err)
  }
}
