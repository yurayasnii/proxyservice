import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/models/User'
import { requireAuth } from '@/lib/utils/auth'
import { ok, error, unauthorized, serverError } from '@/lib/utils/response'

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    await connectDB()
    const user = await User.findById(payload.userId)
    if (!user) return unauthorized('User not found')
    return ok(user.toJSON())
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}

const UpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Мін. 3 символи')
    .max(30, 'Макс. 30 символів')
    .regex(/^[a-zA-Z0-9_]+$/, 'Тільки латиниця, цифри та підкреслення')
    .optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, 'Мін. 8 символів')
    .regex(/[A-Z]/, 'Потрібна велика літера')
    .regex(/[0-9]/, 'Потрібна цифра')
    .optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const body = await req.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Помилка валідації')

    const { username, currentPassword, newPassword } = parsed.data

    await connectDB()
    const user = await User.findById(payload.userId).select('+passwordHash')
    if (!user) return unauthorized('User not found')

    if (username && username !== user.username) {
      const taken = await User.findOne({ username, _id: { $ne: user._id } })
      if (taken) return error('Нікнейм вже зайнятий')
      user.username = username
    }

    if (newPassword) {
      if (!currentPassword) return error('Введіть поточний пароль')
      if (!user.passwordHash) return error('Акаунт не має пароля (OAuth)')
      const valid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!valid) return error('Невірний поточний пароль')
      user.passwordHash = await bcrypt.hash(newPassword, 12)
    }

    await user.save()
    return ok(user.toJSON())
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}
