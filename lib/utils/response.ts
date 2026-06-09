import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/types'

export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status })
}

export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return ok(data, 201)
}

export function error(message: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function unauthorized(message = 'Unauthorized'): NextResponse<ApiResponse> {
  return error(message, 401)
}

export function forbidden(message = 'Forbidden'): NextResponse<ApiResponse> {
  return error(message, 403)
}

export function notFound(message = 'Not found'): NextResponse<ApiResponse> {
  return error(message, 404)
}

export function serverError(err: unknown): NextResponse<ApiResponse> {
  const message = err instanceof Error ? err.message : 'Internal server error'
  console.error('[API Error]', err)
  return error(message, 500)
}
