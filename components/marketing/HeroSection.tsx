'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'



const STATS = [
  { val: '5M+',   uk: 'IP-адрес', en: 'IP Addresses' },
  { val: '195',   uk: 'Країн',    en: 'Countries' },
  { val: '99.9%', uk: 'Uptime',   en: 'Uptime' },
  { val: '‹20ms', uk: 'Avg ping', en: 'Avg ping' },
]

// Country coverage dots: [lat, lon, animDur, animDelay]
const RAW_COUNTRIES: [number, number, number, number][] = [
  [64,-22,4.2,0.3],[71,26,3.8,1.2],[62,10,4.5,0.7],[59,18,3.3,2.1],[62,25,5.0,0.0],[56,10,4.7,3.2],
  [54,-2,3.6,1.8],[53,-8,5.2,0.4],[52,5,4.0,2.6],[51,4,3.5,1.0],[47,8,4.3,0.9],[47,2,3.9,2.3],
  [40,-4,4.6,1.5],[39,-8,5.1,3.5],[43,12,3.7,0.2],[36,14,5.3,4.2],
  [51,10,4.4,1.3],[50,15,3.6,2.8],[48,20,4.8,0.6],[47,19,5.0,3.1],[47,14,3.4,1.9],[52,20,4.2,0.5],
  [44,17,5.5,2.4],[44,21,4.0,1.0],[43,25,3.8,3.6],[46,25,4.7,0.8],[41,22,5.2,2.0],[41,20,3.5,4.5],
  [43,19,4.9,1.4],[45,16,4.3,0.1],[46,15,5.6,3.0],[39,22,4.1,2.2],[35,33,5.4,0.7],[47,29,4.6,1.6],
  [49,32,5.0,0.3],[53,28,3.7,2.7],[56,24,4.4,1.1],[57,25,5.1,3.4],[55,37,4.8,1.7],[55,60,3.6,4.1],
  [57,83,5.3,2.5],[53,107,4.0,0.6],
  [39,35,4.7,1.3],[37,43,3.4,3.7],[42,43,5.6,0.4],[40,45,4.2,2.9],
  [35,38,3.8,1.5],[34,36,5.0,0.2],[32,35,4.5,3.3],[33,44,3.6,1.9],[33,53,4.9,0.8],[37,58,3.3,2.4],
  [29,47,5.2,1.2],[24,45,4.0,3.8],[25,51,3.7,0.5],[24,54,5.1,1.0],[21,57,4.3,3.2],[15,44,3.9,0.7],[12,44,5.4,2.6],
  [48,68,4.7,1.4],[41,64,3.5,3.0],[39,71,4.1,0.3],[43,78,5.5,1.8],[34,65,4.8,2.7],
  [30,70,3.6,0.9],[28,77,5.0,3.5],[22,78,4.3,1.1],[13,78,3.8,2.3],[7,81,5.2,0.6],[28,84,4.6,3.8],[27,90,3.4,1.5],[24,90,5.1,0.2],
  [17,96,4.0,2.8],[15,101,4.7,1.3],[18,103,3.6,3.6],[16,107,5.3,0.8],[12,105,4.1,2.0],[4,109,3.9,1.6],
  [1,104,4.8,3.9],[-6,107,5.0,0.4],[0,101,4.4,2.5],[4,114,3.7,1.0],[-2,120,5.6,3.1],[13,122,4.2,0.7],[8,124,3.5,2.2],[-9,125,4.9,1.4],
  [47,107,3.8,3.7],[35,105,4.5,0.5],[39,116,5.2,2.0],[31,118,4.0,1.2],[22,114,4.7,3.4],[25,121,3.3,0.9],
  [37,128,5.5,2.6],[39,125,4.1,1.7],[35,137,3.8,0.3],[43,141,4.6,3.0],
  [32,-5,5.0,1.9],[28,3,4.3,0.6],[33,9,3.6,2.8],[28,17,5.4,1.1],[27,30,4.8,3.5],
  [15,-17,4.1,0.4],[11,-12,3.9,2.1],[8,-12,5.2,1.5],[6,-10,4.5,3.3],[7,-6,3.7,0.8],[8,-1,4.9,2.4],
  [9,2,5.5,1.0],[9,8,4.2,3.8],[12,-2,3.5,0.3],[17,-4,4.7,2.0],[21,-10,5.0,1.3],
  [4,12,3.8,0.7],[7,18,4.1,2.5],[15,19,5.3,1.8],[17,8,4.6,0.2],[15,30,3.4,3.1],[8,38,5.1,1.6],
  [2,31,4.0,2.9],[-2,30,4.7,0.5],[-3,23,3.6,3.4],[-1,15,5.4,1.2],[0,11,4.3,2.7],
  [10,44,5.0,0.9],[0,38,4.6,1.5],[-6,35,4.1,2.2],[-15,35,5.5,0.6],[-14,28,3.9,3.7],[-20,30,4.4,1.9],
  [-14,35,5.2,0.1],[-22,25,4.8,2.4],[-22,18,3.5,1.3],[-13,18,5.6,3.6],[-29,25,4.7,2.0],[-25,46,3.3,1.1],
  [56,-106,5.0,3.3],[49,-75,4.3,0.6],[45,-121,3.7,2.7],[40,-100,4.9,1.4],[37,-80,5.4,0.3],[29,-90,4.1,2.8],
  [19,-99,3.6,1.0],[15,-90,5.2,3.5],[9,-80,4.5,0.7],[22,-80,4.8,2.3],[18,-72,3.9,1.6],[19,-70,5.1,3.9],[18,-67,4.3,0.4],[13,-61,3.6,2.1],
  [10,-67,4.0,1.2],[5,-59,5.3,3.4],[4,-73,4.7,0.9],[0,-78,3.8,2.6],[-10,-76,5.0,1.5],[-17,-64,4.4,3.1],
  [-3,-60,3.5,0.2],[-8,-37,4.8,2.8],[-15,-48,5.5,1.0],[-23,-46,4.1,3.7],[-23,-58,4.6,0.5],[-33,-56,3.9,2.0],
  [-25,-65,5.2,1.3],[-38,-68,4.0,3.5],[-30,-71,4.7,0.8],
  [-28,122,5.1,2.4],[-17,133,3.8,1.7],[-24,133,4.4,3.2],[-34,146,5.6,0.6],[-37,175,4.0,2.1],[-18,178,3.5,1.4],[-8,160,4.9,3.8],[-6,147,5.3,0.3],
]

