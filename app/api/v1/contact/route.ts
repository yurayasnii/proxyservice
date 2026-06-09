import { NextRequest } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { rateLimit } from '@/lib/utils/redis'
import { ok, error, serverError } from '@/lib/utils/response'

const resend = new Resend(process.env.RESEND_API_KEY)
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? 'support@proxyservice.io'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@proxyservice.io'

const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const { allowed } = await rateLimit(`contact:${ip}`, 5, 3600)
    if (!allowed) return error('Занадто багато запитів. Спробуйте пізніше.', 429)

    const body = await req.json()
    const parsed = ContactSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Помилка валідації')

    const { name, email, message } = parsed.data

    await resend.emails.send({
      from: FROM_EMAIL,
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `Контактна форма: ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 24px;">
          <h2 style="margin-bottom: 16px;">Нове повідомлення з сайту</h2>
          <p><strong>Ім'я:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;" />
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    })

    return ok({ message: 'Повідомлення надіслано' })
  } catch (err) {
    return serverError(err)
  }
}
