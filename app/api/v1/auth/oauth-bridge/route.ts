import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { signAccessToken, signRefreshToken } from '@/lib/utils/jwt'
import type { UserRole } from '@/types'

export async function GET(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  const email = session?.user?.email
  const role = (session?.user?.role as UserRole | undefined) ?? 'user'

  if (!userId || !email) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url))
  }

  const accessToken = signAccessToken({ userId, email, role })
  const refreshToken = signRefreshToken({ userId, email, role })

  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }

  const res = NextResponse.redirect(new URL('/dashboard', req.url))
  res.cookies.set('access_token', accessToken, { ...opts, maxAge: 15 * 60 })
  res.cookies.set('refresh_token', refreshToken, { ...opts, maxAge: 30 * 24 * 60 * 60 })
  return res
}