const CITY_NODES = [
  { lat: 40.7,  lon:  -74.0, city: 'New York',     ping: '12ms' }, // 0
  { lat: 51.5,  lon:    0.0, city: 'London',       ping: '8ms'  }, // 1
  { lat: 25.2,  lon:   55.3, city: 'Dubai',        ping: '22ms' }, // 2
  { lat: 35.7,  lon:  139.7, city: 'Tokyo',        ping: '45ms' }, // 3
  { lat:  1.3,  lon:  103.8, city: 'Singapore',    ping: '31ms' }, // 4
  { lat:-23.5,  lon:  -46.6, city: 'São Paulo',    ping: '88ms' }, // 5
  { lat:  6.5,  lon:    3.4, city: 'Lagos',        ping: '55ms' }, // 6
  { lat: 19.1,  lon:   72.8, city: 'Mumbai',       ping: '35ms' }, // 7
  { lat: 34.0,  lon: -118.2, city: 'Los Angeles',  ping: '15ms' }, // 8
  { lat: 52.4,  lon:    4.9, city: 'Amsterdam',    ping: '9ms'  }, // 9
  { lat:-33.9,  lon:  151.2, city: 'Sydney',       ping: '62ms' }, // 10
  { lat: 50.1,  lon:    8.7, city: 'Frankfurt',    ping: '7ms'  }, // 11
  { lat: 48.9,  lon:    2.3, city: 'Paris',        ping: '11ms' }, // 12
  { lat: 43.7,  lon:  -79.4, city: 'Toronto',      ping: '18ms' }, // 13
  { lat: 37.6,  lon:  126.9, city: 'Seoul',        ping: '43ms' }, // 14
  { lat: 31.2,  lon:  121.5, city: 'Shanghai',     ping: '48ms' }, // 15
  { lat: 55.8,  lon:   37.6, city: 'Moscow',       ping: '26ms' }, // 16
  { lat: 30.0,  lon:   31.2, city: 'Cairo',        ping: '32ms' }, // 17
  { lat:-26.2,  lon:   28.0, city: 'Johannesburg', ping: '71ms' }, // 18
  { lat: 41.0,  lon:   29.0, city: 'Istanbul',     ping: '29ms' }, // 19
  { lat: 13.8,  lon:  100.5, city: 'Bangkok',      ping: '38ms' }, // 20
  { lat:-34.6,  lon:  -58.4, city: 'Buenos Aires', ping: '95ms' }, // 21
  { lat: 55.7,  lon:   12.6, city: 'Copenhagen',   ping: '14ms' }, // 22
  { lat: 22.3,  lon:  114.2, city: 'Hong Kong',    ping: '41ms' }, // 23
  { lat: 19.4,  lon:  -99.1, city: 'Mexico City',  ping: '67ms' }, // 24
]

