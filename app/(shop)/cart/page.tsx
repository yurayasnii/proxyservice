'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, Loader2, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useCart, CartItem } from '@/lib/hooks/useCart'

function exportToFile(items: CartItem[]) {
  const lines = items.flatMap(item =>
    Array.from({ length: item.quantity }, (_, i) =>
      `${item.countryCode.toLowerCase()}-proxy-${i + 1}.${item.type}.proxyservice.io:8080:user_${item.planId}:pass_${item.planId}`
    )
  )
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'proxies.txt'; a.click()
  URL.revokeObjectURL(url)
}

export default function CartPage() {
  const { items, removeItem, clearCart, total, count } = useCart()
  const router = useRouter()
  const [buying, setBuying] = useState(false)
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    async function check() {
      const res = await fetch('/api/v1/auth/me')
      if (res.ok) { setAuthed(true); return }
      if (res.status === 401) {
        const ref = await fetch('/api/v1/auth/refresh', { method: 'POST' })
        setAuthed(ref.ok ? true : false)
      } else { setAuthed(false) }
    }
    check()
  }, [])

  async function handleCheckout() {
    if (!items.length) return
    setBuying(true)
    try {
      for (const item of items) {
        const res = await fetch('/api/v1/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: item.planId, productId: item.productId, quantity: item.quantity, paymentMethod: 'balance' }),
        })
        const data = await res.json()
        if (!res.ok) {
          if (res.status === 401) { router.push('/login'); return }
          toast.error(data.error ?? `Помилка: ${item.productName}`); return
        }
      }
      clearCart(); toast.success('Замовлення оформлено!'); router.push('/proxies')
    } finally { setBuying(false) }
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '60px', background: '#060606' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/catalog">
              <div style={{ color: '#EEEEEE', cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
                <ArrowLeft style={{ width: '18px', height: '18px' }} />
              </div>
            </Link>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '26px', letterSpacing: '-0.03em', color: '#FFFFFF' }}>
              Кошик
            </h1>
            {count > 0 && (
              <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#EEEEEE', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '5px' }}>
                {count}
              </span>
            )}
          </div>

          {items.length > 0 && (
            <button onClick={() => exportToFile(items)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#EEEEEE', padding: '6px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', transition: 'color 0.15s, background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#333'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' }}>
              <Download style={{ width: '12px', height: '12px' }} />
              Експорт .txt
            </button>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', background: '#0A0A0A', borderRadius: '16px' }}>
            <ShoppingCart style={{ width: '28px', height: '28px', color: '#CCCCCC', marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '6px' }}>Кошик порожній</p>
            <p style={{ fontSize: '13px', color: '#DDDDDD', marginBottom: '24px' }}>Додайте проксі з каталогу</p>
            <Link href="/catalog">
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '9px', background: '#FFFFFF', color: '#000', fontSize: '13px', fontWeight: 600 }}>
                <ArrowLeft style={{ width: '13px', height: '13px' }} />
                До каталогу
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden', marginBottom: '12px' }}>
              {items.map((item, i) => (
                <div key={`${item.productId}-${item.planId}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '20px', borderRadius: '3px', overflow: 'hidden', background: '#111', flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/flags/${item.countryCode.toLowerCase()}.png`} alt={item.countryName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '13.5px', fontWeight: 500, color: '#CCCCCC' }}>{item.productName}</p>
                      <p style={{ fontSize: '11.5px', color: '#DDDDDD', marginTop: '2px' }}>
                        {item.type} · {item.duration} · {item.ipCount} IP × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, color: '#DDDDDD' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button onClick={() => removeItem(item.productId, item.planId)}
                      style={{ color: '#DDDDDD', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#222')}>
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total + checkout */}
            <div style={{ background: '#0A0A0A', borderRadius: '14px', padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CCCCCC', marginBottom: '6px' }}>Разом</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '32px', letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1 }}>
                  ${total.toFixed(2)}
                </p>
              </div>

              {authed === false ? (
                <Link href="/login">
                  <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '11px 22px', borderRadius: '10px', background: '#FFFFFF', color: '#000', fontSize: '13.5px', fontWeight: 600 }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}>
                    Увійти для оформлення
                    <ArrowRight style={{ width: '14px', height: '14px' }} />
                  </button>
                </Link>
              ) : (
                <button onClick={handleCheckout} disabled={buying}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '11px 22px', borderRadius: '10px', background: '#FFFFFF', color: '#000', fontSize: '13.5px', fontWeight: 600, opacity: buying ? 0.6 : 1 }}
                  onMouseEnter={e => { if (!buying) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = buying ? '0.6' : '1'}>
                  {buying ? <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" /> : <ArrowRight style={{ width: '14px', height: '14px' }} />}
                  Оформити замовлення
                </button>
              )}
            </div>

            <p style={{ fontSize: '11.5px', textAlign: 'center', color: '#CCCCCC', marginTop: '14px' }}>
              Оплата з балансу · Активація протягом 30 секунд
            </p>
          </>
        )}
      </div>
    </div>
  )
}
