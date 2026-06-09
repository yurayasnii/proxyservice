import { NextRequest } from 'next/server'
import { verifyAccessToken } from './jwt'
import type { JWTPayload, UserRole } from '@/types'

export function getTokenFromRequest(req: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Fall back to cookie
  const cookie = req.cookies.get('access_token')
  return cookie?.value ?? null
}

export function requireAuth(req: NextRequest): JWTPayload {
  const token = getTokenFromRequest(req)
  if (!token) throw new Error('No token provided')
  return verifyAccessToken(token)
}

export function requireRole(req: NextRequest, roles: UserRole[]): JWTPayload {
  const payload = requireAuth(req)
  if (!roles.includes(payload.role)) {
    throw new Error('Insufficient permissions')
  }
  return payload
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}
