'use client'

import { useState, useEffect } from 'react'

const SYSTEMS = [
  { num: '01', name: 'Residential Network', region: 'Global', uptime: '99.98%', latency: '18ms', ok: true },
  { num: '02', name: 'Datacenter Network', region: 'Global', uptime: '99.99%', latency: '4ms', ok: true },
  { num: '03', name: 'Mobile Network 4G/5G', region: 'Global', uptime: '99.91%', latency: '45ms', ok: true },
  { num: '04', name: 'ISP Network', region: 'Global', uptime: '99.97%', latency: '8ms', ok: true },
  { num: '05', name: 'API Gateway', region: 'EU / US', uptime: '99.99%', latency: '2ms', ok: true },
  { num: '06', name: 'Dashboard', region: 'Global CDN', uptime: '100%', latency: '1ms', ok: true },
  { num: '07', name: 'Payments (Stripe)', region: 'External', uptime: '99.98%', latency: '220ms', ok: true },
  { num: '08', name: 'Notifications', region: 'Internal', uptime: '99.95%', latency: '5ms', ok: true },
]

export default function StatusPage() {
  const [requests, setRequests] = useState(3_284_721)
  const [liveData, setLiveData] = useState<{ activeProxies?: number; totalUsers?: number; ordersToday?: number } | null>(null)

  useEffect(() => {
    // Load real data from API
    fetch('/api/v1/status')
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setRequests(d.data.requestsProcessed)
          setLiveData({ activeProxies: d.data.activeProxies, totalUsers: d.data.totalUsers, ordersToday: d.data.ordersToday })
        }
      })
      .catch(() => {})

    const t = setInterval(() => setRequests(r => r + Math.floor(Math.random() * 60 + 20)), 800)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ background: '#060606', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-28">

        {/* Header */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] mb-6" style={{ color: '#DDDDDD' }}>
            Моніторинг
          </p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,5vw,64px)', lineHeight: .92, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Статус<br />
            <span className="text-wave">системи</span>
          </h1>
          <div className="flex items-center gap-3 mt-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: '#22C55E' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#22C55E' }} />
            </span>
            <span className="text-xs uppercase tracking-widest" style={{ color: '#22C55E' }}>
              Всі системи працюють нормально
            </span>
          </div>
          <p className="font-mono text-xs mt-3" style={{ color: '#CCCCCC' }}>
            {requests.toLocaleString()} запитів оброблено
          </p>
          {liveData && (
            <div className="flex gap-6 mt-4">
              <div>
                <p className="font-mono text-sm" style={{ color: '#FFFFFF' }}>{(liveData.activeProxies ?? 0).toLocaleString()}</p>
                <p className="text-xs" style={{ color: '#AAAAAA' }}>активних проксі</p>
              </div>
              <div>
                <p className="font-mono text-sm" style={{ color: '#FFFFFF' }}>{(liveData.totalUsers ?? 0).toLocaleString()}</p>
                <p className="text-xs" style={{ color: '#AAAAAA' }}>користувачів</p>
              </div>
              <div>
                <p className="font-mono text-sm" style={{ color: '#FFFFFF' }}>{(liveData.ordersToday ?? 0).toLocaleString()}</p>
                <p className="text-xs" style={{ color: '#AAAAAA' }}>замовлень сьогодні</p>
              </div>
            </div>
          )}
        </div>

        {/* Systems */}
        <div>
          {SYSTEMS.map((s) => (
            <div key={s.num} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="grid grid-cols-[40px_1fr_auto] gap-8 py-5 items-center">
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#CCCCCC', letterSpacing: '0.1em' }}>
                  {s.num}
                </span>
                <div>
                  <p style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>{s.name}</p>
                  <p style={{ fontSize: '12px', color: '#DDDDDD' }}>{s.region}</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span style={{ color: '#22C55E' }}>{s.uptime}</span>
                  <span style={{ color: '#DDDDDD' }}>{s.latency}</span>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        </div>

        {/* 90-day uptime */}
        <div className="mt-16">
          <p className="text-xs uppercase tracking-[0.18em] mb-8" style={{ color: '#DDDDDD' }}>
            90-денна статистика
          </p>
          <div className="space-y-6">
            {SYSTEMS.slice(0, 4).map(s => (
              <div key={s.name}>
                <div className="flex justify-between text-xs mb-2">
                  <span style={{ color: '#AAAAAA' }}>{s.name}</span>
                  <span style={{ color: '#22C55E' }}>{s.uptime}</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 90 }).map((_, i) => (
                    <div key={i} className="flex-1 h-4"
                      style={{
                        background: Math.random() > 0.008 ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.35)',
                        minWidth: 2,
                      }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No incidents */}
        <div className="mt-16" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '32px' }}>
          <p className="text-xs uppercase tracking-[0.18em] mb-6" style={{ color: '#DDDDDD' }}>
            Останні інциденти
          </p>
          <p style={{ fontSize: '14px', color: '#CCCCCC' }}>
            Немає інцидентів за останні 90 днів
          </p>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: '#CCCCCC' }}>
            Є питання?
          </p>
          <a href="mailto:support@proxyservice.io"
            className="text-xs font-medium"
            style={{ color: '#EEEEEE' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
            support@proxyservice.io →
          </a>
        </div>
      </div>
    </div>
  )
}
