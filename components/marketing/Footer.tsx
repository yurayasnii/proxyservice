'use client'



import Link from 'next/link'
import { LogoIcon } from '@/components/Logo'

const LINKS = {
  Продукт: [
    { label: 'Residential', href: '/catalog?type=residential' },
    { label: 'Datacenter',  href: '/catalog?type=datacenter' },
    { label: 'Mobile',      href: '/catalog?type=mobile' },
    { label: 'ISP',         href: '/catalog?type=isp' },
    { label: 'Ціни',        href: '/pricing' },
  ],
  Компанія: [
    { label: 'Про нас',            href: '/about' },
    { label: 'Умови',              href: '/terms' },
    { label: 'Приватність',        href: '/privacy' },
    { label: 'Контакти',           href: '/contact' },
  ],
  Ресурси: [
    { label: 'API Docs', href: '/docs' },
    { label: 'Статус',   href: '/status' },
    { label: 'Блог',     href: '/blog' },
    { label: 'Функції',  href: '/features' },
  ],
}

const PAYMENTS = ['BTC', 'ETH', 'USDT', 'VISA', 'MC']

export default function Footer() {
  
  return (
    <footer style={{ background: '#030303' }}>
      {/* Top divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <LogoIcon size={32} />
              <span style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: '15px',
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
              }}>
                ProxyService
              </span>
            </Link>
            <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#CCCCCC', maxWidth: '220px' }}>
              Premium proxy network. 5M+ IPs across 195 countries. Instant delivery.
            </p>
            <div className="flex gap-2 flex-wrap mt-6">
              {PAYMENTS.map(p => (
                <span
                  key={p}
                  style={{
                    fontSize: '10px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: '#CCCCCC',
                    padding: '3px 8px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '4px',
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <p style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#CCCCCC',
                marginBottom: '20px',
              }}>
                {group}
              </p>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{ fontSize: '13px', color: '#CCCCCC', transition: 'color 0.15s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#CCCCCC')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#555555')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-3 mt-16 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <p style={{ fontSize: '12px', color: '#CCCCCC' }}>
            © {new Date().getFullYear()} ProxyService
          </p>
          <p style={{ fontSize: '12px', color: '#555555' }}>
            Built by · Full-Stack Developer · Next.js · MongoDB · Node.js
          </p>
        </div>
      </div>
    </footer>
  )
}
