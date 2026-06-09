'use client'



import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { User, Shield, Copy, Loader2, Check, Link2, CheckCircle2, Eye, EyeOff } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="#e6edf3" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

const PROVIDERS = [
  { id: 'google', name: 'Google', icon: <GoogleIcon /> },
  { id: 'github', name: 'GitHub', icon: <GitHubIcon /> },
]

interface UserData {
  username: string; email: string; referralCode?: string; passwordHash?: boolean; oauthProviders?: string[]
}

const FIELD_STYLE: React.CSSProperties = {
  width: '100%', height: '42px', borderRadius: '9px', padding: '0 14px',
  background: 'rgba(255,255,255,0.20)', border: 'none', outline: 'none',
  color: '#FFFFFF', fontSize: '13.5px',
  transition: 'background 0.15s ease, box-shadow 0.15s ease',
}

export default function SettingsPage() {
  
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPass, setChangingPass] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/v1/auth/me').then(r => r.json()).then(d => { setUser(d.data); setUsername(d.data?.username ?? '') }).finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!username.trim()) return toast.error('Нікнейм не може бути порожнім')
    if (username === user?.username) return toast.success('Налаштування актуальні')
    setSaving(true)
    try {
      const res = await fetch('/api/v1/auth/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Помилка'); return }
      setUser(data.data); toast.success('Нікнейм оновлено')
    } finally { setSaving(false) }
  }

  async function handleChangePassword() {
    if (!currentPass) return toast.error('Введіть поточний пароль')
    const checks = [newPass.length >= 8, /[A-Z]/.test(newPass), /[0-9]/.test(newPass)]
    if (!checks.every(Boolean)) return toast.error('Новий пароль не відповідає вимогам')
    setChangingPass(true)
    try {
      const res = await fetch('/api/v1/auth/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Помилка'); return }
      toast.success('Пароль змінено'); setCurrentPass(''); setNewPass('')
    } finally { setChangingPass(false) }
  }

  function copyRefCode() {
    navigator.clipboard.writeText(user?.referralCode ?? '')
    setCopied(true); toast.success('Скопійовано')
    setTimeout(() => setCopied(false), 2000)
  }

  const passChecks = [
    { label: '8+ символів', ok: newPass.length >= 8 },
    { label: 'Велика літера', ok: /[A-Z]/.test(newPass) },
    { label: 'Цифра', ok: /[0-9]/.test(newPass) },
  ]

  if (loading) return (
    <div style={{ maxWidth: '520px' }} className="space-y-3">
      <div className="skeleton" style={{ height: '32px', width: '140px', borderRadius: '8px' }} />
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />)}
    </div>
  )

  return (
    <div style={{ maxWidth: '1080px' }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '26px', letterSpacing: '-0.03em', color: '#FFFFFF', marginBottom: '20px' }}>Налаштування</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>

      {/* LEFT column — Profile */}
      <div className="space-y-4">
      {/* Profile */}
      <div className="form-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <User style={{ width: '13px', height: '13px', color: '#CCCCCC' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#DDDDDD' }}>Профіль</span>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label style={{ fontSize: '11.5px', color: '#EEEEEE', display: 'block', marginBottom: '7px' }}>Email</label>
            <input value={user?.email ?? ''} disabled style={{ ...FIELD_STYLE, opacity: 0.35, cursor: 'not-allowed' }} />
          </div>

          {/* Username */}
          <div>
            <label style={{ fontSize: '11.5px', color: '#EEEEEE', display: 'block', marginBottom: '7px' }}>Нікнейм</label>
            <input value={username} onChange={e => setUsername(e.target.value)} style={FIELD_STYLE}
              onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.38)')}
              onBlur={e => (e.currentTarget.style.boxShadow = 'none')} />
            <p style={{ fontSize: '11px', color: '#CCCCCC', marginTop: '5px' }}>Тільки латиниця, цифри та підкреслення</p>
          </div>

          {/* Referral */}
          <div>
            <label style={{ fontSize: '11.5px', color: '#EEEEEE', display: 'block', marginBottom: '7px' }}>Реферальний код</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input value={user?.referralCode ?? ''} disabled readOnly style={{ ...FIELD_STYLE, flex: 1, fontFamily: 'JetBrains Mono, monospace', opacity: 0.5 }} />
              <button onClick={copyRefCode} style={{
                width: '42px', height: '42px', borderRadius: '9px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: copied ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.20)', color: copied ? '#22C55E' : '#333',
                transition: 'background 0.15s, color 0.15s',
              }}>
                {copied ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#CCCCCC', marginTop: '5px' }}>Запросіть друга — отримайте бонус</p>
          </div>
        </div>

        <button
          disabled={saving || username === user?.username}
          onClick={handleSave}
          style={{ marginTop: '20px', height: '40px', padding: '0 20px', borderRadius: '9px', background: '#FFFFFF', color: '#000', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', opacity: (saving || username === user?.username) ? 0.4 : 1, transition: 'opacity 0.15s' }}
          onMouseEnter={e => { if (!saving && username !== user?.username) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = (saving || username === user?.username) ? '0.4' : '1'}
        >
          {saving ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" /> : null}
          Зберегти
        </button>
      </div>

      </div>{/* end LEFT column */}

      {/* RIGHT column — Accounts + Security + Danger */}
      <div className="space-y-4">
      {/* Connected accounts */}
      <div className="form-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link2 style={{ width: '13px', height: '13px', color: '#CCCCCC' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#DDDDDD' }}>Акаунти</span>
          </div>
        </div>
        <div className="space-y-2">
          {PROVIDERS.map(p => {
            const connected = user?.oauthProviders?.includes(p.id) ?? false
            return (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: '10px',
                background: connected ? 'rgba(255,255,255,0.03)' : 'transparent',
                transition: 'background 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {p.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: connected ? '#888' : '#333' }}>{p.name}</p>
                  </div>
                </div>
                {connected ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 style={{ width: '13px', height: '13px', color: '#22C55E' }} />
                    <span style={{ fontSize: '11.5px', color: '#22C55E' }}>Підключено</span>
                  </div>
                ) : (
                  <button onClick={() => { setConnecting(p.id); window.location.href = `/api/v1/auth/oauth-start?provider=${p.id}` }}
                    disabled={!!connecting}
                    style={{ fontSize: '12px', fontWeight: 500, color: '#EEEEEE', padding: '5px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.20)', transition: 'color 0.15s, background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.30)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#333'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.20)' }}>
                    {connecting === p.id ? <Loader2 style={{ width: '12px', height: '12px', display: 'inline' }} className="animate-spin" /> : 'Підключити'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Security */}
      <div className="form-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Shield style={{ width: '13px', height: '13px', color: '#CCCCCC' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#DDDDDD' }}>Безпека</span>
        </div>

        {user?.passwordHash === false && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(245,158,11,0.06)', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: '#F59E0B' }}>OAuth-акаунт — зміна пароля недоступна</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Current password */}
          <div>
            <label style={{ fontSize: '11.5px', color: '#EEEEEE', display: 'block', marginBottom: '7px' }}>Поточний пароль</label>
            <div style={{ position: 'relative' }}>
              <input type={showCurrentPass ? 'text' : 'password'} value={currentPass} onChange={e => setCurrentPass(e.target.value)}
                placeholder="••••••••" disabled={user?.passwordHash === false}
                style={{ ...FIELD_STYLE, paddingRight: '42px', opacity: user?.passwordHash === false ? 0.35 : 1 }}
                onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.38)')}
                onBlur={e => (e.currentTarget.style.boxShadow = 'none')} />
              <button type="button" onClick={() => setShowCurrentPass(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#CCCCCC' }}>
                {showCurrentPass ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label style={{ fontSize: '11.5px', color: '#EEEEEE', display: 'block', marginBottom: '7px' }}>Новий пароль</label>
            <div style={{ position: 'relative' }}>
              <input type={showNewPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                placeholder="••••••••" disabled={user?.passwordHash === false}
                style={{ ...FIELD_STYLE, paddingRight: '42px', opacity: user?.passwordHash === false ? 0.35 : 1 }}
                onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.38)')}
                onBlur={e => (e.currentTarget.style.boxShadow = 'none')} />
              <button type="button" onClick={() => setShowNewPass(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#CCCCCC' }}>
                {showNewPass ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
              </button>
            </div>
            {newPass && (
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                {passChecks.map(c => (
                  <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.ok ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {c.ok && <Check style={{ width: '7px', height: '7px', color: '#22C55E' }} />}
                    </div>
                    <span style={{ fontSize: '11px', color: c.ok ? '#22C55E' : '#555555' }}>{c.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          disabled={changingPass || !currentPass || !newPass || user?.passwordHash === false}
          onClick={handleChangePassword}
          style={{ marginTop: '20px', height: '40px', padding: '0 20px', borderRadius: '9px', background: 'rgba(255,255,255,0.25)', color: '#CCCCCC', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', opacity: (changingPass || !currentPass || !newPass || user?.passwordHash === false) ? 0.4 : 1, transition: 'color 0.15s, background 0.15s, opacity 0.15s' }}
          onMouseEnter={e => { if (!changingPass && currentPass && newPass) { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.32)' }}}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#555'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)' }}>
          {changingPass ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" /> : null}
          Змінити пароль
        </button>
      </div>

      {/* Danger zone */}
      <div className="form-section">
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444', marginBottom: '4px' }}>Небезпечна зона</p>
        <p style={{ fontSize: '12px', color: '#DDDDDD', marginBottom: '16px' }}>Ці дії незворотні і не можуть бути скасовані.</p>
        <button style={{ height: '36px', padding: '0 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', color: '#EF4444', fontSize: '12.5px', fontWeight: 500, transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}>
          Видалити акаунт
        </button>
      </div>

      </div>{/* end RIGHT column */}
      </div>{/* end grid */}
    </div>
  )
}
