'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, CheckCircle } from 'lucide-react'

const CHANNELS = [
  { num: '01', title: 'Live підтримка', desc: 'AI відповідає миттєво. Увійдіть у систему → Підтримка.', action: 'Відкрити чат →', href: '/login' },
  { num: '02', title: 'Email', desc: 'support@proxyservice.io', action: 'Написати →', href: 'mailto:support@proxyservice.io' },
  { num: '03', title: 'Telegram', desc: '@proxyservice_support', action: 'Відкрити →', href: 'https://t.me/proxyservice_support' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return toast.error('Заповніть усі поля')
    setLoading(true)
    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Помилка надсилання'); return }
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#060606', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-28">

        {/* Header */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] mb-6" style={{ color: '#CCCCCC' }}>
            Зв'язок
          </p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,5vw,64px)', lineHeight: .92, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Напишіть<br />
            <span className="text-wave">нам</span>
          </h1>
          <p className="text-xs uppercase tracking-widest mt-6" style={{ color: '#DDDDDD' }}>
            Відповідаємо протягом кількох годин
          </p>
        </div>

        {/* Channels */}
        <div className="mb-16">
          {CHANNELS.map((c) => (
            <div key={c.num} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="grid grid-cols-[40px_1fr_auto] gap-8 py-7 items-center">
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#EEEEEE', letterSpacing: '0.1em' }}>
                  {c.num}
                </span>
                <div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', color: '#FFFFFF', letterSpacing: '-0.01em', marginBottom: '4px' }}>
                    {c.title}
                  </p>
                  <p style={{ fontSize: '13px', color: '#AAAAAA' }}>{c.desc}</p>
                </div>
                <a href={c.href} className="text-xs font-medium whitespace-nowrap"
                  style={{ color: '#EEEEEE' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
                  {c.action}
                </a>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        </div>

        {/* Form */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '48px' }}>
          <p className="text-xs uppercase tracking-[0.18em] mb-8" style={{ color: '#CCCCCC' }}>
            Або залиш запит
          </p>

          {sent ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <CheckCircle className="w-8 h-8" style={{ color: '#22C55E' }} />
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color: '#FFFFFF' }}>
                Повідомлення надіслано
              </p>
              <p style={{ fontSize: '14px', color: '#AAAAAA' }}>
                Відповімо на {form.email} протягом кількох годин.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { key: 'name', label: "Ім'я", type: 'text', placeholder: 'Іван Петренко' },
                  { key: 'email', label: 'Email', type: 'email', placeholder: 'you@email.com' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#CCCCCC' }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full h-11 px-4 rounded-none text-sm outline-none"
                      style={{ background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }}
                      onFocus={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.4)')}
                      onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.1)')}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#CCCCCC' }}>Повідомлення</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Опишіть ваш запит..."
                  rows={5}
                  className="w-full px-4 py-3 text-sm outline-none resize-none"
                  style={{ background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.4)')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
              <div className="pt-4">
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 px-8 h-11 text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: '#FFFFFF', color: '#000' }}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Надіслати
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
