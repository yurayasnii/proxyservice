import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/utils/auth'
import { ok, error, serverError, unauthorized } from '@/lib/utils/response'

const DepositSchema = z.object({
  currency: z.enum(['btc', 'eth', 'usdt_trc20', 'usdt_erc20', 'ton', 'ltc']),
  amount: z.number().min(5, 'Minimum deposit is $5').max(10000),
})

const CURRENCY_MAP: Record<string, string> = {
  btc: 'btc', eth: 'eth', usdt_trc20: 'usdttrc20',
  usdt_erc20: 'usdterc20', ton: 'ton', ltc: 'ltc',
}

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const body = await req.json()
    const parsed = DepositSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Validation error")

    const { currency, amount } = parsed.data

    const nowRes = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY ?? 'demo',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: CURRENCY_MAP[currency],
        order_id: `deposit_${payload.userId}_${Date.now()}`,
        order_description: `Balance deposit for ${payload.userId}`,
        ipn_callback_url: `${process.env.NEXTAUTH_URL}/api/webhooks/nowpayments`,
      }),
    })

    if (!nowRes.ok) {
      // Return demo address for development
      return ok({
        address: 'TRxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        amount: amount,
        currency,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        demo: true,
      })
    }

    const payment = await nowRes.json()
    return ok({
      paymentId: payment.payment_id,
      address: payment.pay_address,
      amount: payment.pay_amount,
      currency,
      expiresAt: payment.expiration_estimate_date,
    })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}
