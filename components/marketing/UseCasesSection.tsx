'use client'



import { useState, useEffect, useRef } from 'react'
import { Search, BarChart2, ShieldCheck, Globe2, Code2, TrendingUp } from 'lucide-react'
import DataStream from './DataStream'

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

const CASES = [
  {
    icon: Search,
    title: 'Веб-скрапінг',
    desc: 'Збирайте дані з будь-яких сайтів без блокувань. Ротація IP на кожен запит гарантує 99.9% успішних запитів.',
    metrics: [
      { label: 'Успішних запитів', value: '99.9%' },
      { label: 'Швидкість', value: '10Gbps' },
      { label: 'Anti-bot bypass', value: '✓' },
    ],
    photo: '/photos/proxy-residential.jpg',
    statLabel: 'Success Rate',
    statValue: '99.9%',
  },
  {
    icon: BarChart2,
    title: 'Price Monitoring',
    desc: 'Відстежуйте ціни конкурентів у реальному часі. Автоматичне сповіщення при зміні цін.',
    metrics: [
      { label: 'Сайтів одночасно', value: '10,000+' },
      { label: 'Затримка', value: '<50ms' },
      { label: 'Оновлення', value: '5 хв' },
    ],
    photo: '/photos/usecase-price.jpg',
    statLabel: 'Sites Monitored',
    statValue: '10K+',
  },
  {
    icon: ShieldCheck,
    title: 'Ad Verification',
    desc: 'Перевіряйте як виглядає ваша реклама в різних гео-локаціях. Виявляйте рекламне шахрайство.',
    metrics: [
      { label: 'Країн', value: '150+' },
      { label: 'Міст', value: '2,000+' },
      { label: 'Мобільних ISP', value: '50+' },
    ],
    photo: '/photos/usecase-ad.jpg',
    statLabel: 'Geo Locations',
    statValue: '150+',
  },
  {
    icon: Globe2,
    title: 'SEO Моніторинг',
    desc: 'Перевіряйте позиції у пошуковиках з різних локацій. Збирайте SERP-дані без блокувань.',
    metrics: [
      { label: 'Запитів/хв', value: '10,000' },
      { label: 'Пошуковиків', value: '12' },
      { label: 'Локальний SEO', value: '✓' },
    ],
    photo: '/photos/bandwidth-latency.jpg',
    statLabel: 'Requests / min',
    statValue: '10K',
  },
  {
    icon: Code2,
    title: 'Розробка та тестування',
    desc: 'Тестуйте геолокаційні функції вашого застосунку. Обходьте регіональні обмеження під час розробки.',
    metrics: [
      { label: 'Протоколів', value: '4' },
      { label: 'API endpoints', value: '12' },
      { label: 'SDK', value: '5 мов' },
    ],
    photo: '/photos/usecase-dev.jpg',
    statLabel: 'Languages',
    statValue: '5 SDK',
  },
  {
    icon: TrendingUp,
    title: 'Соцмережі',
    desc: 'Безпечне керування множинними акаунтами. Кожен акаунт отримує унікальний статичний IP.',
    metrics: [
      { label: 'Sticky sessions', value: '24 год' },
      { label: 'Унікальних IP', value: '5M+' },
      { label: 'ISP проксі', value: '✓' },
    ],
    photo: '/photos/proxy-mobile.jpg',
    statLabel: 'Unique IPs',
    statValue: '5M+',
  },
]

const CYCLE_MS = 4000

