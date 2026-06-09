import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import Notification from '@/lib/models/Notification'
import { requireAuth } from '@/lib/utils/auth'
import { ok, serverError, unauthorized } from '@/lib/utils/response'

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    await connectDB()

    const notifications = await Notification.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    const unreadCount = await Notification.countDocuments({ userId: payload.userId, isRead: false })

    return ok({ items: notifications, unreadCount })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    await connectDB()

    await Notification.updateMany({ userId: payload.userId, isRead: false }, { isRead: true })
    return ok({ message: 'All notifications marked as read' })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}
