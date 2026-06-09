'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react'
import { LogoIcon } from '@/components/Logo'
import CartButton from '@/components/CartButton'
import { fetchMe } from '@/lib/utils/authFetch'

const NAV_LINKS = [
  { label: 'Продукти', href: '/features' },
  { label: 'Каталог', href: '/catalog' },
  { label: 'Ціни', href: '/pricing' },
  { label: 'Docs', href: '/docs' },
]

interface Me { username: string; email: string; avatarUrl?: string; balance: number }

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [me, setMe] = useState<Me | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    fetchMe().then(d => { if (d) setMe(d as unknown as Me) })
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/v1/auth/logout', { method: 'POST' })
    localStorage.removeItem('ps_cart')
    window.dispatchEvent(new Event('cart-update'))
    setMe(null)
    setProfileOpen(false)
    router.push('/')
  }

  const initials = me?.username?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: scrolled ? 'rgba(6,6,6,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(32px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(32px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.045)' : 'none',
        transition: 'background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between gap-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <LogoIcon size={32} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            ProxyService
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {NAV_LINKS.map(link => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link key={link.href} href={link.href}
                style={{ fontSize: '13.5px', fontWeight: 500, color: active ? '#FFFFFF' : '#505050', letterSpacing: '-0.01em', transition: 'color 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={e => (e.currentTarget.style.color = active ? '#FFFFFF' : '#505050')}>
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <CartButton />

          {me ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px 4px 4px', borderRadius: '8px', background: profileOpen ? 'rgba(255,255,255,0.08)' : 'transparent', transition: 'background 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = profileOpen ? 'rgba(255,255,255,0.08)' : 'transparent')}
              >
                {me.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={me.avatarUrl} alt="" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#FFFFFF', color: '#000', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {initials}
                  </div>
                )}
                <span style={{ fontSize: '13px', color: '#CCCCCC', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {me.username}
                </span>
                <ChevronDown style={{ width: '12px', height: '12px', color: '#555' }} />
              </button>

              {profileOpen && (
                <div
                  style={{ position: 'absolute', right: 0, top: '42px', width: '200px', borderRadius: '12px', background: '#111', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 16px 48px rgba(0,0,0,0.7)', overflow: 'hidden', zIndex: 50, padding: '4px' }}
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <div style={{ padding: '10px 12px', marginBottom: '4px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>{me.username}</p>
                    <p style={{ fontSize: '11px', color: '#666', marginTop: '1px' }}>{me.email}</p>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#22C55E', marginTop: '5px', fontFamily: 'JetBrains Mono, monospace' }}>
                      ${me.balance?.toFixed ? me.balance.toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 0 4px' }} />
                  <Link href="/dashboard" onClick={() => setProfileOpen(false)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px', color: '#AAAAAA', cursor: 'pointer', transition: 'color 0.15s, background 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.color = '#AAAAAA'; (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
                      <LayoutDashboard style={{ width: '13px', height: '13px' }} /> Dashboard
                    </div>
                  </Link>
                  <button onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px', color: '#AAAAAA', transition: 'color 0.15s, background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.07)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#AAAAAA'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
                    <LogOut style={{ width: '13px', height: '13px' }} /> Вийти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <button style={{ fontSize: '13.5px', fontWeight: 500, color: '#CCCCCC', padding: '7px 14px', borderRadius: '8px', background: 'transparent', transition: 'color 0.15s ease, background 0.15s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#CCCCCC'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
                  Увійти
                </button>
              </Link>
              <Link href="/register">
                <button style={{ fontSize: '13.5px', fontWeight: 600, color: '#000', background: '#FFFFFF', padding: '7px 16px', borderRadius: '8px', letterSpacing: '-0.01em' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}>
                  Почати
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button className="md:hidden" onClick={() => setMobileOpen(v => !v)} style={{ color: '#CCCCCC', padding: '6px' }}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden" style={{ background: 'rgba(6,6,6,0.98)', backdropFilter: 'blur(32px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-0.5">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="py-3"
                style={{ fontSize: '15px', fontWeight: 500, color: pathname === link.href ? '#FFFFFF' : '#888', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'block' }}>
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-4 pb-1">
              {me ? (
                <>
                  <Link href="/dashboard" className="flex-1">
                    <button className="w-full py-2.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF' }}>Dashboard</button>
                  </Link>
                  <button className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }} onClick={handleLogout}>Вийти</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="flex-1">
                    <button className="w-full py-2.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }}>Увійти</button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <button className="w-full py-2.5 rounded-lg text-sm font-semibold" style={{ background: '#FFFFFF', color: '#000' }}>Реєстрація</button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
