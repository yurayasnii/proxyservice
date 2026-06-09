import { NextRequest } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import SupportTicket from '@/lib/models/SupportTicket'
import { processTicketMessage } from '@/lib/services/ai-support'
import { requireAuth } from '@/lib/utils/auth'
import { ok, error, notFound, serverError, unauthorized } from '@/lib/utils/response'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const payload = requireAuth(req)
    const { id } = await params
    await connectDB()

    const ticket = await SupportTicket.findOne({ _id: id, userId: payload.userId })
    if (!ticket) return notFound('Ticket not found')

    return ok(ticket)
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}

const MessageSchema = z.object({
  message: z.string().min(1).max(2000),
})

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const payload = requireAuth(req)
    const { id } = await params
    const body = await req.json()

    // Close ticket action
    if (body.action === 'close') {
      await connectDB()
      const ticket = await SupportTicket.findOne({ _id: id, userId: payload.userId })
      if (!ticket) return notFound('Ticket not found')
      ticket.status = 'closed'
      await ticket.save()
      return ok({ status: 'closed' })
    }

    const parsed = MessageSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Validation error")

    await connectDB()

    const ticket = await SupportTicket.findOne({ _id: id, userId: payload.userId })
    if (!ticket) return notFound('Ticket not found')
    if (ticket.status === 'closed') return error('Ticket is closed')

    const aiResponse = await processTicketMessage(id, payload.userId, parsed.data.message)

    return ok({ aiResponse, ticket: await SupportTicket.findById(id) })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}
