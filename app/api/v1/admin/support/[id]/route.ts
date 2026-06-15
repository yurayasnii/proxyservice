import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import SupportTicket from '@/lib/models/SupportTicket'
import { requireRole } from '@/lib/utils/auth'
import { ok, notFound, forbidden, serverError } from '@/lib/utils/response'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireRole(req, ['admin'])
    const { id } = await params
    await connectDB()

    const ticket = await SupportTicket.findByIdAndDelete(id)
    if (!ticket) return notFound('Ticket not found')

    return ok({ message: 'Тікет видалено' })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}
