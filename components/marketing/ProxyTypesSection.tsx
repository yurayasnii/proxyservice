'use client'



import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Home, Server, Smartphone, Zap, Check } from 'lucide-react'
import NetworkAnimation from './NetworkAnimation'

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect() } }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, on }
}

const PROXY_TYPES = [
  {
    id: 'residential',
    label: 'Residential',
    Icon: Home,
    photo: '/photos/proxy-residential.jpg',
    title: 'Residential Proxy',
    desc: 'Реальні IP-адреси від домашніх інтернет-провайдерів. Найвищий рівень довіри — ідеально для соціальних мереж, скрапінгу та верифікації реклами.',
    features: ['Реальні ISP IP', 'Rotating & Static', 'HTTP / HTTPS / SOCKS5', 'Без обмежень трафіку'],
    useCases: ['Social Media Automation', 'Web Scraping', 'Ad Verification', 'Brand Protection'],
    from: '3.99',
    stat: { label: 'Рівень довіри', value: 'Elite' },
  },
  {
    id: 'datacenter',
    label: 'Datacenter',
    Icon: Server,
    photo: '/photos/bandwidth-latency.jpg',
    title: 'Datacenter Proxy',
    desc: 'Виділені IP-адреси з дата-центрів. Максимальна швидкість і надійність для автоматизованих завдань та масштабного збору даних.',
    features: ['До 10 Gbps швидкість', 'Dedicated IP', 'Мінімальна затримка', '99.99% uptime SLA'],
    useCases: ['SEO Monitoring', 'Price Intelligence', 'Data Harvesting', 'Load Testing'],
    from: '1.99',
    stat: { label: 'Швидкість', value: '10 Gbps' },
  },
  {
    id: 'mobile',
    label: 'Mobile 4G/5G',
    Icon: Smartphone,
    photo: '/photos/proxy-mobile.jpg',
    title: 'Mobile Proxy',
    desc: 'Реальні мобільні IP-адреси на 4G/5G мережах. Найвищий рівень довіри для мобільних платформ та застосунків.',
    features: ['4G / 5G мережі', 'Real Mobile IP', 'Country targeting', 'Auto-rotate'],
    useCases: ['Mobile App Testing', 'Instagram Automation', 'TikTok Operations', 'Mobile Gaming'],
    from: '5.99',
    stat: { label: 'Мережа', value: '5G' },
  },
  {
    id: 'isp',
    label: 'ISP',
    Icon: Zap,
    photo: '/photos/bandwidth-speed.jpg',
    title: 'ISP Proxy',
    desc: 'Поєднання швидкості дата-центру з довірою residential IP. Ідеальне рішення для бізнесу та критичних операцій.',
    features: ['ISP-registered IP', 'Datacenter speed', 'Residential trust', 'Static IP'],
    useCases: ['Sneaker Copping', 'Ticket Purchasing', 'Account Management', 'E-commerce'],
    from: '4.49',
    stat: { label: 'Тип', value: 'Hybrid' },
  },
]

export default function ProxyTypesSection() {
  
  const [active, setActive] = useState('residential')
  const cur = PROXY_TYPES.find(t => t.id === active)!
  const { ref, on } = useReveal()

  return (
    <section className="py-16 md:py-28" style={{ background: '#0A0A0A' }} ref={ref}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-14">

        {/* Header */}
        <div
          className="mb-16"
          style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(28px)', transition: 'opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[11px] font-black tracking-[0.2em]" style={{ fontFamily: 'Syne, sans-serif', color: '#CCCCCC' }}>04</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] mb-5" style={{ color: '#DDDDDD' }}>Типи проксі</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(40px,6vw,80px)', lineHeight: .92, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Обери<br />
            <span className="text-wave">свій тип</span>
          </h2>
        </div>

        {/* Tabs — underline style, no borders */}
        <div className="flex flex-wrap gap-0 mb-12" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {PROXY_TYPES.map(t => {
            const isActive = t.id === active
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 relative"
                style={{ color: isActive ? '#FFFFFF' : '#3A3A3A' }}
              >
                <t.Icon className="w-3.5 h-3.5" style={{ opacity: isActive ? 1 : 0.4 }} />
                {t.label}
                {/* Underline indicator */}
                <div style={{
                  position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '1px',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  transition: 'background 0.2s ease',
                }} />
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Left — info */}
          <div>
            <h3
              className="text-2xl font-black tracking-tight mb-4"
              style={{ fontFamily: 'Syne, sans-serif', color: '#FFFFFF' }}
            >
              {cur.title}
            </h3>

            <p className="text-base mb-8 max-w-lg" style={{ color: '#CCCCCC', lineHeight: 1.75 }}>
              {cur.desc}
            </p>

            <div className="grid sm:grid-cols-2 gap-8 mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#DDDDDD' }}>
                  Характеристики
                </p>
                <ul className="space-y-3">
                  {cur.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#DDDDDD' }}>
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#BBBBBB' }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#DDDDDD' }}>
                  Use Cases
                </p>
                <ul className="space-y-3">
                  {cur.useCases.map(u => (
                    <li key={u} className="flex items-center gap-2.5 text-sm" style={{ color: '#CCCCCC' }}>
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#333' }} />
                      {u}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div>
                <p className="text-xs mb-1" style={{ color: '#DDDDDD' }}>Ціна від</p>
                <p className="text-3xl font-black tracking-tight"
                  style={{ fontFamily: 'Syne, sans-serif', color: '#FFFFFF' }}>
                  ${cur.from}
                  <span className="text-sm font-normal ml-1.5" style={{ color: '#EEEEEE' }}>/день</span>
                </p>
              </div>
              <Link href="/catalog">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity"
                  style={{ background: '#FFFFFF', color: '#000' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                >
                  Обрати план
                </button>
              </Link>
            </div>
          </div>

          {/* Right — animated network visualization */}
          <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '400px', background: '#080808' }}>
            <NetworkAnimation />

            {/* Gradient overlay at edges */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(8,8,8,0.6) 100%)',
            }} />
            <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(transparent, #080808)' }} />

            {/* Info overlay */}
            <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '4px' }}>
                    Active nodes
                  </p>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '32px', letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1 }}>
                    {cur.stat.value}
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '3px' }}>{cur.stat.label}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', animation: 'pulse-ring 2s ease-out infinite' }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>LIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
