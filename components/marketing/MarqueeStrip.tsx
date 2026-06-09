'use client'



import { useRef, useEffect } from 'react'

const ITEMS = [
  '5M+ IP-адрес',
  '195 країн',
  '99.9% uptime',
  'Миттєва активація',
  'No-logs policy',
  'HTTP · HTTPS · SOCKS5',
  'Residential · Datacenter · Mobile · ISP',
]

export default function MarqueeStrip() {
  
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let pos = 0
    let raf: number
    const half = el.scrollWidth / 2
    function step() {
      pos -= 0.5
      if (pos <= -half) pos = 0
      el!.style.transform = `translateX(${pos}px)`
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className="overflow-hidden py-4" style={{ background: '#060606' }}>
      {/* Gradient wave line above */}
      <div style={{
        height: '1px',
        marginBottom: '16px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 20%, rgba(255,255,255,0.30) 50%, rgba(255,255,255,0.10) 80%, transparent 100%)',
      }} />

      <div ref={trackRef} className="flex gap-0 w-max">
        {doubled.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                color: 'rgba(255,255,255,0.45)',
                padding: '0 28px',
              }}
            >
              {item}
            </span>
            {/* Dot separator */}
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
          </div>
        ))}
      </div>

      {/* Gradient wave line below */}
      <div style={{
        height: '1px',
        marginTop: '16px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 20%, rgba(255,255,255,0.30) 50%, rgba(255,255,255,0.10) 80%, transparent 100%)',
      }} />
    </div>
  )
}