export default function UseCasesSection() {
  
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const startRef = useRef<number>(Date.now())
  const pausedRef = useRef(false)
  const c = CASES[active]
  const { ref, on } = useReveal()

  // Auto-cycle + progress bar
  useEffect(() => {
    if (!on) return
    startRef.current = Date.now()
    let raf: number

    function tick() {
      if (!pausedRef.current) {
        const elapsed = Date.now() - startRef.current
        const p = Math.min(elapsed / CYCLE_MS, 1)
        setProgress(p)
        if (p >= 1) {
          setActive(prev => (prev + 1) % CASES.length)
          startRef.current = Date.now()
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [on])

  function handleTabClick(i: number) {
    setActive(i)
    startRef.current = Date.now()
    setProgress(0)
  }

  return (
    <section className="py-16 md:py-28" style={{ background: '#060606' }} ref={ref}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-14">

        {/* Header */}
        <div className="mb-16"
          style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(28px)', transition: 'opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)' }}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[11px] font-black tracking-[0.2em]" style={{ fontFamily: 'Syne, sans-serif', color: '#CCCCCC' }}>05</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] mb-5" style={{ color: '#DDDDDD' }}>Застосування</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(40px,6vw,80px)', lineHeight: .92, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Для будь-якого<br />
            <span className="text-wave">завдання</span>
          </h2>
        </div>

        {/* Tabs — underline style with auto-progress, horizontal scroll on mobile */}
        <div
          className="mb-12"
          style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
        >
        <div
          className="flex gap-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', minWidth: 'max-content' }}
          onMouseEnter={() => { pausedRef.current = true; setPaused(true) }}
          onMouseLeave={() => { pausedRef.current = false; setPaused(false); startRef.current = Date.now() - progress * CYCLE_MS }}
        >
          {CASES.map((cs, i) => (
            <button
              key={cs.title}
              onClick={() => handleTabClick(i)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative"
              style={{ color: active === i ? '#FFFFFF' : '#3A3A3A' }}
            >
              <cs.icon className="w-3.5 h-3.5" style={{ opacity: active === i ? 1 : 0.35 }} />
              {cs.title}

              {/* Static underline for inactive, animated for active */}
              {active === i ? (
                <>
                  {/* Track */}
                  <div style={{
                    position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '1px',
                    background: 'rgba(255,255,255,0.12)',
                  }} />
                  {/* Progress fill */}
                  <div style={{
                    position: 'absolute', bottom: '-1px', left: 0, height: '1px',
                    width: `${progress * 100}%`,
                    background: '#FFFFFF',
                    transition: 'none',
                  }} />
                </>
              ) : (
                <div style={{
                  position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '1px',
                  background: 'transparent',
                }} />
              )}
            </button>
          ))}
        </div>
        </div>{/* end scroll */}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — info */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <c.icon className="w-6 h-6" style={{ color: '#DDDDDD' }} />
              </div>
              <h3 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#FFFFFF' }}>
                {c.title}
              </h3>
            </div>

            <p className="text-base mb-8 leading-relaxed max-w-lg" style={{ color: '#CCCCCC', lineHeight: 1.75 }}>
              {c.desc}
            </p>

            {/* Metrics — no borders, depth only */}
            <div className="grid grid-cols-3 gap-3">
              {c.metrics.map(m => (
                <div key={m.label} style={{ background: '#0A0A0A', borderRadius: '10px', padding: '16px 14px' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '20px', letterSpacing: '-0.02em', color: '#FFFFFF', marginBottom: '4px' }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: '11px', color: '#DDDDDD' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — data stream animation */}
          <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '340px', background: '#080808' }}>
            <DataStream />

            {/* Dark vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(8,8,8,0.15) 0%, rgba(8,8,8,0.7) 100%)',
            }} />

            {/* Centered stat overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {/* Label */}
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.28)',
                marginBottom: '12px',
              }}>
                {c.statLabel}
              </p>

              {/* Big value */}
              <p style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 900,
                fontSize: 'clamp(52px,7vw,80px)',
                letterSpacing: '-0.04em', lineHeight: 1,
                color: '#FFFFFF',
                textShadow: '0 0 60px rgba(255,255,255,0.25), 0 0 120px rgba(255,255,255,0.08)',
              }}>
                {c.statValue}
              </p>

              {/* LIVE indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em' }}>
                  LIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
