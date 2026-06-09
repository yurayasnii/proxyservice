'use client'

import { useRef, useEffect } from 'react'

export default function ParticleWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let W = 0, H = 0, dpr = 1

    function resize() {
      dpr = window.devicePixelRatio || 1
      W = canvas!.offsetWidth
      H = canvas!.offsetHeight
      canvas!.width = W * dpr
      canvas!.height = H * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const COLS = 80
    const ROWS = 24
    let time = 0
    let raf: number

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#060606'
      ctx.fillRect(0, 0, W, H)

      const cellW = W / COLS
      const cellH = H / ROWS

      for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS; row++) {
          const x = col * cellW + cellW / 2
          const y = row * cellH + cellH / 2

          // Composite wave: two sine waves at different frequencies
          const wave1 = Math.sin(col * 0.3 - time * 1.4 + row * 0.2)
          const wave2 = Math.sin(col * 0.15 + time * 0.8 - row * 0.35)
          const wave = (wave1 + wave2) / 2  // -1 to 1

          // Map wave to opacity and size
          const t = (wave + 1) / 2          // 0..1
          const alpha = 0.04 + t * 0.28
          const r = 1 + t * 1.8

          ctx.fillStyle = `rgba(255,255,255,${alpha})`
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Subtle vignette
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, W * 0.7)
      vig.addColorStop(0, 'rgba(6,6,6,0)')
      vig.addColorStop(1, 'rgba(6,6,6,0.55)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, W, H)

      time += 0.022
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
