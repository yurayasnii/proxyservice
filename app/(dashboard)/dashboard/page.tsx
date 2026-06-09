'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Globe, CreditCard, TrendingUp, MessageSquare, Plus, Shield, Activity, Wifi, Server } from 'lucide-react'

interface Proxy {
  _id: string; host: string; port: number; protocol: string
  expiresAt: string; status: 'active' | 'expired' | 'suspended' | 'replacing'
  productId?: { name: string; countryName: string; countryCode: string; type: string }
}
interface Stats { activeProxies: number; balance: number; openTickets: number }

function useCountUp(target: number, duration = 900, delay = 0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    let raf: number
    const t = setTimeout(() => {
      let start: number | null = null
      function step(ts: number) {
        if (!start) start = ts
        const p = Math.min((ts - start) / duration, 1)
        setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target))
        if (p < 1) raf = requestAnimationFrame(step)
        else setVal(target)
      }
      raf = requestAnimationFrame(step)
    }, delay)
    return () => { clearTimeout(t); cancelAnimationFrame(raf) }
  }, [target, duration, delay])
  return val
}

// Animated SVG sparkline — draws progressively on mount
function Sparkline({ data, color = '#22C55E', height = 52 }: { data: number[]; color?: string; height?: number }) {
  const pathRef = useRef<SVGPathElement>(null)
  const [animated, setAnimated] = useState(false)
  const id = color.replace('#', 'g')
  const w = 260; const h = height
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 8) - 4}`)
  const path = `M${pts.join(' L')}`
  const area = `${path} L${w},${h} L0,${h} Z`

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const el = pathRef.current
    if (!el || !animated) return
    const len = el.getTotalLength()
    el.style.strokeDasharray = String(len)
    el.style.strokeDashoffset = String(len)
    el.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)'
    requestAnimationFrame(() => { el.style.strokeDashoffset = '0' })
  }, [animated])

  return (
    <svg width={w} height={h} style={{ overflow: 'visible', width: '100%' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} opacity={animated ? 1 : 0} style={{ transition: 'opacity 0.6s ease 0.8s' }} />
      <path ref={pathRef} d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

const MOCK_IPS  = [4,6,5,8,10,9,12,11,14,16,15,18,17,20,19,22,21,24,23,25]
const MOCK_TRAF = [2,5,4,8,12,10,18,15,22,28,24,32,30,38,35,42,40,45,43,50]
const TYPE_UK: Record<string, string> = { residential: 'Res', datacenter: 'DC', mobile: 'Mob', isp: 'ISP' }
const FILTERS = ['Всі', 'Активні', 'Спливають']

const PROXY_VISIBLE = 8

export default function DashboardPage() {
  const [stats, setStats]       = useState<Stats | null>(null)
  const [proxies, setProxies]   = useState<Proxy[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState(0)
  const [ready, setReady]       = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [pR, uR, tR] = await Promise.all([
          fetch('/api/v1/proxies?limit=50'), fetch('/api/v1/auth/me'), fetch('/api/v1/support/tickets'),
        ])
        const [pD, uD, tD] = await Promise.all([pR.json(), uR.json(), tR.json()])
        setProxies(pD.data?.items ?? [])
        setStats({
          activeProxies: pD.data?.total ?? 0,
          balance: uD.data?.balance ?? 0,
          openTickets: (tD.data?.items ?? []).filter((t: { status: string }) => t.status === 'open').length,
        })
      } finally { setLoading(false); setTimeout(() => setReady(true), 50) }
    }
    load()
  }, [])

  const proxiesCount = useCountUp(stats?.activeProxies ?? 0, 700, 300)
  const balanceVal   = useCountUp(Math.floor((stats?.balance ?? 0) * 100), 900, 400)
  const now = Date.now()

  const filtered = proxies.filter(p => {
    if (filter === 1) return p.status === 'active'
    if (filter === 2) return new Date(p.expiresAt).getTime() - now < 3 * 86400000
    return true
  })

  const enter = (delay = 0) => ({
    opacity: ready ? 1 : 0,
    transform: ready ? 'none' : 'translateY(12px)',
    transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  })

  const STATS = [
    { icon: Globe,         label: 'Проксі',  value: loading ? '—' : String(proxiesCount),              sub: 'активних' },
    { icon: CreditCard,    label: 'Баланс',  value: loading ? '—' : `$${(balanceVal/100).toFixed(2)}`, sub: 'доступно' },
    { icon: TrendingUp,    label: 'Витрати', value: loading ? '—' : '$0.00',                           sub: 'цього місяця' },
    { icon: MessageSquare, label: 'Тікети',  value: loading ? '—' : String(stats?.openTickets ?? 0),  sub: (stats?.openTickets ?? 0) > 0 ? 'потребують уваги' : 'все ок' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)', height: 'calc(100vh - 56px - 48px)' }}>

      {/* ── Row 1: Title + Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', flex: '0 0 auto', ...enter(0) }}>

        {/* Title cell */}
        <div style={{ background: '#060606', padding: '18px 20px', borderRight: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.06)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 0% 100%, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '10px', color: '#252525', letterSpacing: '0.22em' }}>01</span>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '28px', letterSpacing: '-0.03em', lineHeight: 1, color: '#FFFFFF', marginBottom: '2px' }}>
              ОГЛЯД
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.8)', animation: 'dot-breathe 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '10px', color: '#AAAAAA', fontWeight: 600, letterSpacing: '0.04em' }}>99.9% uptime</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: '#060606' }}>
          {STATS.map((s, i) => (
            <div key={s.label}
              style={{ padding: '18px 20px', borderLeft: '1px solid rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 40px rgba(255,255,255,0.015)', ...enter(80 + i * 70), transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${80 + i * 70}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${80 + i * 70}ms, box-shadow 0.3s ease, background 0.3s ease` }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'inset 0 0 60px rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.015)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'inset 0 0 40px rgba(255,255,255,0.015)'; (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', overflow: 'hidden' }}>
                <div style={{ width: '40%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)', animation: 'shimmer-flow 2s ease-in-out infinite alternate' }} />
              </div>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#AAAAAA' }}>{s.label}</span>
                <s.icon style={{ width: '11px', height: '11px', color: '#444' }} />
              </div>
              {loading
                ? <div className="skeleton" style={{ height: '28px', width: '70px', borderRadius: '5px', marginBottom: '5px' }} />
                : <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '28px', letterSpacing: '-0.04em', color: '#FFFFFF', lineHeight: 1, marginBottom: '4px' }}>{s.value}</p>
              }
              <p style={{ fontSize: '10px', color: '#666' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 2: Table + Right panel ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', flex: 1, minHeight: 0, ...enter(200) }}>

        {/* Proxy table */}
        <div style={{ background: '#060606', borderRight: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '10px', color: '#1E1E1E', letterSpacing: '0.2em' }}>02</span>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#AAAAAA' }}>Мої проксі</span>
            <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.03)', padding: '2px', borderRadius: '6px', marginLeft: '8px' }}>
              {FILTERS.map((l, i) => (
                <button key={l} onClick={() => setFilter(i)}
                  style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 500, color: filter === i ? '#FFFFFF' : '#383838', background: filter === i ? 'rgba(255,255,255,0.07)' : 'transparent', transition: 'all 0.15s' }}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Link href="/catalog">
                <button style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '26px', padding: '0 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: '#FFFFFF', color: '#000', letterSpacing: '-0.01em' }}>
                  <Plus style={{ width: '10px', height: '10px' }} /> Купити
                </button>
              </Link>
            </div>
          </div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 0.8fr 0.7fr 70px', padding: '7px 22px', borderBottom: '1px solid rgba(255,255,255,0.03)', flexShrink: 0 }}>
            {['Проксі', 'Країна', 'Тип', 'Протокол', 'Днів', ''].map(h => (
              <span key={h} style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555' }}>{h}</span>
            ))}
          </div>

          {/* Rows — internal scroll, page stays fixed */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 0.8fr 0.7fr 70px', padding: '11px 22px', borderBottom: '1px solid rgba(255,255,255,0.03)', gap: '8px', alignItems: 'center', opacity: 1 - i * 0.12 }}>
                  {[70, 55, 35, 40, 28, 50].map((w, j) => (
                    <div key={j} className="skeleton" style={{ height: '10px', width: `${w}%`, borderRadius: '4px' }} />
                  ))}
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px' }}>
                <Globe style={{ width: '18px', height: '18px', color: '#1C1C1C' }} />
                <p style={{ fontSize: '12px', color: '#888' }}>Проксі не знайдено</p>
                <Link href="/catalog">
                  <button style={{ height: '28px', padding: '0 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: '#888' }}>Купити перший</button>
                </Link>
              </div>
            ) : filtered.map((p, i) => {
              const days = Math.ceil((new Date(p.expiresAt).getTime() - now) / 86400000)
              const expiring = days <= 3
              const cc = p.productId?.countryCode?.toLowerCase() ?? 'un'
              return (
                <div key={p._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 0.8fr 0.7fr 70px', padding: '10px 22px', borderBottom: '1px solid rgba(255,255,255,0.03)', alignItems: 'center', transition: 'background 0.15s', animation: `stagger-in 0.4s cubic-bezier(0.16,1,0.3,1) ${Math.min(i,8) * 40}ms both` }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0, background: p.status === 'active' ? '#22C55E' : '#252525', boxShadow: p.status === 'active' ? '0 0 5px rgba(34,197,94,0.6)' : 'none' }} />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11.5px', color: '#CCCCCC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.host}:{p.port}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/flags/${cc}.png`} alt="" style={{ width: '14px', height: '10px', objectFit: 'cover', borderRadius: '1px', flexShrink: 0 }} onError={e => { e.currentTarget.style.display = 'none' }} />
                    <span style={{ fontSize: '11.5px', color: '#CCCCCC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.productId?.countryName ?? '—'}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#AAAAAA' }}>{TYPE_UK[p.productId?.type ?? ''] ?? '—'}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#AAAAAA', textTransform: 'uppercase' }}>{p.protocol}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: expiring ? '#CCCCCC' : '#383838', fontWeight: expiring ? 700 : 400 }}>{days}д</span>
                  <Link href="/billing">
                    <button style={{ height: '22px', padding: '0 9px', borderRadius: '5px', fontSize: '10px', fontWeight: 600, background: expiring ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', color: expiring ? '#CCCCCC' : '#444', transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = expiring ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)' }}>
                      Поновити
                    </button>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)', minHeight: 0, overflow: 'hidden' }}>

          {/* Chart 1 */}
          <div style={{ background: '#060606', flex: 1, padding: '10px 14px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 30px rgba(255,255,255,0.01)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 100% 0%, rgba(255,255,255,0.02) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '2px' }}>Активні IP</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '18px', letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1 }}>{loading ? '—' : String(proxiesCount)}</p>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#444', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>+12%</span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <Sparkline data={MOCK_IPS} color="#22C55E" height={28} />
            </div>
          </div>

          {/* Chart 2 */}
          <div style={{ background: '#060606', flex: 1, padding: '10px 14px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 100% 0%, rgba(99,102,241,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '2px' }}>Трафік (GB)</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '18px', letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1 }}>50.0</p>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#444', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>+8%</span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <Sparkline data={MOCK_TRAF} color="rgba(255,255,255,0.35)" height={28} />
            </div>
          </div>

          {/* Network */}
          <div style={{ background: '#060606', flex: 1, padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '9px', color: '#888', letterSpacing: '0.12em', textTransform: 'uppercase' }}>03 · Мережа</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 5px rgba(34,197,94,0.7)', animation: 'dot-breathe 2s ease-in-out infinite' }} />
                <span style={{ fontSize: '10px', color: '#22C55E', fontWeight: 600 }}>OK</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {[
                { name: 'Residential', v: 99.98, icon: Wifi },
                { name: 'Datacenter',  v: 99.99, icon: Server },
                { name: 'Mobile',      v: 99.91, icon: Activity },
                { name: 'ISP',         v: 99.97, icon: Shield },
              ].map(n => (
                <div key={n.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <n.icon style={{ width: '9px', height: '9px', color: '#444', flexShrink: 0 }} />
                  <span style={{ fontSize: '10.5px', color: '#AAAAAA', flex: 1 }}>{n.name}</span>
                  <div style={{ width: '44px', height: '1px', background: 'rgba(255,255,255,0.05)', position: 'relative', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${n.v}%`, background: 'rgba(255,255,255,0.3)' }} />
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9.5px', color: '#888', width: '36px', textAlign: 'right', flexShrink: 0 }}>{n.v}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
