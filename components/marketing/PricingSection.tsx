'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

const PLANS = [
  {
    name: 'Starter', desc: 'Для особистих проєктів',
    monthly: 19, yearly: 15,
    features: ['10 IP-адрес', '30 днів', 'HTTP / HTTPS', '1 країна', 'Email підтримка'],
    cta: 'Почати', href: '/catalog', highlight: false,
  },
  {
    name: 'Pro', desc: 'Для команд і бізнесу',
    monthly: 49, yearly: 39,
    features: ['50 IP-адрес', '30 днів', 'HTTP / HTTPS / SOCKS5', '5 країн', 'Підтримка 24/7', '3 заміни проксі'],
    cta: 'Почати', href: '/catalog', highlight: true,
  },
  {
    name: 'Business', desc: 'Для великих навантажень',
    monthly: 119, yearly: 95,
    features: ['200 IP-адрес', '30 днів', 'Всі протоколи', 'Всі країни', 'Пріоритетна підтримка', 'API доступ', 'Авто-поновлення'],
    cta: 'Почати', href: '/catalog', highlight: false,
  },
  {
    name: 'Enterprise', desc: 'Індивідуальні умови',
    monthly: null, yearly: null,
    features: ['Необмежено IP', 'Гнучкі умови', 'SLA 99.9%', 'Виділений менеджер', 'Кастомна інтеграція', 'White-label'],
    cta: "Зв'язатись", href: '/contact', highlight: false,
  },
]

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect() } }, { threshold: 0.06 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, on }
}

export default function PricingSection() {
  const [yearly, setYearly] = useState(false)
  const { ref, on } = useReveal()

  return (
    <section className="py-32" style={{ background: '#060606' }} ref={ref}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-14">

        {/* Header */}
        <div
          className="mb-20"
          style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(28px)', transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        >
          <div className="flex items-center gap-4 mb-3">
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#EEEEEE', letterSpacing: '0.2em' }}>07</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#CCCCCC', marginBottom: '20px' }}>Ціни</p>

          <div className="flex flex-col sm:flex-row sm:items-end gap-8 justify-between">
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(40px,6vw,80px)', lineHeight: 0.9, letterSpacing: '-0.04em', color: '#FFFFFF' }}>
              Прозорі<br />
              <span className="text-wave">ціни</span>
            </h2>

            {/* Toggle */}
            <div className="flex items-center gap-3 pb-1">
              <span style={{ fontSize: '13px', color: yearly ? '#444444' : '#FFFFFF', transition: 'color 0.2s' }}>Місяць</span>
              <button
                onClick={() => setYearly(v => !v)}
                style={{ width: '44px', height: '24px', borderRadius: '12px', background: yearly ? '#FFFFFF' : 'rgba(255,255,255,0.12)', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}
              >
                <div style={{ position: 'absolute', top: '4px', width: '16px', height: '16px', borderRadius: '50%', background: yearly ? '#000' : '#FFFFFF', transform: yearly ? 'translateX(24px)' : 'translateX(4px)', transition: 'transform 0.2s, background 0.2s' }} />
              </button>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '13px', color: yearly ? '#FFFFFF' : '#444444', transition: 'color 0.2s' }}>Рік</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#CCCCCC', background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: '4px' }}>−20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className="pricing-col"
              style={{
                padding: '40px 32px',
                background: plan.highlight ? '#0D0D0D' : 'transparent',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                position: 'relative',
                opacity: on ? 1 : 0,
                transform: on ? 'none' : 'translateY(24px)',
                transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms, background 0.18s ease`,
              }}
            >
              {plan.highlight && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.4)' }} />
              )}

              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#BBBBBB', marginBottom: '8px' }}>
                {plan.name}
              </p>
              <p style={{ fontSize: '13px', color: '#CCCCCC', marginBottom: '28px' }}>{plan.desc}</p>

              {plan.monthly ? (
                <div style={{ marginBottom: '36px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(44px,4vw,56px)', letterSpacing: '-0.04em', lineHeight: 1, color: '#FFFFFF' }}>
                      ${yearly ? plan.yearly : plan.monthly}
                    </span>
                    <span style={{ fontSize: '13px', color: '#CCCCCC', paddingBottom: '6px' }}>/міс</span>
                  </div>
                  {yearly && <p style={{ fontSize: '12px', color: '#CCCCCC', marginTop: '6px' }}>${(plan.yearly! * 12).toFixed(0)} на рік</p>}
                </div>
              ) : (
                <div style={{ marginBottom: '36px' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,3vw,48px)', letterSpacing: '-0.04em', lineHeight: 1, color: '#FFFFFF' }}>Custom</span>
                </div>
              )}

              <ul style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Check style={{ width: '13px', height: '13px', flexShrink: 0, color: '#CCCCCC' }} />
                    <span style={{ fontSize: '13px', color: '#CCCCCC' }}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <button
                  style={{
                    width: '100%', height: '40px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600,
                    background: plan.highlight ? '#FFFFFF' : 'rgba(255,255,255,0.06)',
                    color: plan.highlight ? '#000' : '#555',
                    border: 'none',
                    transition: 'opacity 0.15s, background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (plan.highlight) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'
                    else { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF' }
                  }}
                  onMouseLeave={e => {
                    if (plan.highlight) (e.currentTarget as HTMLButtonElement).style.opacity = '1'
                    else { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#555' }
                  }}
                >
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '12px', color: '#EEEEEE', marginTop: '40px', textAlign: 'center' }}>
          Всі плани включають необмежений трафік · Без прихованих платежів · Скасування в будь-який момент
        </p>
      </div>
    </section>
  )
}
