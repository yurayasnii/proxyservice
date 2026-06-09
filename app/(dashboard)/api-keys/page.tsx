'use client'



import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Key, Plus, Copy, Trash2, Loader2, X, AlertTriangle } from 'lucide-react'

interface ApiKey {
  _id: string; name: string; keyHash: string; permissions: string[]
  lastUsedAt?: string; createdAt: string
}

const FIELD_STYLE: React.CSSProperties = {
  width: '100%', height: '42px', borderRadius: '9px', padding: '0 14px',
  background: 'rgba(255,255,255,0.20)', border: 'none', outline: 'none',
  color: '#FFFFFF', fontSize: '13.5px',
}

export default function ApiKeysPage() {
  
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function fetchKeys() {
    setLoading(true)
    try { const res = await fetch('/api/v1/api-keys'); const data = await res.json(); setKeys(data.data?.items ?? []) }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchKeys() }, [])

  async function createKey() {
    if (!newKeyName.trim()) return toast.error('Введіть назву ключа')
    setCreating(true)
    try {
      const res = await fetch('/api/v1/api-keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newKeyName, permissions: ['proxies:read', 'orders:read'] }) })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error)
      setNewKey(data.data?.key); setNewKeyName(''); setShowModal(false); await fetchKeys()
    } finally { setCreating(false) }
  }

  async function deleteKey(id: string) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/v1/api-keys/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Ключ видалено'); setKeys(prev => prev.filter(k => k._id !== id)) }
    } finally { setDeleting(false); setDeleteConfirm(null) }
  }

  return (
    <div className="space-y-6">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '26px', letterSpacing: '-0.03em', color: '#FFFFFF' }}>API Keys</h1>
          <p style={{ fontSize: '12px', color: '#CCCCCC', marginTop: '3px' }}>Для інтеграції з ProxyService API</p>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 18px', borderRadius: '9px', background: '#FFFFFF', color: '#000', fontSize: '13px', fontWeight: 600 }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}>
          <Plus style={{ width: '13px', height: '13px' }} /> Новий ключ
        </button>
      </div>

      {/* New key reveal */}
      {newKey && (
        <div style={{ background: '#0A0A0A', borderRadius: '12px', padding: '18px 20px', borderLeft: '2px solid #22C55E' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#22C55E' }}>Ключ створено — збережіть його, він більше не відображатиметься</p>
            <button onClick={() => setNewKey(null)} style={{ color: '#EEEEEE', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#888')}
              onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <code style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: '12.5px', color: '#DDDDDD', overflowX: 'auto', display: 'block', wordBreak: 'break-all' }}>
              {newKey}
            </code>
            <button onClick={() => { navigator.clipboard.writeText(newKey); toast.success('Скопійовано') }}
              style={{ width: '32px', height: '32px', borderRadius: '7px', background: 'rgba(34,197,94,0.08)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Copy style={{ width: '13px', height: '13px' }} />
            </button>
          </div>
          <button onClick={() => setNewKey(null)} style={{ fontSize: '11.5px', color: '#CCCCCC', marginTop: '10px', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#555')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555555')}>
            Я зберіг ключ — закрити
          </button>
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="animate-modal-in" style={{ width: '100%', maxWidth: '380px', borderRadius: '16px', background: '#0C0C0C', boxShadow: '0 0 0 1px rgba(255,255,255,0.25), 0 32px 80px rgba(0,0,0,0.8)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', color: '#FFFFFF' }}>Новий API ключ</p>
              <button onClick={() => setShowModal(false)} style={{ color: '#EEEEEE', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            <label style={{ fontSize: '11.5px', color: '#EEEEEE', display: 'block', marginBottom: '8px' }}>Назва ключа</label>
            <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createKey()} placeholder="Production Bot" autoFocus
              style={FIELD_STYLE}
              onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.35)')}
              onBlur={e => (e.currentTarget.style.boxShadow = 'none')} />
            <p style={{ fontSize: '11px', color: '#CCCCCC', marginTop: '6px', marginBottom: '20px' }}>Дозволи: proxies:read, orders:read</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, height: '42px', borderRadius: '9px', background: 'rgba(255,255,255,0.20)', color: '#BBBBBB', fontSize: '13px', fontWeight: 500 }}>Скасувати</button>
              <button onClick={createKey} disabled={creating || !newKeyName.trim()} style={{ flex: 1, height: '42px', borderRadius: '9px', background: '#FFFFFF', color: '#000', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: (creating || !newKeyName.trim()) ? 0.5 : 1 }}>
                {creating ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" /> : null}
                Створити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null) }}>
          <div className="animate-modal-in" style={{ width: '100%', maxWidth: '360px', borderRadius: '16px', background: '#0C0C0C', boxShadow: '0 0 0 1px rgba(239,68,68,0.15), 0 32px 80px rgba(0,0,0,0.8)', padding: '24px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <AlertTriangle style={{ width: '16px', height: '16px', color: '#EF4444' }} />
            </div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', color: '#FFFFFF', marginBottom: '8px' }}>Видалити ключ?</p>
            <p style={{ fontSize: '13px', color: '#EEEEEE', lineHeight: 1.6, marginBottom: '20px' }}>Цей ключ буде видалено назавжди. Інтеграції що його використовують перестануть працювати.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, height: '42px', borderRadius: '9px', background: 'rgba(255,255,255,0.20)', color: '#BBBBBB', fontSize: '13px', fontWeight: 500 }}>Скасувати</button>
              <button onClick={() => deleteKey(deleteConfirm)} disabled={deleting} style={{ flex: 1, height: '42px', borderRadius: '9px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: deleting ? 0.6 : 1 }}>
                {deleting ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" /> : null}
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keys list */}
      <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key style={{ width: '13px', height: '13px', color: '#CCCCCC' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Активні ключі</span>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#CCCCCC', fontFamily: 'JetBrains Mono, monospace' }}>{keys.length} / 10</span>
        </div>

        {loading ? (
          <div style={{ padding: '12px' }} className="space-y-2">
            {[1,2].map(i => <div key={i} className="skeleton" style={{ height: '56px', borderRadius: '8px' }} />)}
          </div>
        ) : keys.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Key style={{ width: '24px', height: '24px', color: '#CCCCCC', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>Немає API ключів</p>
            <p style={{ fontSize: '12px', color: '#DDDDDD' }}>Створіть перший ключ для інтеграції</p>
          </div>
        ) : keys.map((key, i) => (
          <div key={key._id}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.20)' : 'none', transition: 'background 0.15s ease' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#CCCCCC' }}>{key.name}</p>
              <p style={{ fontSize: '11.5px', fontFamily: 'JetBrains Mono, monospace', color: '#CCCCCC', marginTop: '2px' }}>
                ps_••••••••{key.keyHash.slice(-8)}
              </p>
              <div style={{ display: 'flex', gap: '4px', marginTop: '5px' }}>
                {key.permissions.map(p => (
                  <span key={p} style={{ fontSize: '10px', fontWeight: 600, color: '#EEEEEE', background: 'rgba(255,255,255,0.20)', padding: '2px 7px', borderRadius: '4px', letterSpacing: '0.03em' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
              <p style={{ fontSize: '11.5px', color: '#DDDDDD' }}>
                {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString('uk-UA') : 'Не використовувався'}
              </p>
              <button onClick={() => setDeleteConfirm(key._id)}
                style={{ width: '30px', height: '30px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCCCCC', transition: 'color 0.15s, background 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.07)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#2A2A2A'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
                <Trash2 style={{ width: '13px', height: '13px' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Docs */}
      <div style={{ background: '#0A0A0A', borderRadius: '12px', padding: '18px 20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#EEEEEE', marginBottom: '8px' }}>Використання</p>
        <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#CCCCCC', display: 'block', lineHeight: 1.6 }}>
          curl -H &quot;Authorization: Bearer YOUR_KEY&quot; https://proxyservice.io/api/v1/proxies
        </code>
      </div>
    </div>
  )
}
