'use client'



import { useEffect, useState, useRef } from 'react'

const INITIAL_REQUESTS = 2_847_234
const INITIAL_IPS      = 4_891_203

const NETWORKS = [
  { name: 'Residential', uptime: 99.98, latency: 18, freq: 0.055, amp: 0.28, noise: 0.15 },
  { name: 'Datacenter',  uptime: 99.99, latency: 4,  freq: 0.14,  amp: 0.18, noise: 0.04 },
  { name: 'Mobile',      uptime: 99.91, latency: 45, freq: 0.032, amp: 0.38, noise: 0.30 },
  { name: 'ISP',         uptime: 99.97, latency: 8,  freq: 0.10,  amp: 0.22, noise: 0.08 },
]

// ── Oscilloscope waveform ───────────────────────────────────────────────────

function WaveCanvas({ freq, amp, noise, active }: {
  freq: number; amp: number; noise: number; active: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offsetRef = useRef(0)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const W = canvas!.offsetWidth
      const H = canvas!.offsetHeight
      canvas!.width  = W * dpr
      canvas!.height = H * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    let raf: number
    // Stable pseudo-noise per column (pre-computed, reproducible)
    const noiseArr = Array.from({ length: 2000 }, (_, i) =>
      (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1
    )

    function draw() {
      const W = canvas!.offsetWidth
      const H = canvas!.offsetHeight
      ctx.clearRect(0, 0, W, H)

      const mid = H / 2
      const amplitude = H * amp

      // Fade gradient left→right (recent data brighter on right)
      const grad = ctx.createLinearGradient(0, 0, W, 0)
      grad.addColorStop(0,    'rgba(34,197,94,0)')
      grad.addColorStop(0.35, 'rgba(34,197,94,0.25)')
      grad.addColorStop(0.75, 'rgba(34,197,94,0.65)')
      grad.addColorStop(1,    'rgba(34,197,94,0.9)')

      ctx.beginPath()
      ctx.lineWidth   = 1.5
      ctx.strokeStyle = grad
      ctx.shadowColor = '#22C55E'
      ctx.shadowBlur  = 6

      for (let x = 0; x < W; x++) {
        const t = x + offsetRef.current
        const ni = (Math.floor(t / 6) + 1000) % noiseArr.length
        const n = (noiseArr[ni] - 0.5) * 2 * noise
        const y = mid + Math.sin(t * freq) * amplitude + n * H * 0.15

        if (x === 0) ctx.moveTo(x, y)
        else         ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Bright leading dot at the right edge
      const rightT = W + offsetRef.current
      const ni = (Math.floor(rightT / 6) + 1000) % noiseArr.length
      const n = (noiseArr[ni] - 0.5) * 2 * noise
      const dotY = mid + Math.sin(rightT * freq) * amplitude + n * H * 0.15

      ctx.beginPath()
      ctx.arc(W - 2, dotY, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = '#22C55E'
      ctx.shadowBlur = 12
      ctx.fill()

      offsetRef.current += 1.2
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [active, freq, amp, noise])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

// ── Count-up hook ───────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number, active: boolean) {
  const [val, setVal] = useState(0)
  const raf = useRef<number>(0)
  useEffect(() => {
    if (!active || !target) return
    let start: number | null = null
    function step(ts: number) {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 4)) * target))
      if (p < 1) raf.current = requestAnimationFrame(step)
      else setVal(target)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [active, target, duration])
  return val
}

// ── Flash number ────────────────────────────────────────────────────────────

function FlashNumber({ value, big }: { value: number; big?: boolean }) {
  const [flash, setFlash] = useState(false)
  const prev = useRef(value)
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value; setFlash(true)
      const t = setTimeout(() => setFlash(false), 280)
      return () => clearTimeout(t)
    }
  }, [value])
  return (
    <span style={{
      fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, lineHeight: 1,
      fontSize: big ? 'clamp(32px,4vw,52px)' : 'clamp(24px,3vw,40px)',
      letterSpacing: '-0.02em',
      color: flash ? 'rgba(255,255,255,0.6)' : '#FFFFFF',
      transform: flash ? 'scale(1.03)' : 'scale(1)',
      display: 'inline-block',
      transition: 'color 0.25s ease, transform 0.18s ease',
    }}>
      {value.toLocaleString('en')}
    </span>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function LiveStatus() {
  
  const [visible, setVisible]   = useState(false)
  const [phase, setPhase]       = useState<'counting' | 'live'>('counting')
  const [requests, setRequests] = useState(INITIAL_REQUESTS)
  const [ips, setIps]           = useState(INITIAL_IPS)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setPhase('live'), 1900)
    return () => clearTimeout(t)
  }, [visible])

  useEffect(() => {
    if (phase !== 'live') return
    const t = setInterval(() => {
      setRequests(r => r + Math.floor(Math.random() * 48 + 8))
      setIps(n => n + Math.floor(Math.random() * 4 - 1))
    }, 1800)
    return () => clearInterval(t)
  }, [phase])

  const animReq = useCountUp(INITIAL_REQUESTS, 1600, visible)
  const animIPs = useCountUp(INITIAL_IPS,      1900, visible)
  const displayReq = phase === 'live' ? requests : animReq
  const displayIPs = phase === 'live' ? ips       : animIPs

  return (
    <section ref={sectionRef} style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-14 py-20">

        {/* Live badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
          <div style={{ position: 'relative', width: '8px', height: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22C55E', opacity: 0.4, animation: 'pulse-ring 2s ease-out infinite' }} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#22C55E', letterSpacing: '0.04em' }}>Всі системи працюють</span>
          <span style={{ fontSize: '12px', color: '#AAAAAA', marginLeft: '4px' }}>· real-time</span>
        </div>

        {/* Counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', marginBottom: '56px' }} className="md:grid-cols-4">
          {[
            { label: 'Запитів оброблено', value: displayReq, big: true },
            { label: 'Активних IP',       value: displayIPs, big: true },
            { label: 'Серверів онлайн',   value: 1247,       big: false },
            { label: 'Країн доступних',   value: 195,        big: false },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding: '24px 0', paddingLeft: i > 0 ? '32px' : 0,
              borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)',
              transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms`,
            }}>
              <FlashNumber value={s.value} big={s.big} />
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AAAAAA', marginTop: '10px' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Network waveforms */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(12px)',
          transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s',
        }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#AAAAAA', marginBottom: '16px' }}>
            Стан мережі
          </p>

          <div>
            {NETWORKS.map((net, i) => (
              <div key={net.name} style={{
                display: 'grid', gridTemplateColumns: '130px 1fr auto', alignItems: 'center',
                gap: '16px', padding: '12px 0',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}>
                {/* Name + dot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#CCCCCC' }}>{net.name}</span>
                </div>

                {/* Waveform canvas */}
                <div style={{
                  height: '38px', borderRadius: '6px', overflow: 'hidden',
                  background: 'rgba(34,197,94,0.03)',
                }}>
                  <WaveCanvas freq={net.freq} amp={net.amp} noise={net.noise} active={visible} />
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#22C55E', opacity: 0.8 }}>
                    {net.uptime}%
                  </span>
                  <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#AAAAAA', minWidth: '32px', textAlign: 'right' }}>
                    {net.latency}ms
                  </span>
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />
          </div>
        </div>
      </div>
    </section>
  )
}
