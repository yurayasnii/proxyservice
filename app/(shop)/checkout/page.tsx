'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, ArrowLeft, Loader2, CreditCard, Bitcoin } from 'lucide-react'

export default function CheckoutPage() {
  const [method, setMethod] = useState<'card' | 'crypto'>('card')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handlePay() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false); setDone(true)
  }

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#060606' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(34,197,94,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <CheckCircle style={{ width: '26px', height: '26px', color: '#22C55E' }} />
      </div>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '28px', letterSpacing: '-0.03em', color: '#FFFFFF', marginBottom: '10px' }}>Замовлення прийнято</h2>
      <p style={{ fontSize: '13.5px', color: '#EEEEEE', marginBottom: '32px', textAlign: 'center', maxWidth: '340px', lineHeight: 1.6 }}>
        Проксі будуть активовані після підтвердження оплати. Перевірте розділ «Мої проксі».
      </p>
      <Link href="/proxies">
        <button style={{ padding: '10px 24px', borderRadius: '10px', background: '#FFFFFF', color: '#000', fontSize: '13.5px', fontWeight: 600 }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}>
          Мої проксі
        </button>
      </Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '60px', background: '#060606' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 24px' }}>
        <Link href="/cart">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#EEEEEE', marginBottom: '32px', cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#888')}
            onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
            <ArrowLeft style={{ width: '13px', height: '13px' }} />
            Назад до кошику
          </div>
        </Link>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '26px', letterSpacing: '-0.03em', color: '#FFFFFF', marginBottom: '28px' }}>
          Оформлення
        </h1>

        {/* Method */}
        <div style={{ background: '#0A0A0A', borderRadius: '14px', padding: '20px', marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CCCCCC', marginBottom: '14px' }}>Спосіб оплати</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { id: 'card' as const,   label: 'Картка', sub: 'Visa · MC · Apple Pay', icon: CreditCard },
              { id: 'crypto' as const, label: 'Крипто', sub: 'USDT · BTC · ETH · TON', icon: Bitcoin },
            ].map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '18px 12px', borderRadius: '10px', background: method === m.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)', transition: 'background 0.15s' }}>
                <m.icon style={{ width: '18px', height: '18px', color: method === m.id ? '#888' : '#2A2A2A' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: method === m.id ? '#FFFFFF' : '#333' }}>{m.label}</span>
                <span style={{ fontSize: '11px', color: method === m.id ? '#333' : '#1E1E1E' }}>{m.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div style={{ background: '#0A0A0A', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', color: '#EEEEEE', lineHeight: 1.7 }}>
            {method === 'card'
              ? 'Приймаються картки Visa, Mastercard, Maestro, Apple Pay і Google Pay. Підтримуються українські та європейські банківські картки.'
              : 'Після підтвердження ви отримаєте адресу гаманця. Проксі активуються автоматично після 1 підтвердження мережі.'}
          </p>
        </div>

        {/* Empty cart notice */}
        <div style={{ background: '#0A0A0A', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', color: '#EEEEEE' }}>Кошик порожній — додайте товари у каталозі</span>
          <Link href="/catalog">
            <button style={{ fontSize: '12.5px', fontWeight: 500, color: '#BBBBBB', padding: '6px 14px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', transition: 'color 0.15s, background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}>
              До каталогу
            </button>
          </Link>
        </div>

        <button disabled={loading} onClick={handlePay}
          style={{ width: '100%', height: '48px', borderRadius: '12px', background: '#FFFFFF', color: '#000', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '-0.01em', opacity: loading ? 0.7 : 1 }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = loading ? '0.7' : '1'}>
          {loading ? <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" /> : null}
          {method === 'card' ? 'Оплатити карткою' : 'Отримати адресу оплати'}
        </button>
      </div>
    </div>
  )
}
