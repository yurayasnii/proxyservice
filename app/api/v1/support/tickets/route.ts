import { NextRequest } from 'next/server'
import { z } from 'zod'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import SupportTicket from '@/lib/models/SupportTicket'
import { processTicketMessage } from '@/lib/services/ai-support'
import { requireAuth } from '@/lib/utils/auth'
import { ok, error, serverError, unauthorized } from '@/lib/utils/response'

const CreateTicketSchema = z.object({
  category: z.enum(['proxy_not_working', 'slow_speed', 'wrong_geo', 'payment_issue', 'refund_request', 'other']),
  message: z.string().min(1).max(2000),
  proxyId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const body = await req.json()
    const parsed = CreateTicketSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Validation error")

    const { category, message, proxyId } = parsed.data
    await connectDB()

    const ticket = await SupportTicket.create({
      userId: new mongoose.Types.ObjectId(payload.userId),
      proxyId: proxyId ? new mongoose.Types.ObjectId(proxyId) : undefined,
      category,
      status: 'open',
      messages: [],
      actions: [],
    })

    const aiResponse = await processTicketMessage(ticket._id.toString(), payload.userId, message)

    const updated = await SupportTicket.findById(ticket._id)
    return ok({ ticket: updated, aiResponse }, 201)
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    await connectDB()

    const tickets = await SupportTicket.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return ok({ items: tickets, total: tickets.length })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}
