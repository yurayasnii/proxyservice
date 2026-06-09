import { NextRequest } from 'next/server'
import { verifyRefreshToken, signAccessToken } from '@/lib/utils/jwt'
import { ok, error, serverError } from '@/lib/utils/response'

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value
    if (!refreshToken) return error('No refresh token', 401)

    const payload = verifyRefreshToken(refreshToken)
    const accessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    })

    const response = ok({ accessToken })
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
    })
    return response
  } catch {
    return error('Invalid or expired refresh token', 401)
  }
}
