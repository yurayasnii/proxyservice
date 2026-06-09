import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import AdminNote from '@/lib/models/AdminNote'
import { requireRole, getTokenFromRequest } from '@/lib/utils/auth'
import { verifyAccessToken } from '@/lib/utils/jwt'
import { ok, error, forbidden, serverError } from '@/lib/utils/response'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireRole(req, ['admin'])
    const { id } = await params
    await connectDB()
    const notes = await AdminNote.find({ userId: id })
      .sort({ createdAt: -1 })
      .populate('adminId', 'username')
      .lean()
    return ok({ items: notes })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireRole(req, ['admin'])
    const { id } = await params
    const { content } = await req.json()
    if (!content?.trim()) return error('Вміст нотатки не може бути порожнім')

    const token = getTokenFromRequest(req)!
    const payload = verifyAccessToken(token)

    await connectDB()
    const note = await AdminNote.create({ userId: id, adminId: payload.userId, content: content.trim() })
    return ok(note.toObject(), 201)
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    requireRole(req, ['admin'])
    const { id: noteId } = await req.json()
    await connectDB()
    await AdminNote.findByIdAndDelete(noteId)
    return ok({ deleted: true })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}
