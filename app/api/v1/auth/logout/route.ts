import { cookies } from 'next/headers'
import { ok } from '@/lib/utils/response'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  cookieStore.delete('authjs.session-token')
  cookieStore.delete('authjs.csrf-token')
  cookieStore.delete('authjs.callback-url')
  return ok({ message: 'Logged out' })
}