const CITY_ARCS: [number, number][] = [
  [0,1],[1,11],[1,9],[1,12],[11,16],[9,22],[1,2],[2,7],[2,17],[2,19],
  [7,4],[4,3],[4,10],[4,20],[4,23],[3,14],[3,15],[3,8],[15,23],[14,15],
  [8,0],[8,24],[0,13],[0,5],[5,21],[5,6],[6,17],[6,18],[17,19],[16,19],
  [2,4],[24,5],
]

// Packet travel durations per arc (seconds)
const ARC_DUR = CITY_ARCS.map((_, i) => 2.2 + (i * 0.37) % 2.8)

// ─── 3-D orthographic projection ────────────────────────────
const GR = 163, GCX = 200, GCY = 195
const RX = 0.28                          // fixed X-tilt — see more northern hemisphere
const CRX = Math.cos(RX), SRX = Math.sin(RX)

// Apply X-tilt then Y-spin, return SVG coords + depth
function project3D(x0: number, y0: number, z0: number, ry: number) {
  const cry = Math.cos(ry), sry = Math.sin(ry)
  const y1 = y0 * CRX - z0 * SRX
  const z1 = y0 * SRX + z0 * CRX
  const xr  = x0 * cry + z1 * sry
  const zr  = -x0 * sry + z1 * cry
  return { svgX: GCX + GR * xr, svgY: GCY - GR * y1, z: zr }
}

function proj(lat: number, lon: number, ry: number) {
  const φ = lat * Math.PI / 180, λ = lon * Math.PI / 180
  return project3D(Math.cos(φ) * Math.sin(λ), Math.sin(φ), Math.cos(φ) * Math.cos(λ), ry)
}

// Single point on great circle at parameter t ∈ [0,1]
function gcPoint(aLat: number, aLon: number, bLat: number, bLon: number, t: number, ry: number) {
  const φ1 = aLat*Math.PI/180, λ1 = aLon*Math.PI/180
  const φ2 = bLat*Math.PI/180, λ2 = bLon*Math.PI/180
  const ax = Math.cos(φ1)*Math.sin(λ1), ay = Math.sin(φ1), az = Math.cos(φ1)*Math.cos(λ1)
  const bx = Math.cos(φ2)*Math.sin(λ2), by = Math.sin(φ2), bz = Math.cos(φ2)*Math.cos(λ2)
  const Ω  = Math.acos(Math.max(-1, Math.min(1, ax*bx+ay*by+az*bz)))
  const sΩ = Math.sin(Ω)
  const sa = sΩ > 1e-4 ? Math.sin((1-t)*Ω)/sΩ : 1-t
  const sb = sΩ > 1e-4 ? Math.sin(t*Ω)/sΩ : t
  return project3D(sa*ax+sb*bx, sa*ay+sb*by, sa*az+sb*bz, ry)
}

