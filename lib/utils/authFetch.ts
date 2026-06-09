/**
 * Fetches /api/v1/auth/me with automatic token refresh.
 * If access_token is expired (401), tries to refresh via refresh_token,
 * then retries the me endpoint. Returns null if not authenticated.
 */
export async function fetchMe(): Promise<Record<string, unknown> | null> {
  const res = await fetch('/api/v1/auth/me')
  if (res.ok) {
    const data = await res.json()
    return data.data ?? null
  }

  if (res.status === 401) {
    // Try to refresh
    const refreshRes = await fetch('/api/v1/auth/refresh', { method: 'POST' })
    if (!refreshRes.ok) return null

    // Retry me with new token
    const retryRes = await fetch('/api/v1/auth/me')
    if (!retryRes.ok) return null
    const data = await retryRes.json()
    return data.data ?? null
  }

  return null
}

/**
 * Wrapper for authenticated API calls — auto-refreshes on 401.
 */
export async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init)
  if (res.status !== 401) return res

  // Try refresh
  const refreshRes = await fetch('/api/v1/auth/refresh', { method: 'POST' })
  if (!refreshRes.ok) return res

  // Retry original request
  return fetch(input, init)
}
