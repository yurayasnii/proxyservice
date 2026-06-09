import { NextRequest } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { Resend } from 'resend'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/models/User'
import redis, { rateLimit } from '@/lib/utils/redis'
import { ok, error, serverError } from '@/lib/utils/response'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@proxyservice.io'
const TOKEN_TTL = 60 * 15 // 15 minutes

const RequestSchema = z.object({ email: z.string().email() })
const ConfirmSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const { allowed } = await rateLimit(`reset:${ip}`, 3, 3600)
    if (!allowed) return error('Занадто багато спроб. Спробуйте через годину.', 429)

    const body = await req.json()

    // Request reset
    if (body.email !== undefined) {
      const parsed = RequestSchema.safeParse(body)
      if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Невірний email')

      await connectDB()
      const user = await User.findOne({ email: parsed.data.email.toLowerCase() })

      // Always return success to prevent email enumeration
      if (!user) return ok({ message: 'Якщо акаунт існує, лист буде надіслано' })

      const token = crypto.randomBytes(32).toString('hex')
      await redis.setex(`reset:${token}`, TOKEN_TTL, user._id.toString())

      const resetUrl = `${APP_URL}/reset-password?token=${token}`

      await resend.emails.send({
        from: FROM_EMAIL,
        to: parsed.data.email,
        subject: 'Скидання пароля — ProxyService',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #060606; color: #FFFFFF;">
            <h2 style="font-size: 20px; margin-bottom: 12px;">Скидання пароля</h2>
            <p style="color: #888; margin-bottom: 24px; line-height: 1.6;">
              Ви запросили скидання пароля для акаунту ProxyService. Посилання дійсне 15 хвилин.
            </p>
            <a href="${resetUrl}" style="display: inline-block; background: #FFFFFF; color: #000; padding: 12px 24px; border-radius: 10px; font-weight: 600; text-decoration: none;">
              Скинути пароль
            </a>
            <p style="color: #444; font-size: 12px; margin-top: 24px;">
              Якщо ви не надсилали запит — проігноруйте цей лист.
            </p>
          </div>
        `,
      })

      return ok({ message: 'Якщо акаунт існує, лист буде надіслано' })
    }

    // Confirm reset with token
    const parsed = ConfirmSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Помилка валідації')

    const userId = await redis.get(`reset:${parsed.data.token}`)
    if (!userId) return error('Посилання недійсне або застаріло', 400)

    await connectDB()
    const user = await User.findById(userId)
    if (!user) return error('Користувача не знайдено', 404)

    user.passwordHash = await bcrypt.hash(parsed.data.password, 12)
    await user.save()
    await redis.del(`reset:${parsed.data.token}`)

    return ok({ message: 'Пароль успішно змінено' })
  } catch (err) {
    return serverError(err)
  }
}