// Full great-circle SVG path (front hemisphere only)
function gcPath(aLat: number, aLon: number, bLat: number, bLon: number, ry: number, steps = 48) {
  const φ1 = aLat*Math.PI/180, λ1 = aLon*Math.PI/180
  const φ2 = bLat*Math.PI/180, λ2 = bLon*Math.PI/180
  const ax = Math.cos(φ1)*Math.sin(λ1), ay = Math.sin(φ1), az = Math.cos(φ1)*Math.cos(λ1)
  const bx = Math.cos(φ2)*Math.sin(λ2), by = Math.sin(φ2), bz = Math.cos(φ2)*Math.cos(λ2)
  const Ω  = Math.acos(Math.max(-1, Math.min(1, ax*bx+ay*by+az*bz)))
  const sΩ = Math.sin(Ω)
  let d = '', prev = false
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const sa = sΩ > 1e-4 ? Math.sin((1-t)*Ω)/sΩ : 1-t
    const sb = sΩ > 1e-4 ? Math.sin(t*Ω)/sΩ : t
    const p = project3D(sa*ax+sb*bx, sa*ay+sb*by, sa*az+sb*bz, ry)
    if (p.z > 0) {
      d += prev ? ` L${p.svgX.toFixed(1)},${p.svgY.toFixed(1)}` : `M${p.svgX.toFixed(1)},${p.svgY.toFixed(1)}`
      prev = true
    } else { prev = false }
  }
  return d
}

function latPath(lat: number, ry: number) {
  let d = '', prev = false
  for (let lon = -180; lon <= 180; lon += 3) {
    const p = proj(lat, lon, ry)
    if (p.z > 0) {
      d += prev ? ` L${p.svgX.toFixed(1)},${p.svgY.toFixed(1)}` : `M${p.svgX.toFixed(1)},${p.svgY.toFixed(1)}`
      prev = true
    } else { prev = false }
  }
  return d
}

function lonPath(lon: number, ry: number) {
  let d = '', prev = false
  for (let lat = -90; lat <= 90; lat += 3) {
    const p = proj(lat, lon, ry)
    if (p.z > 0) {
      d += prev ? ` L${p.svgX.toFixed(1)},${p.svgY.toFixed(1)}` : `M${p.svgX.toFixed(1)},${p.svgY.toFixed(1)}`
      prev = true
    } else { prev = false }
  }
  return d
}

