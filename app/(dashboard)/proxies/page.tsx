'use client'



import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Copy, RefreshCw, Globe, Loader2, Eye, EyeOff, RotateCcw,
  Download, ShoppingBag, CheckCircle, XCircle, Square, CheckSquare,
} from 'lucide-react'

interface Proxy {
  _id: string; host: string; port: number; username: string; password?: string
  protocol: string; status: string; expiresAt: string; replacedCount: number
  autoRenew: boolean; productId?: { name: string; countryCode: string; countryName: string; type: string }
}

const STATUS: Record<string, { label: string; color: string }> = {
  active:    { label: 'Активний',     color: '#22C55E' },
  expired:   { label: 'Закінчився',   color: '#EF4444' },
  suspended: { label: 'Призупинений', color: '#F59E0B' },
  replacing: { label: 'Заміна...',    color: '#CCCCCC' },
}

function copy(text: string, label: string) {
  navigator.clipboard.writeText(text)
  toast.success(`${label} скопійовано`)
}

function downloadTxt(proxies: Proxy[], filename = 'proxies.txt') {
  const lines = proxies.map(p => `${p.host}:${p.port}:${p.username}:${p.password ?? ''}`)
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
  toast.success(`Завантажено ${proxies.length} проксі`)
}

export default function ProxiesPage() {
  
  const [proxies, setProxies] = useState<Proxy[]>([])
  const [loading, setLoading] = useState(true)
  const [showPassIds, setShowPassIds] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [listExpanded, setListExpanded] = useState(false)

  const VISIBLE = 8

  async function fetchProxies() {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/proxies')
      const data = await res.json()
      setProxies(data.data?.items ?? [])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchProxies() }, [])

  async function handleAction(proxyId: string, action: string) {
    setActionLoading(`${proxyId}-${action}`)
    try {
      const res = await fetch(`/api/v1/proxies/${proxyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error)
      if (action === 'replace') { toast.success('Проксі замінено'); await fetchProxies() }
      else if (action === 'toggle_renew') toast.success(data.data?.autoRenew ? 'Авто-поновлення увімкнено' : 'Вимкнено')
      else if (action === 'check') toast.success(data.data?.alive ? 'Проксі активний' : 'Не відповідає')
      if (action !== 'replace') setProxies(prev => prev.map(p => p._id === proxyId ? { ...p, autoRenew: data.data?.autoRenew ?? p.autoRenew } : p))
    } finally { setActionLoading(null) }
  }

  const filtered = filter === 'all' ? proxies : proxies.filter(p => p.status === filter)
  const counts = { all: proxies.length, active: proxies.filter(p => p.status === 'active').length, expired: proxies.filter(p => p.status === 'expired').length }
  const allSelected = filtered.length > 0 && filtered.every(p => selected.has(p._id))
  const someSelected = selected.size > 0

  function toggleAll() {
    if (allSelected) setSelected(prev => { const n = new Set(prev); filtered.forEach(p => n.delete(p._id)); return n })
    else setSelected(prev => { const n = new Set(prev); filtered.forEach(p => n.add(p._id)); return n })
  }
  function toggleOne(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  if (loading) return (
    <div className="space-y-3">
      <div className="skeleton" style={{ height: '40px', width: '180px', borderRadius: '8px' }} />
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '10px' }} />)}
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '26px', letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Проксі
          </h1>
          <p style={{ fontSize: '12px', color: '#CCCCCC', marginTop: '3px' }}>{proxies.length} у вашому акаунті</p>
        </div>

        {proxies.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {someSelected && (
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#CCCCCC', padding: '4px 10px', background: 'rgba(255,255,255,0.20)', borderRadius: '6px' }}>
                Вибрано {selected.size}
              </span>
            )}
            <button
              onClick={() => downloadTxt(someSelected ? proxies.filter(p => selected.has(p._id)) : filtered)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12.5px', fontWeight: 500, padding: '7px 14px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.22)', color: '#CCCCCC',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.32)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#555'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)' }}
            >
              <Download style={{ width: '13px', height: '13px' }} />
              {someSelected ? `Завантажити (${selected.size})` : 'Завантажити .txt'}
            </button>
          </div>
        )}
      </div>

      {/* Empty state */}
      {proxies.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', background: '#0A0A0A', borderRadius: '14px' }}>
          <Globe style={{ width: '32px', height: '32px', color: '#CCCCCC', marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '6px' }}>Немає проксі</p>
          <p style={{ fontSize: '13px', color: '#CCCCCC', marginBottom: '24px' }}>Придбайте перший проксі з каталогу</p>
          <Link href="/catalog">
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '8px', background: '#FFFFFF', color: '#000', fontSize: '13px', fontWeight: 600 }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}>
              <ShoppingBag style={{ width: '13px', height: '13px' }} />
              До каталогу
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Filter + select toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.03)', padding: '3px', borderRadius: '9px' }}>
              {(['all', 'active', 'expired'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 500,
                    color: filter === f ? '#FFFFFF' : '#333',
                    background: filter === f ? 'rgba(255,255,255,0.30)' : 'transparent',
                    transition: 'color 0.15s, background 0.15s',
                  }}>
                  {f === 'all' ? 'Всі' : f === 'active' ? 'Активні' : 'Закінчились'} · {counts[f]}
                </button>
              ))}
            </div>
            <button onClick={toggleAll}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: allSelected ? '#FFFFFF' : '#333', padding: '5px 10px', background: 'transparent', borderRadius: '7px', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#888'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = allSelected ? '#FFFFFF' : '#333'}>
              {allSelected ? <CheckSquare style={{ width: '13px', height: '13px' }} /> : <Square style={{ width: '13px', height: '13px' }} />}
              {allSelected ? 'Зняти всі' : 'Вибрати всі'}
            </button>
          </div>

          {/* Proxy list — table-style rows, no heavy cards */}
          <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
            {filtered.slice(0, VISIBLE).map((proxy, i) => {
              const st = STATUS[proxy.status] ?? STATUS.active
              const daysLeft = Math.ceil((new Date(proxy.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              const showPass = showPassIds.has(proxy._id)
              const isSelected = selected.has(proxy._id)
              const expanded = expandedId === proxy._id

              return (
                <div
                  key={proxy._id}
                  className={`stagger-item stagger-${Math.min(i + 1, 6)}`}
                  style={{ position: 'relative' }}
                >
                  {/* Left accent for active+expanded */}
                  {expanded && (
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.2)', borderRadius: '0 2px 2px 0', animation: 'left-accent-in 0.2s ease both' }} />
                  )}
                  {/* Main row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px',
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.20)' : 'none',
                    background: isSelected ? 'rgba(255,255,255,0.02)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                    onClick={() => setExpandedId(expanded ? null : proxy._id)}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)' }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                  >
                    {/* Checkbox */}
                    <button onClick={e => { e.stopPropagation(); toggleOne(proxy._id) }}
                      style={{ color: isSelected ? '#FFFFFF' : '#2A2A2A', flexShrink: 0, transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                      onMouseLeave={e => (e.currentTarget.style.color = isSelected ? '#FFFFFF' : '#2A2A2A')}>
                      {isSelected ? <CheckSquare style={{ width: '13px', height: '13px' }} /> : <Square style={{ width: '13px', height: '13px' }} />}
                    </button>

                    {/* Flag */}
                    <div style={{ width: '28px', height: '20px', borderRadius: '3px', overflow: 'hidden', background: '#111', flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/flags/${proxy.productId?.countryCode?.toLowerCase() ?? 'us'}.png`} alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.currentTarget.style.display = 'none' }} />
                    </div>

                    {/* Host */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 600, color: '#CCCCCC' }}>
                          {proxy.host}:{proxy.port}
                        </span>
                        <button onClick={e => { e.stopPropagation(); copy(`${proxy.host}:${proxy.port}`, 'Адреса') }}
                          style={{ color: '#DDDDDD', transition: 'color 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#666')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#222')}>
                          <Copy style={{ width: '11px', height: '11px' }} />
                        </button>
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#CCCCCC', marginTop: '2px' }}>
                        {proxy.productId?.countryName} · {proxy.protocol.toUpperCase()}
                      </p>
                    </div>

                    {/* Status + days */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div
                          className={proxy.status === 'active' ? 'dot-pulse' : ''}
                          style={{ width: '5px', height: '5px', borderRadius: '50%', background: st.color }}
                        />
                        <span style={{ fontSize: '12px', color: st.color }}>{st.label}</span>
                      </div>
                      <span style={{ fontSize: '11.5px', color: '#DDDDDD', fontFamily: 'JetBrains Mono, monospace' }}>
                        {daysLeft > 0 ? `${daysLeft}д` : 'сьогодні'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded credentials + actions */}
                  {expanded && (
                    <div style={{ padding: '0 20px 16px 53px', borderTop: '1px solid rgba(255,255,255,0.20)' }}>
                      {/* Credentials */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px', marginTop: '12px' }}>
                        {[
                          { label: 'Host',     value: proxy.host },
                          { label: 'Username', value: proxy.username },
                          { label: 'Password', value: showPass ? (proxy.password ?? '••••••••') : '••••••••', isPass: true },
                        ].map(cred => (
                          <div key={cred.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#CCCCCC', textTransform: 'uppercase', marginBottom: '3px' }}>{cred.label}</p>
                              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#CCCCCC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cred.value}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                              {cred.isPass && (
                                <button onClick={() => setShowPassIds(prev => { const n = new Set(prev); n.has(proxy._id) ? n.delete(proxy._id) : n.add(proxy._id); return n })}
                                  style={{ color: '#CCCCCC', transition: 'color 0.15s' }}
                                  onMouseEnter={e => (e.currentTarget.style.color = '#666')}
                                  onMouseLeave={e => (e.currentTarget.style.color = '#2A2A2A')}>
                                  {showPass ? <EyeOff style={{ width: '12px', height: '12px' }} /> : <Eye style={{ width: '12px', height: '12px' }} />}
                                </button>
                              )}
                              <button onClick={() => copy(cred.isPass ? (proxy.password ?? '') : cred.value, cred.label)}
                                style={{ color: '#CCCCCC', transition: 'color 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#666')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#2A2A2A')}>
                                <Copy style={{ width: '12px', height: '12px' }} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                        <button
                          disabled={proxy.replacedCount >= 3 || actionLoading === `${proxy._id}-replace`}
                          onClick={() => handleAction(proxy._id, 'replace')}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, padding: '5px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.20)', color: '#BBBBBB', transition: 'color 0.15s, background 0.15s' }}
                          onMouseEnter={e => { if (proxy.replacedCount < 3) { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.28)' }}}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.20)' }}>
                          {actionLoading === `${proxy._id}-replace` ? <Loader2 style={{ width: '11px', height: '11px', animation: 'spin 1s linear infinite' }} /> : <RotateCcw style={{ width: '11px', height: '11px' }} />}
                          Замінити {proxy.replacedCount > 0 ? `(${proxy.replacedCount}/3)` : ''}
                        </button>

                        <button
                          disabled={actionLoading === `${proxy._id}-check`}
                          onClick={() => handleAction(proxy._id, 'check')}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, padding: '5px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.20)', color: '#BBBBBB', transition: 'color 0.15s, background 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.28)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.20)' }}>
                          {actionLoading === `${proxy._id}-check` ? <Loader2 style={{ width: '11px', height: '11px', animation: 'spin 1s linear infinite' }} /> : <RefreshCw style={{ width: '11px', height: '11px' }} />}
                          Перевірити
                        </button>

                        <button
                          onClick={() => handleAction(proxy._id, 'toggle_renew')}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, padding: '5px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.20)', color: proxy.autoRenew ? '#22C55E' : '#444', transition: 'color 0.15s, background 0.15s' }}>
                          {proxy.autoRenew ? <CheckCircle style={{ width: '11px', height: '11px' }} /> : <XCircle style={{ width: '11px', height: '11px' }} />}
                          Авто-поновлення
                        </button>

                        <button
                          onClick={() => copy(`${proxy.host}:${proxy.port}:${proxy.username}:${proxy.password ?? ''}`, 'Рядок')}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, padding: '5px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.20)', color: '#EEEEEE', marginLeft: 'auto', transition: 'color 0.15s, background 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.28)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#333'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.20)' }}>
                          <Copy style={{ width: '11px', height: '11px' }} />
                          Копіювати рядок
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Smooth grid-rows expand */}
            {filtered.length > VISIBLE && (
              <div style={{
                display: 'grid',
                gridTemplateRows: listExpanded ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.45s cubic-bezier(0.16,1,0.3,1)',
              }}>
                <div style={{ overflow: 'hidden' }}>
                  {filtered.slice(VISIBLE).map((proxy, i) => {
                    const st = STATUS[proxy.status] ?? STATUS.active
                    const daysLeft = Math.ceil((new Date(proxy.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    const isSelected = selected.has(proxy._id)
                    const expanded = expandedId === proxy._id

                    return (
                      <div
                        key={proxy._id}
                        style={{
                          position: 'relative',
                          opacity: listExpanded ? 1 : 0,
                          transform: listExpanded ? 'none' : 'translateY(6px)',
                          transition: `opacity 0.3s ease ${Math.min(i, 10) * 35}ms, transform 0.35s cubic-bezier(0.16,1,0.3,1) ${Math.min(i, 10) * 35}ms`,
                        }}
                      >
                        {expanded && (
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.2)', borderRadius: '0 2px 2px 0', animation: 'left-accent-in 0.2s ease both' }} />
                        )}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px',
                          borderTop: '1px solid rgba(255,255,255,0.20)',
                          background: isSelected ? 'rgba(255,255,255,0.02)' : 'transparent',
                          cursor: 'pointer', transition: 'background 0.15s ease',
                        }}
                          onClick={() => setExpandedId(expanded ? null : proxy._id)}
                          onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)' }}
                          onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                        >
                          <button onClick={e => { e.stopPropagation(); toggleOne(proxy._id) }}
                            style={{ color: isSelected ? '#FFFFFF' : '#2A2A2A', flexShrink: 0, transition: 'color 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                            onMouseLeave={e => (e.currentTarget.style.color = isSelected ? '#FFFFFF' : '#2A2A2A')}>
                            {isSelected ? <CheckSquare style={{ width: '13px', height: '13px' }} /> : <Square style={{ width: '13px', height: '13px' }} />}
                          </button>
                          <div style={{ width: '28px', height: '20px', borderRadius: '3px', overflow: 'hidden', background: '#111', flexShrink: 0 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`/flags/${proxy.productId?.countryCode?.toLowerCase() ?? 'us'}.png`} alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => { e.currentTarget.style.display = 'none' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 600, color: '#CCCCCC' }}>
                                {proxy.host}:{proxy.port}
                              </span>
                              <button onClick={e => { e.stopPropagation(); copy(`${proxy.host}:${proxy.port}`, 'Адреса') }}
                                style={{ color: '#DDDDDD', transition: 'color 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#666')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#222')}>
                                <Copy style={{ width: '11px', height: '11px' }} />
                              </button>
                            </div>
                            <p style={{ fontSize: '11.5px', color: '#CCCCCC', marginTop: '2px' }}>
                              {proxy.productId?.countryName} · {proxy.protocol.toUpperCase()}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <div className={proxy.status === 'active' ? 'dot-pulse' : ''} style={{ width: '5px', height: '5px', borderRadius: '50%', background: st.color }} />
                              <span style={{ fontSize: '12px', color: st.color }}>{st.label}</span>
                            </div>
                            <span style={{ fontSize: '11.5px', color: '#DDDDDD', fontFamily: 'JetBrains Mono, monospace' }}>
                              {daysLeft > 0 ? `${daysLeft}д` : 'сьогодні'}
                            </span>
                          </div>
                        </div>

                        {expanded && (
                          <div style={{ padding: '0 20px 16px 53px', borderTop: '1px solid rgba(255,255,255,0.20)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px', marginTop: '12px' }}>
                              {[
                                { label: 'Host',     value: proxy.host },
                                { label: 'Username', value: proxy.username },
                                { label: 'Password', value: showPassIds.has(proxy._id) ? (proxy.password ?? '••••••••') : '••••••••', isPass: true },
                              ].map(cred => (
                                <div key={cred.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#CCCCCC', textTransform: 'uppercase', marginBottom: '3px' }}>{cred.label}</p>
                                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#CCCCCC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cred.value}</p>
                                  </div>
                                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                    {cred.isPass && (
                                      <button onClick={() => setShowPassIds(prev => { const n = new Set(prev); n.has(proxy._id) ? n.delete(proxy._id) : n.add(proxy._id); return n })}
                                        style={{ color: '#CCCCCC', transition: 'color 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#666')}
                                        onMouseLeave={e => (e.currentTarget.style.color = '#2A2A2A')}>
                                        {showPassIds.has(proxy._id) ? <EyeOff style={{ width: '12px', height: '12px' }} /> : <Eye style={{ width: '12px', height: '12px' }} />}
                                      </button>
                                    )}
                                    <button onClick={() => copy(cred.isPass ? (proxy.password ?? '') : cred.value, cred.label)}
                                      style={{ color: '#CCCCCC', transition: 'color 0.15s' }}
                                      onMouseEnter={e => (e.currentTarget.style.color = '#666')}
                                      onMouseLeave={e => (e.currentTarget.style.color = '#2A2A2A')}>
                                      <Copy style={{ width: '12px', height: '12px' }} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                              <button disabled={proxy.replacedCount >= 3 || actionLoading === `${proxy._id}-replace`} onClick={() => handleAction(proxy._id, 'replace')}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, padding: '5px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.20)', color: '#BBBBBB', transition: 'color 0.15s, background 0.15s' }}
                                onMouseEnter={e => { if (proxy.replacedCount < 3) { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.28)' }}}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.20)' }}>
                                {actionLoading === `${proxy._id}-replace` ? <Loader2 style={{ width: '11px', height: '11px', animation: 'spin 1s linear infinite' }} /> : <RotateCcw style={{ width: '11px', height: '11px' }} />}
                                Замінити {proxy.replacedCount > 0 ? `(${proxy.replacedCount}/3)` : ''}
                              </button>
                              <button disabled={actionLoading === `${proxy._id}-check`} onClick={() => handleAction(proxy._id, 'check')}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, padding: '5px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.20)', color: '#BBBBBB', transition: 'color 0.15s, background 0.15s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.28)' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.20)' }}>
                                {actionLoading === `${proxy._id}-check` ? <Loader2 style={{ width: '11px', height: '11px', animation: 'spin 1s linear infinite' }} /> : <RefreshCw style={{ width: '11px', height: '11px' }} />}
                                Перевірити
                              </button>
                              <button onClick={() => handleAction(proxy._id, 'toggle_renew')}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, padding: '5px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.20)', color: proxy.autoRenew ? '#22C55E' : '#444', transition: 'color 0.15s, background 0.15s' }}>
                                {proxy.autoRenew ? <CheckCircle style={{ width: '11px', height: '11px' }} /> : <XCircle style={{ width: '11px', height: '11px' }} />}
                                Авто-поновлення
                              </button>
                              <button onClick={() => copy(`${proxy.host}:${proxy.port}:${proxy.username}:${proxy.password ?? ''}`, 'Рядок')}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, padding: '5px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.20)', color: '#EEEEEE', marginLeft: 'auto', transition: 'color 0.15s, background 0.15s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.28)' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#333'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.20)' }}>
                                <Copy style={{ width: '11px', height: '11px' }} /> Копіювати рядок
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Expand button */}
            {filtered.length > VISIBLE && (
              <button
                onClick={() => setListExpanded(e => !e)}
                style={{
                  width: '100%', padding: '12px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  fontSize: '12px', fontWeight: 600, color: '#555',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  background: 'transparent', transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#555'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)', transform: listExpanded ? 'rotate(180deg)' : 'none' }}>
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {listExpanded ? 'Згорнути' : `Показати ще ${filtered.length - VISIBLE}`}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
