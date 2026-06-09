import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/models/User'
import { signAccessToken, signRefreshToken } from '@/lib/utils/jwt'
import { ok, error, serverError, unauthorized } from '@/lib/utils/response'
import { rateLimit } from '@/lib/utils/redis'

const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const { allowed, remaining } = await rateLimit(`login:${ip}`, 5, 60)
    if (!allowed) return error('Too many login attempts. Try again in 60 seconds.', 429)

    const body = await req.json()
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Validation error")

    const { email, password } = parsed.data

    await connectDB()

    const user = await User.findOne({ email, deletedAt: null }).select('+passwordHash')
    if (!user) return unauthorized('Невірний email або пароль')
    if (!user.passwordHash) return unauthorized('Цей акаунт використовує вхід через Google або GitHub. Натисніть кнопку Google або GitHub.')

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) return unauthorized('Invalid email or password')

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

    return ok({ user: user.toJSON(), accessToken, remaining })
  } catch (err) {
    return serverError(err)
  }
}
