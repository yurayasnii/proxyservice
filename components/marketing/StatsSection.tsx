'use client'



import { useEffect, useRef, useState } from 'react'

const FEATURES = [
  {
    num: '01',
    title: 'Глобальна мережа',
    desc: '195 країн, 5M+ унікальних IP-адрес від справжніх ISP-провайдерів по всьому світу.',
    stat: '5M+',
    statLabel: 'IP-адрес',
  },
  {
    num: '02',
    title: 'Швидкість до 10 Gbps',
    desc: 'Datacenter проксі з мінімальною затримкою та максимальною пропускною здатністю.',
    stat: '‹8ms',
    statLabel: 'Avg latency',
  },
  {
    num: '03',
    title: 'Повна анонімність',
    desc: 'Без логів, без відстеження. Ваші дані залишаються конфіденційними — гарантовано.',
    stat: '0',
    statLabel: 'Logs stored',
  },
  {
    num: '04',
    title: 'Підтримка 24/7',
    desc: 'Команда підтримки вирішує проблеми швидко — заміна проксі, повернення коштів, будь-яке питання.',
    stat: '‹5s',
    statLabel: 'Avg response',
  },
]

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect() } }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, on }
}

export default function StatsSection() {
  
  const { ref, on } = useReveal()

  return (
    <section className="py-16 md:py-28" style={{ background: '#060606' }} ref={ref}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-14">

        {/* Header */}
        <div className="mb-20"
          style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(32px)', transition: 'opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)' }}>
          <div className="flex items-center gap-4 mb-4">
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#EEEEEE', letterSpacing: '0.2em' }}>02</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#CCCCCC', marginBottom: '20px' }}>Переваги</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(40px,6vw,80px)', lineHeight: .92, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Чому<br />ProxyService
          </h2>
        </div>

        {/* Feature rows — with hover */}
        <div>
          {FEATURES.map((f, i) => (
            <div
              key={f.num}
              className="editorial-row"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.05)',
                opacity: on ? 1 : 0,
                transform: on ? 'none' : 'translateY(24px)',
                transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${150 + i * 100}ms, transform .7s cubic-bezier(.16,1,.3,1) ${150 + i * 100}ms, background 0.18s ease`,
              }}
            >
              <div className="editorial-accent" />
              <div className="grid grid-cols-[40px_1fr_auto] md:grid-cols-[60px_1fr_1fr_auto] items-center gap-6 md:gap-12 py-7 md:py-8 cursor-default">

                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#BBBBBB', letterSpacing: '0.1em', transition: 'color 0.18s' }}>
                  {f.num}
                </span>

                <h3
                  className="editorial-title"
                  style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(18px,2.2vw,26px)', color: '#CCCCCC', letterSpacing: '-0.02em', transition: 'color 0.18s' }}
                >
                  {f.title}
                </h3>

                <p className="hidden md:block text-sm leading-relaxed" style={{ color: '#CCCCCC' }}>
                  {f.desc}
                </p>

                <div className="text-right flex-shrink-0">
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(22px,2.8vw,36px)', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                    {f.stat}
                  </div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px', color: '#CCCCCC' }}>
                    {f.statLabel}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />
        </div>
      </div>
    </section>
  )
}
