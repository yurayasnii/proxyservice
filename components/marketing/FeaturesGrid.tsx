'use client'



import { useEffect, useRef, useState } from 'react'
import ParticleWave from './ParticleWave'

const COUNTRIES = ['US', 'DE', 'GB', 'JP', 'SG', 'FR', 'AU', 'CA', 'KR', 'NL']

// Unicode symbols as visual icons — each picked for meaning
const SPECS = [
  { glyph: '⟳',  value: '‹30s',   label: 'Активація',    sub: 'від оплати до проксі' },
  { glyph: '◉',  value: '99.9%',  label: 'Uptime SLA',   sub: 'гарантовано' },
  { glyph: '◈',  value: '3',      label: 'Протоколи',    sub: 'HTTP · HTTPS · SOCKS5' },
  { glyph: '∞',  value: '24/7',   label: 'Підтримка',    sub: 'Цілодобова підтримка' },
  { glyph: '⊘',  value: 'ZERO',   label: 'Логи',         sub: 'no-logs policy' },
  { glyph: '⊕',  value: '195',    label: 'Країн',        sub: '5M+ IP-адрес' },
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

export default function FeaturesGrid() {
  
  const { ref, on } = useReveal()

  return (
    <section ref={ref} style={{ background: '#060606' }}>

      {/* ParticleWave banner — compact */}
      <div className="relative overflow-hidden" style={{ height: 'clamp(180px, 20vw, 300px)', background: '#060606' }}>
        <ParticleWave />
        <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
          style={{ background: 'linear-gradient(transparent, #060606)' }} />
        <div className="absolute inset-y-0 left-0 w-2/5 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(6,6,6,0.75), transparent)' }} />
        <div className="absolute bottom-8 left-8 md:left-14 z-10"
          style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(20px)', transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '8px' }}>
            Infrastructure · Frankfurt DE
          </p>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(32px,4.5vw,64px)', lineHeight: 0.9, letterSpacing: '-0.04em', color: '#FFFFFF' }}>
            5,000,000+<br />
            <span className="text-wave">IP-адрес</span>
          </div>
        </div>
      </div>

      {/* Section header */}
      <div className="max-w-7xl mx-auto px-6 md:px-14 pt-12 pb-8"
        style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(24px)', transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#EEEEEE', letterSpacing: '0.2em' }}>03</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
        </div>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#BBBBBB', marginBottom: '10px' }}>Можливості</p>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(28px,3.5vw,48px)', lineHeight: 0.95, letterSpacing: '-0.04em', color: '#FFFFFF' }}>
          Технологія <span className="text-wave">преміум-рівня</span>
        </h2>
      </div>

      {/* Unicode stat grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-14 pb-16">

        {/* Grid — outer border breathes as one unit, inner lines sync */}
        <div
          className="table-breathe"
          style={{
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '2px',
            overflow: 'hidden',
            opacity: on ? 1 : 0,
            transition: 'opacity 0.6s ease 0.3s',
          }}
        >

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0' }} className="sm:grid-cols-3 lg:grid-cols-6">
          {SPECS.map((s, i) => (
            <div
              key={s.label}
              className="table-cell-breathe"
              style={{
                padding: '28px 20px 24px',
                borderRight: (i + 1) % 6 !== 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                borderBottom: i < SPECS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                position: 'relative',
                opacity: on ? 1 : 0,
                transform: on ? 'none' : 'translateY(12px)',
                transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.08}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.08}s`,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Glyph */}
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '22px',
                color: 'rgba(255,255,255,0.15)',
                marginBottom: '12px',
                lineHeight: 1,
                transition: 'color 0.2s ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.15)')}
              >
                {s.glyph}
              </div>

              {/* Value */}
              <div style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(22px,2.5vw,32px)',
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                lineHeight: 1,
                marginBottom: '8px',
              }}>
                {s.value}
              </div>

              {/* Label */}
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#BBBBBB', marginBottom: '4px' }}>
                {s.label}
              </p>

              {/* Sub */}
              <p style={{ fontSize: '11px', color: '#DDDDDD', lineHeight: 1.4 }}>
                {s.sub}
              </p>

              {/* Corner decoration */}
              <div style={{
                position: 'absolute', bottom: '10px', right: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.04)',
                letterSpacing: '0.05em',
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* Country flags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '18px', opacity: on ? 1 : 0, transition: 'opacity 0.8s ease 0.9s' }}>
          {COUNTRIES.map(c => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'rgba(255,255,255,0.025)', borderRadius: '5px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/flags/${c.toLowerCase()}.png`} alt={c} style={{ width: '14px', height: '10px', objectFit: 'cover', borderRadius: '2px' }} />
              <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#BBBBBB' }}>{c}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', background: 'rgba(255,255,255,0.015)', borderRadius: '5px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#EEEEEE' }}>+185</span>
          </div>
        </div>
      </div>
    </section>
  )
}
