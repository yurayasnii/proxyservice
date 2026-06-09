import { NextRequest } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import UserProxy from '@/lib/models/UserProxy'
import User from '@/lib/models/User'
import { requireRole } from '@/lib/utils/auth'
import { encrypt } from '@/lib/utils/crypto'
import { ok, error, notFound, forbidden, serverError } from '@/lib/utils/response'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireRole(req, ['admin'])
    const { id } = await params
    await connectDB()
    const proxies = await UserProxy.find({ userId: id, status: 'active' })
      .sort({ createdAt: -1 })
      .select('host port protocol expiresAt replacedCount countryCode countryName')
      .lean()
    return ok({ items: proxies })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}

const PROXY_HOSTS = [
  '185.220.101.45', '185.220.101.46', '195.154.122.10',
  '91.108.4.10', '104.21.44.10', '172.67.182.20',
]

const DURATION_DAYS: Record<string, number> = {
  '1d': 1, '7d': 7, '30d': 30, '90d': 90, '180d': 180, '1y': 365,
}

const Schema = z.object({
  countryCode: z.string().length(2),
  countryName: z.string().min(1),
  protocol:    z.enum(['http', 'https', 'socks5']),
  duration:    z.enum(['1d', '7d', '30d', '90d', '180d', '1y']),
  ipCount:     z.number().int().min(1).max(100),
  host:        z.string().optional(),
  port:        z.number().int().optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireRole(req, ['admin'])
    const { id } = await params
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Validation error')

    await connectDB()
    const user = await User.findById(id)
    if (!user) return notFound('User not found')

    const { countryCode, countryName, protocol, duration, ipCount, host: customHost, port: customPort } = parsed.data
    const days = DURATION_DAYS[duration]
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

    const fakeOrderId = new mongoose.Types.ObjectId()
    const fakeProductId = new mongoose.Types.ObjectId()

    const proxies = []
    for (let i = 0; i < ipCount; i++) {
      const host     = customHost ?? PROXY_HOSTS[Math.floor(Math.random() * PROXY_HOSTS.length)]
      const port     = customPort ?? (8080 + Math.floor(Math.random() * 920))
      const username = `ps_adm_${countryCode.toLowerCase()}_${Date.now()}_${i}`
      const password = crypto.randomBytes(12).toString('base64url')

      proxies.push({
        userId: user._id,
        productId: fakeProductId,
        orderId: fakeOrderId,
        host, port, username,
        password: encrypt(password),
        protocol,
        status: 'active',
        expiresAt,
        countryCode,
        countryName,
      })
    }

    await UserProxy.insertMany(proxies)

    return ok({ added: ipCount, expiresAt })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}
