'use client'



import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import Link from 'next/link'

const TYPES = [
  {
    id: 'residential',
    abbr: 'RES',
    name: 'Residential',
    tagline: 'Максимальна довіра',
    desc: 'Реальні домашні IP від ISP-провайдерів. Ідеально для соцмереж, скрапінгу та ad verification.',
    price: '$39',
    href: '/catalog?type=residential',
  },
  {
    id: 'datacenter',
    abbr: 'DC',
    name: 'Datacenter',
    tagline: 'Максимальна швидкість',
    desc: 'Серверні IP з мінімальною затримкою. Ідеально для SEO, парсингу великих обсягів даних.',
    price: '$25',
    href: '/catalog?type=datacenter',
  },
  {
    id: 'mobile',
    abbr: 'MOB',
    name: 'Mobile 4G/5G',
    tagline: 'Мобільна аудіторія',
    desc: '4G/5G мобільні IP операторів. Єдиний варіант для платформ що блокують десктопні IP.',
    price: '$80',
    href: '/catalog?type=mobile',
  },
  {
    id: 'isp',
    abbr: 'ISP',
    name: 'ISP',
    tagline: 'Швидкість + довіра',
    desc: 'Зареєстровані на ISP але в дата-центрі. Поєднує швидкість DC з рівнем довіри residential.',
    price: '$35',
    href: '/catalog?type=isp',
  },
]

const ROWS = [
  { label: 'Обхід anti-bot', values: [true, false, true, true] },
  { label: 'Геотаргетинг міста', values: [true, true, false, true] },
  { label: 'Sticky sessions', values: [true, true, true, true] },
  { label: 'Ротація per-request', values: [true, true, false, false] },
  { label: 'ASN IP-адреси', values: [false, false, false, true] },
  { label: 'Успішність запитів', values: ['99.9%', '98%', '99.5%', '99.9%'] },
  { label: 'Avg латентність', values: ['~80ms', '‹8ms', '~120ms', '‹15ms'] },
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

export default function ComparisonTable() {
  
  const { ref, on } = useReveal()

  return (
    <section ref={ref} style={{ background: '#060606' }}>
      <div
        className="max-w-7xl mx-auto px-6 md:px-14 py-28"
        style={{
          opacity: on ? 1 : 0,
          transform: on ? 'none' : 'translateY(24px)',
          transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Header */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-3">
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#EEEEEE', letterSpacing: '0.2em' }}>05</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#BBBBBB', marginBottom: '20px' }}>Порівняння</p>
          <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.9, letterSpacing: '-0.04em', color: '#FFFFFF' }}>
              Який тип<br />
              <span className="text-wave">підходить тобі?</span>
            </h2>
            <p style={{ fontSize: '13px', color: '#CCCCCC', maxWidth: '300px', lineHeight: 1.7 }}>
              Вибери тип проксі залежно від задачі. Кожен тип оптимізований для різних сценаріїв.
            </p>
          </div>
        </div>

        {/* Type cards + rows — horizontally scrollable on mobile */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginLeft: '-24px', marginRight: '-24px', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ minWidth: '640px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '1px' }}>
          {TYPES.map((t, i) => (
            <div
              key={t.id}
              style={{ background: '#060606', padding: '28px 24px 24px' }}
            >
              <div style={{ marginBottom: '20px' }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#AAAAAA',
                  display: 'block',
                  marginBottom: '8px',
                }}>
                  {t.abbr}
                </span>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '17px', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  {t.name}
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: '#CCCCCC', lineHeight: 1.7, marginBottom: '20px', minHeight: '60px' }}>
                {t.desc}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '28px', letterSpacing: '-0.03em', color: '#FFFFFF' }}>
                  {t.price}
                </span>
                <span style={{ fontSize: '11px', color: '#AAAAAA' }}>/міс</span>
              </div>
              <Link href={t.href}>
                <button style={{
                  width: '100%', height: '36px', borderRadius: '7px',
                  background: i === 0 ? '#FFFFFF' : 'rgba(255,255,255,0.05)',
                  color: i === 0 ? '#000' : '#444',
                  fontSize: '12.5px', fontWeight: 600,
                  transition: 'background 0.15s, color 0.15s',
                }}
                  onMouseEnter={e => {
                    if (i !== 0) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF' }
                    else (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'
                  }}
                  onMouseLeave={e => {
                    if (i !== 0) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = '#444' }
                    else (e.currentTarget as HTMLButtonElement).style.opacity = '1'
                  }}
                >
                  Обрати
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Feature rows */}
        {ROWS.map((row) => (
          <div
            key={row.label}
            className="group"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '1px', cursor: 'default' }}
          >
            {row.values.map((val, vi) => (
              <div
                key={vi}
                style={{
                  background: '#060606',
                  padding: '14px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.parentElement?.querySelectorAll('div').forEach(d => (d as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)') }}
                onMouseLeave={e => { e.currentTarget.parentElement?.querySelectorAll('div').forEach(d => (d as HTMLDivElement).style.background = '#060606') }}
              >
                {vi === 0 && (
                  <span style={{ fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.05em', color: '#AAAAAA', marginBottom: '4px', textTransform: 'uppercase' }}>
                    {row.label}
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', height: vi > 0 ? '36px' : undefined }}>
                  {typeof val === 'boolean' ? (
                    val
                      ? <Check style={{ width: '14px', height: '14px', color: '#22C55E' }} />
                      : <X style={{ width: '14px', height: '14px', color: '#DDDDDD' }} />
                  ) : (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 600, color: '#CCCCCC' }}>{val}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        </div>{/* end minWidth wrapper */}
        </div>{/* end scroll container */}

        {/* Bottom note */}
        <p style={{ fontSize: '11px', color: '#EEEEEE', marginTop: '28px', textAlign: 'center', letterSpacing: '0.02em' }}>
          Всі плани включають необмежений трафік · Активація до 30 секунд · Заміна проксі до 3 разів
        </p>
      </div>
    </section>
  )
}
