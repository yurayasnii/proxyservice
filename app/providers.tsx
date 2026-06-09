'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

function TokenRefreshInterceptor() {
  useEffect(() => {
    const originalFetch = window.fetch
    let refreshing: Promise<boolean> | null = null

    async function doRefresh(): Promise<boolean> {
      try {
        const res = await originalFetch('/api/v1/auth/refresh', { method: 'POST' })
        return res.ok
      } catch { return false }
    }

    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input
        : input instanceof URL ? input.href
        : (input as Request).url

      if (url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register')) {
        return originalFetch(input, init)
      }

      const res = await originalFetch(input, init)

      if (res.status === 401 && url.includes('/api/v1/')) {
        if (!refreshing) {
          refreshing = doRefresh().finally(() => { refreshing = null })
        }
        const refreshed = await refreshing
        if (refreshed) return originalFetch(input, init)
      }

      return res
    }

    return () => { window.fetch = originalFetch }
  }, [])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TokenRefreshInterceptor />
      {children}
    </SessionProvider>
  )
}
