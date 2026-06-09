'use client'



import { useEffect, useRef } from 'react'

const LOGOS = [
  { name: 'GitHub',    file: 'github-ffffff' },
  { name: 'Instagram', file: 'instagram-e4405f' },
  { name: 'TikTok',    file: 'tiktok-ffffff' },
  { name: 'YouTube',   file: 'youtube-ff0000' },
  { name: 'Discord',   file: 'discord-5865f2' },
  { name: 'Shopify',   file: 'shopify-96bf48' },
  { name: 'Pinterest', file: 'pinterest-e60023' },
  { name: 'eBay',      file: 'ebay-e53238' },
  { name: 'Netflix',   file: 'netflix-e50914' },
  { name: 'Telegram',  file: 'telegram-26a5e4' },
  { name: 'Notion',    file: 'notion-ffffff' },
  { name: 'Figma',     file: 'figma-f24e1e' },
  { name: 'Stripe',    file: 'stripe-635bff' },
  { name: 'Amazon',    file: 'amazon-ff9900' },
  { name: 'Reddit',    file: 'reddit-ff4500' },
  { name: 'Airbnb',    file: 'airbnb-ff5a5f' },
  { name: 'X',         file: 'x-ffffff' },
  { name: 'Twitch',    file: 'twitch-9146ff' },
]

export default function TrustedBy() {
  
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let pos = 0
    let raf: number
    const half = el.scrollWidth / 2

    function step() {
      pos += 0.45
      if (pos >= half) pos = 0
      el!.style.transform = `translateX(${-pos}px)`
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  const doubled = [...LOGOS, ...LOGOS]

  return (
    <section className="py-14 overflow-hidden" style={{ background: '#060606' }}>
      <p style={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: '#AAAAAA',
        textAlign: 'center', marginBottom: '32px',
      }}>
        Використовується для роботи з популярними платформами
      </p>

      <div
        style={{
          maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <div ref={trackRef} style={{ display: 'flex', gap: '14px', width: 'max-content' }}>
          {doubled.map((logo, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 26px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.10)',
                flexShrink: 0,
                minWidth: '100px',
                animation: `chip-breathe 3.5s ease-in-out ${(i * 180) % 3200}ms infinite`,
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                background: 'rgba(255,255,255,0.85)',
                WebkitMaskImage: `url('/icons/${logo.file}.svg')`,
                maskImage: `url('/icons/${logo.file}.svg')`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.75)',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}>
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
