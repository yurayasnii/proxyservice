'use client'

import { useRef, useEffect } from 'react'

const CITIES = [
  { x: 0.12, y: 0.38, label: 'NY' },   { x: 0.20, y: 0.45, label: 'US' },
  { x: 0.15, y: 0.55, label: 'LA' },   { x: 0.27, y: 0.60, label: 'BR' },
  { x: 0.45, y: 0.28, label: 'GB' },   { x: 0.49, y: 0.26, label: 'DE' },
  { x: 0.52, y: 0.30, label: 'FR' },   { x: 0.55, y: 0.25, label: 'NL' },
  { x: 0.58, y: 0.32, label: 'PL' },   { x: 0.60, y: 0.38, label: 'UA' },
  { x: 0.63, y: 0.28, label: 'SE' },   { x: 0.62, y: 0.44, label: 'TR' },
  { x: 0.67, y: 0.46, label: 'AE' },   { x: 0.70, y: 0.40, label: 'RU' },
  { x: 0.72, y: 0.52, label: 'IN' },   { x: 0.80, y: 0.38, label: 'CN' },
  { x: 0.83, y: 0.44, label: 'KR' },   { x: 0.85, y: 0.48, label: 'JP' },
  { x: 0.82, y: 0.58, label: 'SG' },   { x: 0.88, y: 0.64, label: 'AU' },
]

interface Packet {
  from: number
  to: number
  t: number
  speed: number
}

export default function NetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // Active connections (fixed pairs)
    const EDGES = [
      [0, 4], [0, 1], [1, 2], [2, 6], [4, 5], [5, 7], [6, 7],
      [7, 8], [8, 9], [9, 13], [13, 14], [14, 15], [15, 16],
      [16, 17], [17, 18], [18, 19], [0, 3], [3, 6], [10, 4],
      [10, 11], [11, 12], [12, 13],
    ]

    // Animated packets
    const packets: Packet[] = []
    let lastPacket = 0

    let raf: number
    let time = 0

    function draw() {
      const W = canvas!.offsetWidth
      const H = canvas!.offsetHeight
      time += 0.008

      ctx.clearRect(0, 0, W, H)

      // Resolve node positions
      const nodes = CITIES.map(c => ({
        x: c.x * W,
        y: c.y * H,
        label: c.label,
      }))

      // Draw edges
      EDGES.forEach(([a, b]) => {
        const na = nodes[a]; const nb = nodes[b]
        const dist = Math.hypot(nb.x - na.x, nb.y - na.y)
        const alpha = Math.max(0, 0.1 - dist / 3000)
        ctx.strokeStyle = `rgba(255,255,255,${alpha + 0.04})`
        ctx.lineWidth = 0.5
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(na.x, na.y)
        ctx.lineTo(nb.x, nb.y)
        ctx.stroke()
      })

      // Spawn packets
      const now = Date.now()
      if (now - lastPacket > 600 + Math.random() * 400) {
        const edge = EDGES[Math.floor(Math.random() * EDGES.length)]
        packets.push({ from: edge[0], to: edge[1], t: 0, speed: 0.006 + Math.random() * 0.006 })
        lastPacket = now
      }

      // Draw & advance packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i]
        p.t += p.speed
        if (p.t >= 1) { packets.splice(i, 1); continue }

        const na = nodes[p.from]; const nb = nodes[p.to]
        const px = na.x + (nb.x - na.x) * p.t
        const py = na.y + (nb.y - na.y) * p.t

        // Glow
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 5)
        grad.addColorStop(0, 'rgba(255,255,255,0.6)')
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(px, py, 5, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.beginPath()
        ctx.arc(px, py, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw nodes
      nodes.forEach((n, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(time * 2 + i * 0.7)

        // Outer glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 8)
        grad.addColorStop(0, `rgba(255,255,255,${0.08 + pulse * 0.06})`)
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(n.x, n.y, 8, 0, Math.PI * 2)
        ctx.fill()

        // Node dot
        ctx.fillStyle = `rgba(255,255,255,${0.35 + pulse * 0.25})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, 2.2, 0, Math.PI * 2)
        ctx.fill()

        // Label
        ctx.fillStyle = `rgba(255,255,255,${0.12 + pulse * 0.08})`
        ctx.font = '9px JetBrains Mono, monospace'
        ctx.fillText(n.label, n.x + 5, n.y - 4)
      })

      // Overlay: scrolling IP addresses at bottom
      ctx.font = '9px JetBrains Mono, monospace'
      const ipList = [
        '185.220.101.45', '91.108.4.22', '149.154.175.50',
        '203.177.84.12', '104.21.36.148', '172.64.153.17',
      ]
      ipList.forEach((ip, i) => {
        const xOffset = ((time * 18 + i * 130) % (W + 200)) - 100
        const alpha = 0.06
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fillText(ip, xOffset, H - 14)
      })

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
