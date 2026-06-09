'use client'

import { useRef, useEffect } from 'react'

const TOKENS = [
  '185.220.101.45', '91.108.4.22', '149.154.175.50', '203.177.84.12',
  '104.21.36.148', '172.64.153.17', '208.67.222.222', '1.1.1.1',
  'US', 'DE', 'JP', 'SG', 'AU', 'GB', 'NL', 'FR', 'CA', 'KR',
  '99.9%', '10Gbps', '‹8ms', 'HTTPS', 'SOCKS5', '195', '5M+',
  'residential', 'datacenter', 'mobile', 'isp',
  'GET 200', 'POST 200', 'CONNECT', 'AUTH OK', 'ROTATE',
  '2847253', '4891204', '1247', 'proxy_ok', 'session_id',
]

interface Column {
  x: number
  tokens: string[]
  y: number
  speed: number
  alpha: number
  spacing: number
  fontSize: number
}

export default function DataStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let W = 0, H = 0
    const cols: Column[] = []

    function buildCols() {
      const dpr = window.devicePixelRatio || 1
      W = canvas!.offsetWidth
      H = canvas!.offsetHeight
      canvas!.width = W * dpr
      canvas!.height = H * dpr
      ctx.scale(dpr, dpr)

      cols.length = 0
      const NUM = Math.floor(W / 90) + 1
      for (let i = 0; i < NUM; i++) {
        const tokens: string[] = []
        const len = 8 + Math.floor(Math.random() * 10)
        for (let j = 0; j < len; j++) {
          tokens.push(TOKENS[Math.floor(Math.random() * TOKENS.length)])
        }
        cols.push({
          x: (i / NUM) * W + (Math.random() * W / NUM),
          tokens,
          y: -Math.random() * H * 1.5,
          speed: 0.35 + Math.random() * 0.55,
          alpha: 0.04 + Math.random() * 0.12,
          spacing: 16 + Math.random() * 10,
          fontSize: 9 + Math.random() * 3,
        })
      }
    }
    buildCols()
    window.addEventListener('resize', buildCols)

    let raf: number

    function draw() {
      ctx.fillStyle = 'rgba(8,8,8,0.22)'
      ctx.fillRect(0, 0, W, H)

      cols.forEach(col => {
        ctx.font = `${col.fontSize}px JetBrains Mono, monospace`

        col.tokens.forEach((token, i) => {
          const ty = col.y + i * col.spacing
          if (ty < -20 || ty > H + 20) return

          // Fade by vertical position — head is brighter
          const headDist = Math.abs(col.y + col.tokens.length * col.spacing - ty) / (col.tokens.length * col.spacing)
          const alpha = col.alpha * (1.2 - headDist * 0.8)
          ctx.fillStyle = `rgba(255,255,255,${Math.max(0, alpha)})`
          ctx.fillText(token, col.x, ty)
        })

        col.y += col.speed
        if (col.y > H + col.tokens.length * col.spacing) {
          col.y = -col.tokens.length * col.spacing - Math.random() * H * 0.5
          col.speed = 0.35 + Math.random() * 0.55
        }
      })

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', buildCols)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
