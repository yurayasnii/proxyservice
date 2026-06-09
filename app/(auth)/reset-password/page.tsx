'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Mail, CheckCircle, Eye, EyeOff, Check } from 'lucide-react'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [newPass, setNewPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  const passChecks = [
    { label: '8+ символів', ok: newPass.length >= 8 },
    { label: 'Велика літера', ok: /[A-Z]/.test(newPass) },
    { label: 'Цифра', ok: /[0-9]/.test(newPass) },
  ]
  const passValid = passChecks.every(c => c.ok)

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return toast.error('Введіть email')
    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Помилка'); return }
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    if (!passValid) return toast.error('Пароль не відповідає вимогам')
    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPass }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Посилання застаріло. Запросіть нове.'); return }
      setResetDone(true)
    } finally {
      setLoading(false)
    }
  }

  // Confirm flow (user arrived via email link)
  if (token) {
    if (resetDone) {
      return (
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <CheckCircle className="w-10 h-10 mx-auto mb-4" style={{ color: '#10B981' }} />
          <p className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>Пароль змінено!</p>
          <p className="text-sm mb-6" style={{ color: '#DDDDDD' }}>
            Тепер ви можете увійти з новим паролем.
          </p>
          <Link href="/login">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity"
              style={{ background: '#FFFFFF', color: '#000' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              Увійти
            </button>
          </Link>
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
          Новий пароль
        </h1>
        <p className="text-sm mb-7" style={{ color: '#CCCCCC' }}>
          Введіть новий пароль для вашого акаунту.
        </p>
        <form onSubmit={handleConfirm} className="space-y-5">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: '#CCCCCC' }}>Новий пароль</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 rounded-xl px-4 pr-11 text-sm outline-none transition-colors"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                autoFocus
              />
              <button type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#EEEEEE' }}
                onClick={() => setShowPass(p => !p)}
                onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPass && (
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
          </div>
          <button type="submit" disabled={loading || !passValid}
            className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
            style={{ background: '#FFFFFF', color: '#000' }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Змінити пароль'}
          </button>
        </form>
      </div>
    )
  }

  // Request flow
  return (
    <div className="rounded-2xl p-8"
      style={{
        background: 'rgba(10,10,10,0.85)',
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        animation: 'border-breathe 3s ease-in-out infinite',
      }}>
      <Link href="/login" className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors"
        style={{ color: '#CCCCCC' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#888')}
        onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
        <ArrowLeft className="w-3.5 h-3.5" /> Назад до входу
      </Link>

      <h1 className="text-2xl font-bold mb-1.5 tracking-tight"
        style={{ fontFamily: 'Syne, sans-serif', color: '#FFFFFF' }}>
        Скинути пароль
      </h1>
      <p className="text-sm mb-7" style={{ color: '#CCCCCC' }}>
        Введіть email — надішлемо посилання для скидання.
      </p>

      {sent ? (
        <div className="rounded-xl p-6 text-center"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#10B981' }} />
          <p className="font-semibold mb-1.5" style={{ color: '#FFFFFF' }}>Лист надіслано!</p>
          <p className="text-sm" style={{ color: '#CCCCCC' }}>
            Перевірте <strong style={{ color: '#FFFFFF' }}>{email}</strong> та перейдіть за посиланням. Посилання дійсне 15 хвилин.
          </p>
        </div>
      ) : (
        <form onSubmit={handleRequest} className="space-y-5">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: '#CCCCCC' }}>Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 rounded-xl px-4 pl-10 text-sm outline-none transition-colors"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                autoFocus
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#EEEEEE' }} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
            style={{ background: '#FFFFFF', color: '#000' }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Надіслати посилання'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="rounded-2xl p-8" style={{ background: 'rgba(10,10,10,0.85)', border: '1px solid rgba(255,255,255,0.18)' }}>
        <div className="skeleton h-8 w-48 rounded-lg mb-4" />
        <div className="skeleton h-11 w-full rounded-xl" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
