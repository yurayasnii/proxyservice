import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/models/User'
import { signAccessToken, signRefreshToken } from '@/lib/utils/jwt'
import { generateReferralCode } from '@/lib/utils/auth'
import { ok, error, serverError } from '@/lib/utils/response'
import { rateLimit } from '@/lib/utils/redis'
import mongoose from 'mongoose'
import Transaction from '@/lib/models/Transaction'
import Notification from '@/lib/models/Notification'

const REFERRAL_BONUS = 5 // $5 for referrer

const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  referralCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const { allowed } = await rateLimit(`register:${ip}`, 5, 3600)
    if (!allowed) return error('Too many registration attempts. Try again later.', 429)

    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      return error(parsed.error.issues[0]?.message ?? "Validation error")
    }

    const { email, password, username, referralCode: refCode } = parsed.data

    await connectDB()

    const existing = await User.findOne({ $or: [{ email }, { username }] })
    if (existing) {
      if (existing.email === email) return error('Email already registered')
      return error('Username already taken')
    }

    let referredBy: mongoose.Types.ObjectId | undefined
    if (refCode) {
      const referrer = await User.findOne({ referralCode: refCode })
      if (referrer) referredBy = referrer._id as mongoose.Types.ObjectId
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({
      email,
      passwordHash,
      username,
      referralCode: generateReferralCode(),
      referredBy,
      balance: mongoose.Types.Decimal128.fromString('0'),
      emailVerified: false,
    })

    const payload = { userId: user._id.toString(), email: user.email, role: user.role }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    const cookieStore = await cookies()
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    })
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    // Credit referral bonus to referrer
    if (referredBy) {
      try {
        const referrer = await User.findById(referredBy).select('+balance')
        if (referrer) {
          const prev = parseFloat(referrer.balance?.toString() ?? '0')
          referrer.balance = mongoose.Types.Decimal128.fromString((prev + REFERRAL_BONUS).toFixed(8))
          await referrer.save()
          await Transaction.create({
            userId: referrer._id,
            type: 'referral_bonus',
            amount: mongoose.Types.Decimal128.fromString(REFERRAL_BONUS.toFixed(8)),
            currency: 'USDT',
            amountUsdt: mongoose.Types.Decimal128.fromString(REFERRAL_BONUS.toFixed(8)),
            status: 'confirmed',
            description: `Реферальний бонус за ${username}`,
          })
          await Notification.create({
            userId: referrer._id,
            type: 'referral_bonus',
            title: '🎉 Реферальний бонус',
            body: `+$${REFERRAL_BONUS} зараховано за реєстрацію нового користувача ${username}!`,
          })
        }
      } catch { /* ignore referral errors */ }
    }

    return ok({ user: user.toJSON(), accessToken }, 201)
  } catch (err) {
    return serverError(err)
  }
}
