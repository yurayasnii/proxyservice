'use client'

import { useEffect, useRef, useState } from 'react'

const TESTIMONIALS = [
  {
    name: 'Alex Kovalenko', role: 'SEO Specialist', avatar: 'AK',
    text: 'Найкращий проксі-сервіс яким я користувався. підтримка вирішила проблему за 30 секунд.',
    rating: 5,
  },
  {
    name: 'Maria Schmidt', role: 'E-commerce Manager', avatar: 'MS',
    text: 'Residential проксі від ProxyService — топ. Жодного бана за 6 місяців роботи.',
    rating: 5,
  },
  {
    name: 'Viktor Petrov', role: 'Data Engineer', avatar: 'VP',
    text: 'Datacenter проксі з Франкфурту — швидкість вражає. Uptime 99.9% — перевірено особисто.',
    rating: 5,
  },
  {
    name: 'Emma Johnson', role: 'Digital Marketer', avatar: 'EJ',
    text: 'Криптооплата — великий плюс. Ніяких питань до конфіденційності. Проксі миттєво після оплати.',
    rating: 5,
  },
  {
    name: 'Дмитро Коваль', role: 'Sneaker Reseller', avatar: 'ДК',
    text: 'ISP проксі ідеальні для Adidas та Nike SNKRS. Жодного бана. Підтримка дуже допомагає.',
    rating: 5,
  },
  {
    name: 'Sarah Chen', role: 'Social Media Manager', avatar: 'SC',
    text: 'Rotate IP automatycznie co request. Niesamowite dla social media. Polecam każdemu!',
    rating: 5,
  },
]

function Stars({ n }: { n: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} style={{ color: '#F59E0B', fontSize: '11px' }}>★</span>
      ))}
    </div>
  )
}

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

export default function TestimonialsSection() {
  const { ref, on } = useReveal()

  return (
    <section ref={ref} className="py-16 md:py-28" style={{ background: '#060606' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-14">

        {/* Header */}
        <div className="mb-20"
          style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(28px)', transition: 'opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)' }}>
          <div className="flex items-center gap-4 mb-3">
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#EEEEEE', letterSpacing: '0.2em' }}>08</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#CCCCCC', marginBottom: '20px' }}>Відгуки</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(40px,6vw,80px)', lineHeight: .92, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Довіряють<br />
            <span className="text-wave">тисячі</span>
          </h2>
        </div>

        {/* Featured quote — large */}
        <div
          className="mb-16 pb-16"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(24px)',
            transition: 'opacity .8s cubic-bezier(.16,1,.3,1) .15s, transform .8s cubic-bezier(.16,1,.3,1) .15s',
          }}
        >
          <Stars n={5} />
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(22px,3.5vw,48px)', lineHeight: 1.15, letterSpacing: '-0.02em', color: '#FFFFFF', maxWidth: 900, marginTop: '20px' }}>
            &ldquo;{TESTIMONIALS[0].text}&rdquo;
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '28px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700,
              background: 'rgba(255,255,255,0.07)', color: '#FFFFFF',
            }}>
              {TESTIMONIALS[0].avatar}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{TESTIMONIALS[0].name}</p>
              <p style={{ fontSize: '12px', color: '#CCCCCC', marginTop: '1px' }}>{TESTIMONIALS[0].role}</p>
            </div>
          </div>
        </div>

        {/* Grid — with hover lift */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          {TESTIMONIALS.slice(1).map((t, i) => (
            <div
              key={t.name}
              className="card-lift"
              style={{
                background: '#060606',
                padding: '28px 28px',
                cursor: 'default',
                opacity: on ? 1 : 0,
                transform: on ? 'none' : 'translateY(20px)',
                transition: `
                  opacity .7s cubic-bezier(.16,1,.3,1) ${200 + i * 80}ms,
                  transform .7s cubic-bezier(.16,1,.3,1) ${200 + i * 80}ms,
                  box-shadow 0.22s ease,
                  background 0.18s ease
                `,
              }}
            >
              <Stars n={t.rating} />
              <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#CCCCCC', marginTop: '16px', marginBottom: '24px', fontStyle: 'italic' }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                  background: 'rgba(255,255,255,0.05)', color: '#DDDDDD',
                }}>
                  {t.avatar}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#CCCCCC' }}>{t.name}</p>
                  <p style={{ fontSize: '11px', color: '#BBBBBB', marginTop: '1px' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