/* ─── Globe visualization ─────────────────────────────────── */
function GlobeViz() {
  const [rotY, setRotY]       = useState(0.5)
  const [active, setActive]   = useState(0)
  const [prevActive, setPrev] = useState<number | null>(null)
  const [transRot, setTransRot] = useState<number | null>(null) // rotY when transition started
  const rotRef  = useRef(0.5)
  const lastRef = useRef(0)
  const updRef  = useRef(0)

  useEffect(() => {
    let rafId: number
    const tick = (t: number) => {
      const dt = Math.min((t - lastRef.current) / 1000, 0.05)
      lastRef.current = t
      rotRef.current += dt * 0.055   // ← half speed
      if (t - updRef.current > 33) {
        setRotY(rotRef.current)
        updRef.current = t
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // Cycle active city — track previous for transition arc
  useEffect(() => {
    const t = setInterval(() => {
      setActive(prev => {
        const vis = CITY_NODES
          .map((_, i) => i)
          .filter(i => proj(CITY_NODES[i].lat, CITY_NODES[i].lon, rotRef.current).z > 0.25)
        if (!vis.length) return prev
        const idx = vis.indexOf(prev)
        const next = vis[(idx + 1) % vis.length]
        if (next !== prev) {
          setPrev(prev)
          setTransRot(rotRef.current)  // snapshot rotation at transition moment
        }
        return next
      })
    }, 3400)   // ← longer dwell between cities
    return () => clearInterval(t)
  }, [])

  const ry = rotY
  const elapsed = rotY / 0.055  // approximate seconds elapsed (adjusted for new speed)

  // Transition arc opacity: fades from 1→0 over ~0.20 radians of rotation (~3.6s)
  const transProgress = transRot !== null
    ? Math.max(0, 1 - (rotY - transRot) / 0.20)
    : 0

  // Project all cities
  const cities = CITY_NODES.map((n, i) => ({ ...proj(n.lat, n.lon, ry), ...n, i }))

  // Visible country dots
  const dots = RAW_COUNTRIES.map(([lat, lon, dur, delay], i) => {
    const p = proj(lat, lon, ry)
    return p.z > 0.04 ? { ...p, dur, delay, i } : null
  }).filter(Boolean) as { svgX: number; svgY: number; z: number; dur: number; delay: number; i: number }[]

  // Grid
  const latLines = [-60,-30,0,30,60].map(lat => latPath(lat, ry))
  const lonLines = [-150,-120,-90,-60,-30,0,30,60,90,120,150].map(lon => lonPath(lon, ry))

  // Arcs
  const arcs = CITY_ARCS.map(([a, b], i) => ({
    d: gcPath(CITY_NODES[a].lat, CITY_NODES[a].lon, CITY_NODES[b].lat, CITY_NODES[b].lon, ry),
    isActive: a === active || b === active,
    i,
  })).filter(x => x.d)

  // Moving data packets along each arc
  const packets = CITY_ARCS.map(([a, b], i) => {
    const t = (elapsed / ARC_DUR[i] + i * 0.31) % 1
    const p = gcPoint(CITY_NODES[a].lat, CITY_NODES[a].lon, CITY_NODES[b].lat, CITY_NODES[b].lon, t, ry)
    return p.z > 0.05 ? { ...p, i, isActive: a === active || b === active } : null
  }).filter(Boolean) as { svgX: number; svgY: number; z: number; i: number; isActive: boolean }[]

  return (
    <svg viewBox="0 0 400 400"
      suppressHydrationWarning
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="gGlow" cx="50%" cy="49%" r="50%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.09)" />
          <stop offset="60%"  stopColor="rgba(255,255,255,0.02)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
        </radialGradient>
        {/* Subtle dark fill inside globe for depth */}
        <radialGradient id="globeFill" cx="50%" cy="42%" r="52%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.025)" />
          <stop offset="70%"  stopColor="rgba(0,0,0,0.08)"        />
          <stop offset="100%" stopColor="rgba(0,0,0,0.22)"        />
        </radialGradient>
        {/* Atmosphere rim glow */}
        <radialGradient id="atmosphere" cx="50%" cy="50%" r="50%">
          <stop offset="78%"  stopColor="rgba(255,255,255,0)"    />
          <stop offset="91%"  stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.18)" />
        </radialGradient>
        <filter id="blur2">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="blur4">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="blur9"><feGaussianBlur stdDeviation="9" /></filter>
        <filter id="glow-packet">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background ambient glow */}
      <circle cx={GCX} cy={GCY} r="210" fill="url(#gGlow)" />

      {/* Globe dark fill — depth */}
      <circle cx={GCX} cy={GCY} r={GR} fill="url(#globeFill)" />

      {/* Globe outer ring */}
      <circle cx={GCX} cy={GCY} r={GR} fill="none"
        stroke="rgba(255,255,255,0.20)" strokeWidth="0.9" />
      <circle cx={GCX} cy={GCY} r={GR} fill="none"
        stroke="rgba(255,255,255,0.04)" strokeWidth="7" />

      {/* Atmosphere rim */}
      <circle cx={GCX} cy={GCY} r={GR} fill="url(#atmosphere)" />

      {/* Latitude grid */}
      {latLines.map((d, i) => d && (
        <path key={`lat-${i}`} d={d} fill="none"
          stroke={i === 2 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.055)'}
          strokeWidth={i === 2 ? 0.75 : 0.45} />
      ))}

      {/* Longitude grid */}
      {lonLines.map((d, i) => d && (
        <path key={`lon-${i}`} d={d} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth="0.45" />
      ))}

      {/* Country coverage dots */}
      {dots.map(d => (
        <g key={`c-${d.i}`} opacity={Math.min(1, d.z * 2.2)}>
          <circle cx={d.svgX} cy={d.svgY} r="1.4" fill="white"
            style={{ animation: `dot-breathe ${d.dur}s ease-in-out ${d.delay}s infinite` }} />
        </g>
      ))}

      {/* Great-circle arcs — active solid, inactive dashed */}
      {arcs.map(a => (
        <path key={`arc-${a.i}`} d={a.d} fill="none"
          stroke={a.isActive ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.08)'}
          strokeWidth={a.isActive ? 1.2 : 0.55}
          strokeDasharray={a.isActive ? undefined : '1.5 8'}
          strokeLinecap="round" />
      ))}

      {/* Transition arc — bright path from prevActive → active, fades out */}
      {transProgress > 0 && prevActive !== null && (() => {
        const from = CITY_NODES[prevActive]
        const to   = CITY_NODES[active]
        const d    = gcPath(from.lat, from.lon, to.lat, to.lon, ry, 64)
        if (!d) return null
        const pf = proj(from.lat, from.lon, ry)
        const pt = proj(to.lat,   to.lon,   ry)
        return (
          <g opacity={transProgress}>
            {/* Glowing arc */}
            <path d={d} fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#blur2)" />
            <path d={d} fill="none"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round" />
            {/* Origin burst */}
            {pf.z > 0 && (
              <circle cx={pf.svgX} cy={pf.svgY} r={6 * (1 - transProgress) + 4}
                fill="none" stroke="white"
                strokeWidth="1.2"
                opacity={transProgress * 0.7} />
            )}
            {/* Destination pulse */}
            {pt.z > 0 && (
              <>
                <circle cx={pt.svgX} cy={pt.svgY} r={10 * (1 - transProgress) + 3}
                  fill="none" stroke="white"
                  strokeWidth="1.5"
                  opacity={transProgress * 0.6} />
                <circle cx={pt.svgX} cy={pt.svgY} r="4"
                  fill="white" opacity={transProgress * 0.9}
                  filter="url(#blur4)" />
              </>
            )}
          </g>
        )
      })()}

      {/* Moving data packets along arcs */}
      {packets.map(p => (
        <circle key={`pkt-${p.i}`}
          cx={p.svgX} cy={p.svgY}
          r={p.isActive ? 2.8 : 1.8}
          fill="white"
          filter="url(#glow-packet)"
          opacity={Math.min(1, p.z * 2) * (p.isActive ? 0.95 : 0.55)}
        />
      ))}

      {/* City nodes — sorted back-to-front */}
      {cities
        .filter(n => n.z > 0)
        .sort((a, b) => a.z - b.z)
        .map(n => {
          const isAct = n.i === active
          const alpha = Math.min(1, n.z * 2.6)
          const right = n.svgX >= GCX
          const lx    = right ? n.svgX + 9 : n.svgX - 9
          return (
            <g key={`city-${n.i}`} opacity={alpha}>
              {/* glow halo */}
              <circle cx={n.svgX} cy={n.svgY}
                r={isAct ? 18 : 8}
                fill="white" filter="url(#blur9)"
                opacity={isAct ? 0.40 : 0.14} />
              {/* outer pulse ring for active */}
              {isAct && (
                <circle cx={n.svgX} cy={n.svgY} r="13" fill="none"
                  stroke="rgba(255,255,255,0.35)" strokeWidth="1"
                  style={{ animation: 'pulse-ring 2.2s ease-out infinite' }} />
              )}
              {/* core dot */}
              <circle cx={n.svgX} cy={n.svgY}
                r={isAct ? 4.5 : 2.5}
                fill="white"
                filter={isAct ? 'url(#blur2)' : undefined} />
              <circle cx={n.svgX} cy={n.svgY}
                r={isAct ? 2.5 : 1.4}
                fill="white" />
              {/* city name */}
              <text
                x={lx} y={n.svgY - 2}
                textAnchor={right ? 'start' : 'end'}
                fill={isAct ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.38)'}
                fontSize={isAct ? '9.5' : n.z > 0.5 ? '7.5' : '6.5'}
                fontFamily="Syne, sans-serif"
                fontWeight={isAct ? 700 : 400}>
                {n.city}
              </text>
              {/* ping — only for active */}
              {isAct && (
                <text
                  x={lx} y={n.svgY + 9}
                  textAnchor={right ? 'start' : 'end'}
                  fill="rgba(16,185,129,1)"
                  fontSize="7.5"
                  fontFamily="JetBrains Mono, monospace">
                  {n.ping}
                </text>
              )}
            </g>
          )
        })}

      {/* Orbiting satellite (static outer ring) */}
      <path id="orbit-rim"
        d={`M${GCX+GR},${GCY} A${GR},${GR} 0 1,1 ${GCX+GR-0.01},${GCY}`}
        fill="none" />
      <circle r="2.5" fill="rgba(255,255,255,0.9)" filter="url(#blur4)">
        <animateMotion dur="26s" repeatCount="indefinite">
          <mpath xlinkHref="#orbit-rim" />
        </animateMotion>
      </circle>
      <circle r="1.4" fill="rgba(255,255,255,0.4)" filter="url(#blur4)">
        <animateMotion dur="26s" repeatCount="indefinite" begin="-13s">
          <mpath xlinkHref="#orbit-rim" />
        </animateMotion>
      </circle>

      {/* Stats strip */}
      <text x={GCX} y="390" textAnchor="middle"
        fill="rgba(255,255,255,0.08)"
        fontSize="7" fontFamily="JetBrains Mono, monospace" letterSpacing="3">
        195 КРАЇН · 5,000,000+ IP-адрес · 99.9% UPTIME
      </text>
    </svg>
  )
}

const WORDS = ['працює.', 'масштабується.', 'захищає.', 'не здає.']

/* ─── TypewriterWord ─────────────────────────────────────── */
function TypewriterWord() {
  const [wIdx, setWIdx] = useState(0)
  const [cIdx, setCIdx] = useState(0)
  const [del, setDel]   = useState(false)

  // Reset when words change (language switch)
  useEffect(() => { setWIdx(0); setCIdx(0); setDel(false) }, [WORDS.join('')])

  useEffect(() => {
    const word = WORDS[wIdx]
    if (del && cIdx === 0)            { setDel(false); setWIdx(i => (i + 1) % WORDS.length); return }
    if (!del && cIdx === word.length) { const t = setTimeout(() => setDel(true), 2400); return () => clearTimeout(t) }
    const t = setTimeout(() => setCIdx(i => del ? i - 1 : i + 1), del ? 36 : 78)
    return () => clearTimeout(t)
  }, [wIdx, cIdx, del])

  return (
    <span style={{ color: '#FFFFFF' }}>
      {WORDS[wIdx].slice(0, cIdx)}
      <span className="inline-block w-[3px] h-[0.78em] ml-0.5 align-middle rounded-sm"
        style={{ background: '#10B981', animation: 'blink 1s step-end infinite' }} />
    </span>
  )
}

/* ─── HeroSection ────────────────────────────────────────── */
export default function HeroSection() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60)
    return () => clearTimeout(t)
  }, [])

  const enter = (delay: number) => ({
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    opacity: ready ? 1 : 0,
    transform: ready ? 'translateY(0)' : 'translateY(28px)',
  })

  return (
    <section className="relative flex flex-col lg:flex-row overflow-hidden" style={{ background: '#060606', minHeight: '100svh' }}>

      {/* ── LEFT ─────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center lg:items-start justify-center px-6 md:px-14 xl:px-20 pt-24 pb-8 lg:pb-16 flex-1 min-w-0 text-center lg:text-left">

        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 20% 50%, black 0%, transparent 100%)',
          }} />

        <div className="flex items-center gap-2.5 mb-6 md:mb-12" style={enter(0)}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ background: '#10B981' }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#10B981' }} />
          </span>
          <span className="text-xs font-medium tracking-[0.15em] uppercase" style={{ color: '#10B981' }}>
            50,000+ активних підключень
          </span>
        </div>

        <div className="mb-6">
          <div style={enter(120)}>
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(68px, 9.5vw, 148px)',
              fontWeight: 900, lineHeight: 0.88, letterSpacing: '-0.035em',
              color: '#FFFFFF',
            }}>PROXY</h1>
          </div>
          <div style={enter(240)}>
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(68px, 9.5vw, 148px)',
              fontWeight: 900, lineHeight: 0.88, letterSpacing: '-0.035em',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.85) 60%, rgba(255,255,255,0.08) 80%, rgba(255,255,255,0.08) 100%)',
              backgroundSize: '250% 100%',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              animation: 'text-shimmer 6s ease-in-out infinite',
            }}>МЕРЕЖА</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-12" style={enter(380)}>
          <div className="h-px w-12 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(20px, 2.2vw, 30px)', fontWeight: 300, color: '#BBBBBB' }}>
            що <TypewriterWord />
          </p>
        </div>

        <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8 md:mb-16" style={enter(500)}>
          <Link href="/catalog">
            <button
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={{ background: '#FFFFFF', color: '#000' }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'scale(0.97)'; b.style.opacity = '0.9' }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'scale(1)'; b.style.opacity = '1' }}>
              Переглянути каталог <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/docs">
            <button
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ background: 'transparent', color: '#CCCCCC', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#FFF'; b.style.borderColor = 'rgba(255,255,255,0.28)' }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#555'; b.style.borderColor = 'rgba(255,255,255,0.1)' }}>
              <ArrowUpRight className="w-4 h-4" /> API Docs
            </button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center lg:justify-start gap-10" style={enter(640)}>
          {STATS.map(s => (
            <div key={s.uk}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px, 2.5vw, 32px)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                {s.val}
              </div>
              <div className="text-xs mt-0.5 uppercase tracking-widest" style={{ color: '#DDDDDD' }}>{s.uk}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── GLOBE: full width on mobile, side panel on lg ── */}
      <div className="globe-container relative flex flex-col justify-center overflow-hidden w-full lg:w-[46%] lg:flex-shrink-0"
        style={{ height: 'clamp(300px, 55vw, 100vh)' }}>

        <div className="absolute inset-0" style={{ background: '#060606' }} />
        <div className="absolute inset-0"><GlobeViz /></div>

        {/* Vignette fades */}
        <div className="absolute inset-y-0 left-0 w-32 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to right, #060606, transparent)' }} />
        <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to top, #060606, transparent)' }} />
        <div className="absolute inset-x-0 top-0 h-32 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, #060606, transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-24 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to left, #060606, transparent)' }} />

        <div className="absolute top-24 right-8 z-20 text-right" style={enter(800)}>
          <div className="text-[10px] uppercase tracking-[0.25em] font-medium" style={{ color: 'rgba(255,255,255,0.12)' }}>
            Global Infrastructure
          </div>
          <div className="text-[10px] uppercase tracking-[0.25em] mt-1" style={{ color: 'rgba(255,255,255,0.05)' }}>
            5,000,000+ nodes
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-30"
        style={{ background: 'linear-gradient(transparent, #060606)' }} />
    </section>
  )
}
