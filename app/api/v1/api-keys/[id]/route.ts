import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import ApiKey from '@/lib/models/ApiKey'
import { requireAuth } from '@/lib/utils/auth'
import { ok, notFound, unauthorized, serverError } from '@/lib/utils/response'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = requireAuth(req)
    const { id } = await params
    await connectDB()
    const key = await ApiKey.findOne({ _id: id, userId: payload.userId, deletedAt: null })
    if (!key) return notFound('API key not found')
    key.deletedAt = new Date()
    await key.save()
    return ok({ deleted: true })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}
