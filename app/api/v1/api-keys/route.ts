import { NextRequest } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import ApiKey from '@/lib/models/ApiKey'
import { requireAuth } from '@/lib/utils/auth'
import { generateApiKey } from '@/lib/utils/crypto'
import { ok, error, serverError, unauthorized } from '@/lib/utils/response'

const CreateKeySchema = z.object({
  name: z.string().min(1).max(50),
  permissions: z.array(z.string()).default([]),
})

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    await connectDB()
    const keys = await ApiKey.find({ userId: payload.userId, deletedAt: null }).sort({ createdAt: -1 }).lean()
    return ok({ items: keys })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const body = await req.json()
    const parsed = CreateKeySchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Validation error")

    await connectDB()

    const count = await ApiKey.countDocuments({ userId: payload.userId, deletedAt: null })
    if (count >= 10) return error('Maximum 10 API keys allowed')

    const { key, hash } = generateApiKey()
    const apiKey = await ApiKey.create({
      userId: payload.userId,
      name: parsed.data.name,
      keyHash: hash,
      permissions: parsed.data.permissions,
    })

    return ok({ ...apiKey.toObject(), key }, 201)
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}
