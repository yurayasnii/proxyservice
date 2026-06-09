'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogoIcon } from '@/components/Logo'

import {
  LayoutDashboard, Globe, CreditCard, MessageSquare,
  Key, Settings, LogOut, Bell, Menu, X, ChevronDown, Check, ShieldAlert, Receipt, Download,
} from 'lucide-react'

interface Notification {
  _id: string; type: string; title: string; body: string; isRead: boolean; createdAt: string
  meta?: { orderId?: string; total?: number; ipCount?: number; productName?: string; duration?: string; quantity?: number }
}
interface Me {
  username: string; email: string; avatarUrl?: string; balance: number; role: string
}

const NAV_LABELS: Record<string, string> = {
  '/dashboard': 'Огляд',
  '/proxies':   'Проксі',
  '/billing':   'Оплата',
  '/support':   'Підтримка',
  '/api-keys':  'API Keys',
  '/settings':  'Налаштування',
  '/admin':     'Адмін',
}

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard },
  { href: '/proxies',   icon: Globe },
  { href: '/billing',   icon: CreditCard },
  { href: '/support',   icon: MessageSquare },
  { href: '/api-keys',  icon: Key },
  { href: '/settings',  icon: Settings },
]

const ADMIN_ITEMS = [
  { href: '/admin', icon: ShieldAlert },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [me, setMe] = useState<Me | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-refresh token if expired, then load me
    async function loadMe() {
      const res = await fetch('/api/v1/auth/me')
      if (res.ok) { const d = await res.json(); if (d.data) setMe(d.data); return }
      if (res.status === 401) {
        const ref = await fetch('/api/v1/auth/refresh', { method: 'POST' })
        if (ref.ok) { const d2 = await (await fetch('/api/v1/auth/me')).json(); if (d2.data) setMe(d2.data) }
        else router.push('/login')
      }
    }
    loadMe().catch(() => {})
    fetchNotifications()

    const es = new EventSource('/api/v1/notifications/stream')
    es.addEventListener('notification', (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.notification) {
          setNotifications(prev => [data.notification, ...prev])
          setUnreadCount(c => c + 1)
        }
      } catch {}
    })
    return () => es.close()
  }, [])

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/v1/notifications')
      const data = await res.json()
      if (data.success) { setNotifications(data.data.items ?? []); setUnreadCount(data.data.unreadCount ?? 0) }
    } catch {}
  }

  async function markAllRead() {
    await fetch('/api/v1/notifications', { method: 'PATCH' })
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  async function handleLogout() {
    await fetch('/api/v1/auth/logout', { method: 'POST' })
    localStorage.removeItem('ps_cart')
    window.dispatchEvent(new Event('cart-update'))
    router.push('/login')
  }

  const initials = me?.username?.slice(0, 2).toUpperCase() ?? '??'
  const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)'/%3E%3C/svg%3E")`

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#060606', position: 'relative', overflow: 'hidden' }}>

      {/* Grain overlay */}
      <div className="fixed pointer-events-none z-[1]" style={{ inset: '-50%', width: '200%', height: '200%', backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat', backgroundSize: '250px 250px', opacity: 0.03, animation: 'auth-grain 12s steps(1) infinite' }} />

      {/* Ambient glow blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div style={{ position: 'absolute', top: '-20%', left: '-15%', width: '55%', height: '55%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.055) 0%, transparent 65%)', animation: 'auth-glow-1 24s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 65%)', animation: 'auth-glow-2 30s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', top: '40%', left: '40%', width: '40%', height: '40%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.02) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-40"
        style={{
          position: 'relative', zIndex: 40,
          height: '56px',
          background: 'rgba(6,6,6,0.9)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderBottom: '1px solid rgba(255,255,255,0.20)',
        }}
      >
        <div className="max-w-screen-2xl mx-auto h-full px-5 flex items-center gap-5">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <LogoIcon size={28} />
            <span className="hidden sm:block" style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: '14px', letterSpacing: '-0.02em', color: '#FFFFFF',
            }}>
              ProxyService
            </span>
          </Link>

          {/* Separator */}
          <div className="hidden md:block h-4 w-px" style={{ background: 'rgba(255,255,255,0.30)' }} />

          {/* Desktop nav — text only, no pills */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_ITEMS.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '5px 10px',
                    borderRadius: '7px',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#FFFFFF' : '#3E3E3E',
                    background: active ? 'rgba(255,255,255,0.10)' : 'transparent',
                    transition: 'color 0.15s ease, background 0.15s ease',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#888' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#3E3E3E' }}
                >
                  <item.icon style={{ width: '13px', height: '13px', flexShrink: 0, opacity: active ? 1 : 0.5 }} />
                  {NAV_LABELS[item.href] ?? item.href}
                </Link>
              )
            })}
            {/* Admin link — only for admin role */}
            {me?.role === 'admin' && ADMIN_ITEMS.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '5px 10px',
                    borderRadius: '7px',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#EF4444' : '#EF444466',
                    background: active ? 'rgba(239,68,68,0.1)' : 'transparent',
                    transition: 'color 0.15s ease, background 0.15s ease',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#EF4444' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#EF444466' }}
                >
                  <item.icon style={{ width: '13px', height: '13px', flexShrink: 0, opacity: active ? 1 : 0.5 }} />
                  {NAV_LABELS[item.href] ?? item.href}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">

            {/* Buy CTA */}
            <Link href="/catalog" className="hidden sm:block">
              <button style={{
                fontSize: '12.5px', fontWeight: 600,
                color: '#000', background: '#FFFFFF',
                padding: '5px 14px', borderRadius: '7px',
                letterSpacing: '-0.01em',
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              >
                Купити проксі
              </button>
            </Link>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(o => !o); if (!notifOpen) fetchNotifications() }}
                style={{
                  position: 'relative',
                  width: '32px', height: '32px',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: unreadCount > 0 ? '#FFFFFF' : '#333',
                  background: notifOpen ? 'rgba(255,255,255,0.25)' : 'transparent',
                  transition: 'color 0.15s ease, background 0.15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = unreadCount > 0 ? '#FFFFFF' : '#333'; (e.currentTarget as HTMLButtonElement).style.background = notifOpen ? 'rgba(255,255,255,0.25)' : 'transparent' }}
              >
                <Bell style={{ width: '14px', height: '14px' }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '4px', right: '4px',
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: '#EF4444',
                    boxShadow: '0 0 0 2px #060606',
                  }} />
                )}
              </button>

              {notifOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '40px',
                  width: '300px', borderRadius: '12px',
                  background: '#0F0F0F',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.25), 0 16px 48px rgba(0,0,0,0.7)',
                  overflow: 'hidden', zIndex: 50,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.22)',
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Сповіщення</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#BBBBBB' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#444')}>
                        <Check style={{ width: '10px', height: '10px' }} /> Всі прочитані
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                        <Bell style={{ width: '20px', height: '20px', color: '#CCCCCC', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '12px', color: '#EEEEEE' }}>Немає сповіщень</p>
                      </div>
                    ) : notifications.slice(0, 10).map(n => (
                      <div key={n._id} style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: n.isRead ? 'transparent' : 'rgba(255,255,255,0.015)',
                        transition: 'background 0.12s',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                        onMouseLeave={e => (e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(255,255,255,0.015)')}>
                        {n.type === 'order_receipt' ? (
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Receipt style={{ width: '13px', height: '13px', color: '#22C55E' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                <p style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>{n.title}</p>
                                {!n.isRead && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />}
                              </div>
                              {n.meta && (
                                <>
                                  <p style={{ fontSize: '11.5px', color: '#CCCCCC', marginTop: '2px', fontWeight: 500 }}>{n.meta.productName}</p>
                                  <div style={{ display: 'flex', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                                    {n.meta.ipCount != null && (
                                      <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#22C55E', background: 'rgba(34,197,94,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                                        {n.meta.ipCount} IP
                                      </span>
                                    )}
                                    {n.meta.total != null && (
                                      <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#FFFFFF', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '4px' }}>
                                        -${n.meta.total.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                                <p style={{ fontSize: '10px', color: '#555' }}>
                                  {new Date(n.createdAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {n.meta?.orderId && (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      await fetch('/api/v1/auth/refresh', { method: 'POST' })
                                      window.open(`/api/v1/orders/${n.meta!.orderId}/receipt`, '_blank')
                                    }}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600, color: '#888', background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: '5px', border: 'none', cursor: 'pointer', transition: 'all 0.12s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)' }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#888'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}
                                  >
                                    <Download style={{ width: '9px', height: '9px' }} /> Чек
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {!n.isRead && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', flexShrink: 0, marginTop: '5px' }} />}
                            <div style={{ paddingLeft: n.isRead ? '13px' : 0 }}>
                              <p style={{ fontSize: '12px', fontWeight: 500, color: '#FFFFFF' }}>{n.title}</p>
                              <p style={{ fontSize: '11px', color: '#BBBBBB', marginTop: '2px' }}>{n.body}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '4px 8px 4px 4px',
                  borderRadius: '8px',
                  background: profileOpen ? 'rgba(255,255,255,0.25)' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = profileOpen ? 'rgba(255,255,255,0.25)' : 'transparent'}
              >
                {me?.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={me.avatarUrl} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: '#FFFFFF', color: '#000',
                    fontSize: '10px', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {initials}
                  </div>
                )}
                <span className="hidden lg:block" style={{ fontSize: '12.5px', color: '#DDDDDD', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {me?.username ?? '…'}
                </span>
                <ChevronDown style={{ width: '11px', height: '11px', color: '#DDDDDD', flexShrink: 0 }} />
              </button>

              {profileOpen && (
                <div
                  style={{
                    position: 'absolute', right: 0, top: '44px', width: '200px',
                    borderRadius: '12px',
                    background: '#0F0F0F',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.25), 0 16px 48px rgba(0,0,0,0.7)',
                    overflow: 'hidden', zIndex: 50,
                    padding: '4px',
                  }}
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <div style={{ padding: '10px 12px', marginBottom: '4px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>{me?.username}</p>
                    <p style={{ fontSize: '11px', color: '#EEEEEE', marginTop: '1px' }}>{me?.email}</p>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#22C55E', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace' }}>
                      ${typeof me?.balance === 'number' ? me.balance.toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.20)', margin: '0 0 4px' }} />
                  <Link href="/settings" onClick={() => setProfileOpen(false)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px', color: '#BBBBBB', cursor: 'pointer', transition: 'color 0.15s, background 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.20)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.color = '#444'; (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
                      <Settings style={{ width: '13px', height: '13px' }} />
                      Налаштування
                    </div>
                  </Link>
                  <button onClick={() => { setProfileOpen(false); handleLogout() }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px', color: '#BBBBBB', transition: 'color 0.15s, background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#444'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
                    <LogOut style={{ width: '13px', height: '13px' }} />
                    Вийти
                  </button>
                </div>
              )}
            </div>

            {/* Mobile burger */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(o => !o)}
              style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BBBBBB', borderRadius: '8px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#444'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              {mobileOpen ? <X style={{ width: '16px', height: '16px' }} /> : <Menu style={{ width: '16px', height: '16px' }} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '56px', zIndex: 50,
            background: '#080808',
            borderBottom: '1px solid rgba(255,255,255,0.20)',
            padding: '8px 16px 16px',
          }}>
            {[...NAV_ITEMS, ...(me?.role === 'admin' ? ADMIN_ITEMS : [])].map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              const isAdmin = item.href === '/admin'
              return (
                <Link key={item.href} href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '11px 12px', borderRadius: '8px',
                    fontSize: '14px', fontWeight: active ? 600 : 400,
                    color: active ? (isAdmin ? '#EF4444' : '#FFFFFF') : (isAdmin ? '#EF444466' : '#444'),
                    marginBottom: '2px',
                    background: active ? (isAdmin ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.22)') : 'transparent',
                  }}
                >
                  <item.icon style={{ width: '14px', height: '14px' }} />
                  {NAV_LABELS[item.href] ?? item.href}
                </Link>
              )
            })}
            <button onClick={handleLogout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 12px', borderRadius: '8px', fontSize: '14px', color: '#EEEEEE', marginTop: '4px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#333' }}
            >
              <LogOut style={{ width: '14px', height: '14px' }} />
              Вийти
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-5 py-6 page-enter" style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </main>
    </div>
  )
}
