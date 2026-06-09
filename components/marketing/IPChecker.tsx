'use client'

import { useState, useEffect } from 'react'
import { Search, Wifi, MapPin, Globe, Shield } from 'lucide-react'

interface IPData {
  ip: string
  country: string
  city: string
  isp: string
  isProxy: boolean
  flag: string
  lat: number
  lon: number
}

const MOCK_ROTATIONS = [
  { ip: '185.220.101.45', country: 'United States', city: 'New York', flag: '🇺🇸', isp: 'Comcast', isProxy: false },
  { ip: '91.108.4.22', country: 'Germany', city: 'Frankfurt', flag: '🇩🇪', isp: 'Deutsche Telekom', isProxy: false },
  { ip: '149.154.175.50', country: 'Japan', city: 'Tokyo', flag: '🇯🇵', isp: 'NTT Communications', isProxy: false },
  { ip: '195.154.122.10', country: 'Netherlands', city: 'Amsterdam', flag: '🇳🇱', isp: 'KPN', isProxy: false },
]

export default function IPChecker() {
  const [data, setData] = useState<IPData | null>(null)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  async function checkIP() {
    setLoading(true)
    setChecked(false)
    try {
      const res = await fetch('/api/v1/tools/ip')
      const json = await res.json()
      setData(json.data)
    } catch {
      // Fallback demo
      setData({ ip: '31.148.135.173', country: 'Ukraine', city: 'Kyiv', isp: 'Kyivstar', isProxy: false, flag: '🇺🇦', lat: 50.45, lon: 30.52 })
    } finally {
      setLoading(false)
      setChecked(true)
    }
  }

  const [demoIdx, setDemoIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setDemoIdx(i => (i + 1) % MOCK_ROTATIONS.length), 2500)
    return () => clearInterval(t)
  }, [])
  const demo = MOCK_ROTATIONS[demoIdx]

  return (
    <section className="py-24" style={{ background: '#060606' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — IP Checker */}
          <div>
            <div className="inline-block text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
              Безкоштовний інструмент
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#FFFFFF' }}>
              Перевір свій IP прямо зараз
            </h2>
            <p className="text-base mb-8" style={{ color: '#DDDDDD' }}>
              Дізнайся свою реальну IP-адресу, геолокацію та провайдера. Побач різницю до і після підключення ProxyService.
            </p>

            <div className="rounded-2xl p-6" style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.06)' }}>
              {!checked ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Wifi className="w-8 h-8" style={{ color: '#FFFFFF' }} />
                  </div>
                  <p className="text-sm mb-6" style={{ color: '#DDDDDD' }}>Натисни щоб побачити свій поточний IP</p>
                  <button
                    onClick={checkIP}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium mx-auto transition-all"
                    style={{
                      background: loading ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
                      color: '#000000',
                      border: 'none',
                    }}
                  >
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Перевіряємо...</>
                    ) : (
                      <><Search className="w-4 h-4" />Перевірити мій IP</>
                    )}
                  </button>
                </div>
              ) : data && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#DDDDDD' }}>Ваш IP</span>
                    <div className="flex items-center gap-2">
                      {data.isProxy && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>Proxy detected</span>}
                      <span className="font-mono text-sm" style={{ color: '#FFFFFF' }}>{data.ip}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1.5" style={{ color: '#DDDDDD' }}><MapPin className="w-3.5 h-3.5" />Локація</span>
                    <span className="text-sm" style={{ color: '#FFFFFF' }}>{data.flag} {data.city}, {data.country}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1.5" style={{ color: '#DDDDDD' }}><Globe className="w-3.5 h-3.5" />Провайдер</span>
                    <span className="text-sm" style={{ color: '#FFFFFF' }}>{data.isp}</span>
                  </div>

                  <div className="mt-4 pt-4 rounded-xl p-4"
                    style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4" style={{ color: '#EF4444' }} />
                      <span className="text-sm font-medium" style={{ color: '#EF4444' }}>Твій реальний IP видно!</span>
                    </div>
                    <p className="text-xs" style={{ color: '#DDDDDD' }}>Підключи ProxyService щоб приховати свій справжній IP та локацію</p>
                  </div>

                  <button onClick={() => setChecked(false)} className="text-xs w-full text-center mt-2" style={{ color: '#BBBBBB' }}>
                    Перевірити знову
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right — IP Rotation Demo */}
          <div>
            <div className="inline-block text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)' }}>
              Live демо
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#FFFFFF' }}>
              Ротація IP в реальному часі
            </h2>
            <p className="text-base mb-8" style={{ color: '#DDDDDD' }}>
              З ProxyService кожен запит йде через новий IP. Жоден сайт не заблокує тебе.
            </p>

            <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', filter: 'blur(20px)' }} />

              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10B981' }} />
                <span className="text-xs" style={{ color: '#10B981' }}>Ротація активна · змінюється кожні 2.5с</span>
              </div>

              <div key={demoIdx} className="space-y-3" style={{ animation: 'fadeInUp 0.4s ease' }}>
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-3xl">{demo.flag}</span>
                  <div className="flex-1">
                    <div className="font-mono text-sm mb-0.5" style={{ color: '#FFFFFF' }}>{demo.ip}</div>
                    <div className="text-xs" style={{ color: '#BBBBBB' }}>{demo.city}, {demo.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium mb-0.5" style={{ color: '#10B981' }}>Active</div>
                    <div className="text-xs" style={{ color: '#BBBBBB' }}>{demo.isp}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: 'Затримка', value: '12ms' },
                  { label: 'Протокол', value: 'HTTPS' },
                  { label: 'Анонімність', value: 'Elite' },
                ].map(m => (
                  <div key={m.label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-sm font-bold" style={{ color: '#FFFFFF' }}>{m.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#BBBBBB' }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
