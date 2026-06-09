'use client'



import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const PHOTO = '/photos/cta-banner.jpg'

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect() } }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, on }
}

export default function CTABanner() {
  
  const { ref, on } = useReveal()

  return (
    <section ref={ref} className="relative overflow-hidden" style={{ minHeight: 'clamp(480px, 55vw, 760px)' }}>

      {/* B&W photo background */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PHOTO} alt="" className="w-full h-full object-cover"
          style={{ filter: 'grayscale(1) brightness(0.25) contrast(1.3)' }} />
      </div>

      {/* Overlays */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(6,6,6,0.97) 45%, rgba(6,6,6,0.6) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #060606 0%, transparent 50%)' }} />

      {/* Green glow */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at bottom left, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-14 flex flex-col justify-center h-full py-28">

        {/* Section header line */}
        <div style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(20px)', transition: 'opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)' }}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[11px] font-black tracking-[0.2em]" style={{ fontFamily: 'Syne, sans-serif', color: '#CCCCCC' }}>10</span>
            <div className="w-24 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] mb-8" style={{ color: '#DDDDDD' }}>Почати</p>
        </div>

        {/* Big headline */}
        <div style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(32px)', transition: 'opacity .9s cubic-bezier(.16,1,.3,1) .1s, transform .9s cubic-bezier(.16,1,.3,1) .1s' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(52px,8vw,120px)', lineHeight: .88, letterSpacing: '-0.04em', color: '#FFFFFF' }}>
            Готові<br />
            <span className="text-wave">почати?</span>
          </h2>
        </div>

        {/* Subtext */}
        <p className="text-base mt-8 mb-12 max-w-md" style={{ color: '#AAAAAA', lineHeight: 1.75,
          opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(20px)',
          transition: 'opacity .8s cubic-bezier(.16,1,.3,1) .25s, transform .8s cubic-bezier(.16,1,.3,1) .25s' }}>
          50,000+ клієнтів вже довіряють ProxyService.
          Перший проксі — за хвилину після реєстрації.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4"
          style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(20px)', transition: 'opacity .8s cubic-bezier(.16,1,.3,1) .38s, transform .8s cubic-bezier(.16,1,.3,1) .38s' }}>
          <Link href="/register">
            <button className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold transition-all"
              style={{ background: '#FFFFFF', color: '#000' }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'scale(0.97)' }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'scale(1)' }}>
              Почати безкоштовно
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/catalog">
            <button className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-medium transition-all"
              style={{ color: '#BBBBBB', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#FFF'; b.style.borderColor = 'rgba(255,255,255,0.28)' }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#444'; b.style.borderColor = 'rgba(255,255,255,0.1)' }}>
              Переглянути каталог
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
