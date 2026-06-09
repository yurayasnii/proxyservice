import { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/utils/jwt'
import { getTokenFromRequest } from '@/lib/utils/auth'
import { createRedisSubscriber } from '@/lib/utils/redis'
import Notification from '@/lib/models/Notification'
import { connectDB } from '@/lib/db/connect'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req)
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  let payload
  try {
    payload = verifyAccessToken(token)
  } catch {
    return new Response('Invalid token', { status: 401 })
  }

  const userId = payload.userId
  await connectDB()

  const encoder = new TextEncoder()
  let subscriber: ReturnType<typeof createRedisSubscriber> | null = null

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        } catch {
          // Connection closed
        }
      }

      // Send initial unread count
      const unread = await Notification.countDocuments({ userId, isRead: false })
      send('init', { unreadCount: unread })

      // Subscribe to Redis pub/sub
      subscriber = createRedisSubscriber()
      await subscriber.subscribe(`user:${userId}:events`)

      subscriber.on('message', async (_channel: string, message: string) => {
        try {
          const event = JSON.parse(message)
          send(event.type ?? 'event', event)
        } catch {
          send('event', { raw: message })
        }
      })

      // Heartbeat every 30s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          clearInterval(heartbeat)
        }
      }, 30000)

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        subscriber?.disconnect()
        controller.close()
      })
    },
    cancel() {
      subscriber?.disconnect()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
