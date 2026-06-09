'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Check, ArrowRight } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

const OAUTH = [
  {
    id: 'google', label: 'Google',
    icon: <GoogleIcon />,
    style: { background: '#FFFFFF', color: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)' },
    hover: { background: '#F0F0F0' },
  },
  {
    id: 'github', label: 'GitHub',
    // eslint-disable-next-line @next/next/no-img-element
    icon: <img src="/icons/github-1a1a1a.svg" alt="GitHub" className="w-4 h-4" />,
    style: { background: '#FFFFFF', color: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)' },
    hover: { background: '#F0F0F0' },
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [form, setForm] = useState({ email: '', username: '', password: '', referralCode: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleOAuth(provider: string) {
    setOauthLoading(provider)
    window.location.href = `/api/v1/auth/oauth-start?provider=${provider}`
  }

  const passChecks = [
    { label: '8+ символів', ok: form.password.length >= 8 },
    { label: 'Велика літера', ok: /[A-Z]/.test(form.password) },
    { label: 'Цифра', ok: /[0-9]/.test(form.password) },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    if (!form.email) return setErrors({ email: 'Введіть email' })
    if (!form.username || form.username.length < 3) return setErrors({ username: 'Мін. 3 символи' })
    if (!passChecks.every(c => c.ok)) return setErrors({ password: 'Пароль занадто слабкий' })

    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Помилка реєстрації'); return }
      toast.success('Акаунт створено!')
      router.push('/dashboard')
    } catch {
      toast.error('Помилка мережі. Спробуйте ще.')
    } finally {
      setLoading(false)
    }
  }

  function field(name: keyof typeof form, label: string, type = 'text', placeholder = '') {
    const err = errors[name]
    return (
      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: '#CCCCCC' }}>{label}</label>
        <input
          type={type}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => setForm({ ...form, [name]: e.target.value })}
          className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-colors"
          style={{
            background: '#111',
            border: err ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.08)',
            color: '#FFFFFF',
            fontFamily: name === 'referralCode' ? 'JetBrains Mono, monospace' : undefined,
          }}
          onFocus={e => { if (!err) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
          onBlur={e => { if (!err) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        />
        {err && <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>{err}</p>}
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-8"
      style={{
        background: 'rgba(10,10,10,0.85)',
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        animation: 'border-breathe 3s ease-in-out infinite',
      }}>

      <h1 className="text-2xl font-bold mb-1.5 tracking-tight"
        style={{ fontFamily: 'Syne, sans-serif', color: '#FFFFFF' }}>
        Створити акаунт
      </h1>
      <p className="text-sm mb-7" style={{ color: '#CCCCCC' }}>
        Вже є акаунт?{' '}
        <Link href="/login" className="font-medium transition-opacity"
          style={{ color: '#FFFFFF' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          Увійти →
        </Link>
      </p>

      {/* OAuth buttons */}
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        {OAUTH.map(o => (
          <button key={o.id}
            onClick={() => handleOAuth(o.id)}
            disabled={!!oauthLoading}
            className="flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-all"
            style={{ ...o.style, opacity: oauthLoading && oauthLoading !== o.id ? 0.5 : 1 }}
            onMouseEnter={e => Object.assign((e.currentTarget as HTMLButtonElement).style, o.hover)}
            onMouseLeave={e => Object.assign((e.currentTarget as HTMLButtonElement).style, { background: o.style.background })}>
            {oauthLoading === o.id
              ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#1a1a1a' }} />
              : o.icon}
            <span className="hidden sm:inline">{o.label}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <span className="text-xs font-medium" style={{ color: '#EEEEEE' }}>або</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {field('email', 'Email', 'email', 'you@example.com')}
        {field('username', 'Нікнейм', 'text', 'username')}

        {/* Password with eye toggle */}
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: '#CCCCCC' }}>Пароль</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full h-11 rounded-xl px-4 pr-11 text-sm outline-none transition-colors"
              style={{
                background: '#111',
                border: errors.password ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.08)',
                color: '#FFFFFF',
              }}
              onFocus={e => { if (!errors.password) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
              onBlur={e => { if (!errors.password) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            />
            <button type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: '#EEEEEE' }}
              onClick={() => setShowPass(!showPass)}
              onMouseEnter={e => (e.currentTarget.style.color = '#888')}
              onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password strength */}
          {form.password && (
            <div className="flex gap-4 mt-2.5">
              {passChecks.map(c => (
                <div key={c.label} className="flex items-center gap-1 text-xs">
                  <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: c.ok ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${c.ok ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                    {c.ok && <Check className="w-2 h-2" style={{ color: '#10B981' }} />}
                  </div>
                  <span style={{ color: c.ok ? '#10B981' : '#444' }}>{c.label}</span>
                </div>
              ))}
            </div>
          )}
          {errors.password && <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>{errors.password}</p>}
        </div>

        {field('referralCode', "Реферальний код (необов'язково)", 'text', 'XXXXXXXX')}

        <button type="submit" disabled={loading}
          className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
          style={{ background: '#FFFFFF', color: '#000' }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}>
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <><span>Зареєструватися</span><ArrowRight className="w-4 h-4" /></>}
        </button>

        <p className="text-xs text-center" style={{ color: '#EEEEEE' }}>
          Реєструючись, ви погоджуєтесь з{' '}
          <Link href="/terms" className="underline transition-colors"
            style={{ color: '#CCCCCC' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
            умовами використання
          </Link>
        </p>
      </form>
    </div>
  )
}
