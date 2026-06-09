'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// High-quality B&W data center / network photo
const PHOTO_1 = '/photos/featuresgrid-banner.jpg'
const PHOTO_2 = '/photos/bandwidth-speed.jpg'
const PHOTO_3 = '/photos/bandwidth-latency.jpg'

const STATS = [
  { value: '‹$0.10', label: 'за 1 IP на місяць', sub: 'при великих обсягах' },
  { value: '10 Gbps', label: 'пропускна здатність', sub: 'datacenter мережа' },
  { value: '25%', label: 'знижка', sub: 'від 500+ одиниць' },
]

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

export default function BandwidthCalculator() {
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
        {/* Section header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#EEEEEE', letterSpacing: '0.2em' }}>06</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#BBBBBB', marginBottom: '20px' }}>Масштаб</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }} className="md:flex-row md:items-end md:justify-between">
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.9, letterSpacing: '-0.04em', color: '#FFFFFF' }}>
              Enterprise масштаб.<br />
              <span className="text-wave">Ціна стартапу.</span>
            </h2>
            <Link href="/pricing">
              <button style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 22px', borderRadius: '9px', background: 'rgba(255,255,255,0.06)', color: '#CCCCCC', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s, background 0.15s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#555'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}>
                Переглянути ціни →
              </button>
            </Link>
          </div>
        </div>

        {/* Photo + stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1px', background: 'rgba(255,255,255,0.05)' }} className="md:grid-cols-3">

          {/* Main photo — wide */}
          <div style={{ gridColumn: 'span 1', position: 'relative', overflow: 'hidden', minHeight: '320px' }} className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PHOTO_1}
              alt="Infrastructure"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'grayscale(1) brightness(0.4) contrast(1.2)', position: 'absolute', inset: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6,6,6,0.7) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: '32px', left: '32px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
                Global Network
              </p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '28px', letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1.1 }}>
                195 країн<br />5M+ IP-адрес
              </p>
            </div>
          </div>

          {/* Stats column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ background: '#060606', padding: '28px 28px', flex: 1 }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(24px,3vw,32px)', letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1, marginBottom: '6px' }}>
                  {s.value}
                </p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#EEEEEE', marginBottom: '3px' }}>{s.label}</p>
                <p style={{ fontSize: '11px', color: '#EEEEEE' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Second row — 2 photos + text */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1px', background: 'rgba(255,255,255,0.05)', marginTop: '1px' }} className="md:grid-cols-3">

          <div style={{ position: 'relative', overflow: 'hidden', minHeight: '240px', background: '#060606' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTO_2} alt="Speed"
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) brightness(0.35) contrast(1.2)', position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', bottom: '24px', left: '24px' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '4px', letterSpacing: '0.06em' }}>SPEED</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '32px', color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1 }}>10 Gbps</p>
            </div>
          </div>

          <div style={{ position: 'relative', overflow: 'hidden', minHeight: '240px', background: '#060606' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTO_3} alt="Global coverage"
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) brightness(0.3) contrast(1.3)', position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', bottom: '24px', left: '24px' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '4px', letterSpacing: '0.06em' }}>LATENCY</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '32px', color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1 }}>‹8ms</p>
            </div>
          </div>

          {/* CTA cell */}
          <div style={{ background: '#060606', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '240px' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#CCCCCC', lineHeight: 1.75 }}>
                Прозоре ціноутворення без прихованих платежів. Великі обсяги — більша знижка. Скасування в будь-який момент.
              </p>
            </div>
            <Link href="/catalog">
              <button style={{ width: '100%', height: '44px', borderRadius: '9px', background: '#FFFFFF', color: '#000', fontSize: '13.5px', fontWeight: 600, marginTop: '24px' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}>
                Обрати план
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
