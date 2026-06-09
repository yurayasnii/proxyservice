'use client'



import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    title: 'Обери план',
    desc: 'Обери тип проксі, країну та тривалість. Порівняй плани та знайди ідеальний варіант для своїх задач.',
    tag: 'Каталог',
    href: '/catalog',
  },
  {
    num: '02',
    title: 'Сплати крипто або карткою',
    desc: 'BTC, ETH, USDT, TON через NOWPayments. Або карткою через Stripe. QR-код, адреса гаманця, таймер 15 хв.',
    tag: 'Оплата',
    href: '/billing',
  },
  {
    num: '03',
    title: 'Отримай проксі миттєво',
    desc: 'Одразу після підтвердження — credentials у кабінеті. Імпорт в один клік. Жодної ручної обробки.',
    tag: '‹30 секунд',
    href: '/proxies',
  },
]

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, on }
}

export default function HowItWorks() {
  
  const { ref, on } = useReveal()

  return (
    <section ref={ref} className="py-16 md:py-28" style={{ background: '#080808' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-14">

        {/* Header */}
        <div className="mb-20"
          style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(28px)', transition: 'opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)' }}>
          <div className="flex items-center gap-4 mb-3">
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#EEEEEE', letterSpacing: '0.2em' }}>06</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#CCCCCC', marginBottom: '20px' }}>Як це працює</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(40px,6vw,80px)', lineHeight: .92, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
              Три кроки<br />
              <span className="text-wave">до старту</span>
            </h2>
            <Link href="/register">
              <button
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', background: '#FFFFFF', color: '#000', fontSize: '13.5px', fontWeight: 600, flexShrink: 0 }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              >
                Почати зараз <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            </Link>
          </div>
        </div>

        {/* Steps — with hover */}
        <div>
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className="editorial-row"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.05)',
                opacity: on ? 1 : 0,
                transform: on ? 'none' : 'translateY(24px)',
                transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${i * 120}ms, transform .7s cubic-bezier(.16,1,.3,1) ${i * 120}ms, background 0.18s ease`,
              }}
            >
              <div className="editorial-accent" />
              <div className="grid grid-cols-[1fr_auto] md:grid-cols-[80px_1fr_1fr_auto] items-start md:items-center gap-6 md:gap-12 py-8 md:py-10">

                {/* Step number */}
                <div className="hidden md:block"
                  style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#BBBBBB', letterSpacing: '0.1em' }}>
                  {s.num}
                </div>

                {/* Title */}
                <h3
                  className="editorial-title"
                  style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(20px,2.5vw,32px)', color: '#CCCCCC', letterSpacing: '-0.02em', lineHeight: 1.1, transition: 'color 0.18s' }}
                >
                  {s.title}
                </h3>

                {/* Desc */}
                <p className="hidden md:block text-sm leading-relaxed" style={{ color: '#CCCCCC', maxWidth: 360 }}>
                  {s.desc}
                </p>

                {/* Tag — monochrome */}
                <div className="flex-shrink-0 self-start md:self-auto">
                  <span style={{
                    padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600,
                    background: 'rgba(255,255,255,0.06)', color: '#DDDDDD',
                    display: 'inline-block',
                    transition: 'background 0.18s, color 0.18s',
                  }}>
                    {s.tag}
                  </span>
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
