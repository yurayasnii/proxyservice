import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/utils/jwt'

const PROTECTED_PATHS = ['/dashboard', '/proxies', '/billing', '/support', '/api-keys', '/settings']
const ADMIN_PATHS = ['/api/v1/admin']
const AUTH_PATHS = ['/login', '/register', '/reset-password']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p))
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p))

  const token = req.cookies.get('access_token')?.value

  if (isProtected || isAdmin) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    try {
      const payload = verifyAccessToken(token)
      if (isAdmin && payload.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
      }
      const res = NextResponse.next()
      res.headers.set('x-user-id', payload.userId)
      res.headers.set('x-user-role', payload.role)
      return res
    } catch {
      const response = NextResponse.redirect(new URL('/login', req.url))
      response.cookies.delete('access_token')
      response.cookies.delete('refresh_token')
      return response
    }
  }

  if (isAuth && token) {
    try {
      verifyAccessToken(token)
      return NextResponse.redirect(new URL('/dashboard', req.url))
    } catch {
      // Invalid token — proceed to auth page
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
