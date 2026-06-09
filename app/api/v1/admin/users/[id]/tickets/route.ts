import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import SupportTicket from '@/lib/models/SupportTicket'
import { requireRole } from '@/lib/utils/auth'
import { ok, forbidden, serverError } from '@/lib/utils/response'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireRole(req, ['admin'])
    const { id } = await params
    await connectDB()

    const tickets = await SupportTicket.find({ userId: id })
      .sort({ createdAt: -1 })
      .select('category status messages createdAt updatedAt')
      .lean()

    return ok({ items: tickets })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}
