import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'ProxyService — Premium Proxy Network',
    template: '%s | ProxyService',
  },
  description: 'Premium proxy service with 5M+ IPs across 150+ countries. Buy residential, datacenter, mobile & ISP proxies with crypto payments and 24/7 support.',
  keywords: ['proxy', 'residential proxy', 'datacenter proxy', 'SOCKS5', 'anonymous proxy', 'buy proxy'],
  openGraph: {
    title: 'ProxyService — Premium Proxy Network',
    description: 'Buy residential, datacenter, mobile & ISP proxies with crypto. 24/7 support.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className="h-full" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased" style={{ background: '#0A0A12' }}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
