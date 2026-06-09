'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Zap, Shield, Globe, Check, Loader2, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'

interface Plan {
  _id: string; duration: string; ipCount: number; priceUsdt: number; discount: number; isPopular: boolean
}
interface Product {
  _id: string; name: string; type: string; countryCode: string; countryName: string
  city: string; ispName: string; speedMbps: number; uptimePercent: number
  protocols: string[]; description: string; isFeatured: boolean; tags: string[]; plans: Plan[]
}

const DURATION_LABELS: Record<string, string> = {
  '1d': '1д', '7d': '7д', '30d': '30д', '90d': '90д', '180d': '6міс', '1y': '1рік',
}
const TYPE_LABEL: Record<string, string> = {
  residential: 'Residential', datacenter: 'Datacenter', mobile: 'Mobile', isp: 'ISP',
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [buying, setBuying] = useState(false)
  const [qty, setQty] = useState(1)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    fetch(`/api/v1/products/${id}`).then(r => r.json()).then(d => {
      setProduct(d.data)
      const popular = d.data?.plans?.find((p: Plan) => p.isPopular)
      setSelectedPlan(popular?._id ?? d.data?.plans?.[0]?._id ?? null)
    }).finally(() => setLoading(false))
  }, [id])

  async function confirmBuy() {
    if (!selectedPlan || !plan) return
    setBuying(true)
    setConfirmOpen(false)
    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan, productId: product!._id, quantity: qty, paymentMethod: 'balance' }),
      })
      const data = await res.json()
      if (!res.ok) { if (res.status === 401) { router.push('/login'); return } return toast.error(data.error ?? 'Помилка') }
      toast.success(`Замовлення створено! ${plan.ipCount * qty} проксі активовані.`)
      router.push('/proxies')
    } finally { setBuying(false) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060606' }}>
      <Loader2 style={{ width: '18px', height: '18px', color: '#AAAAAA' }} className="animate-spin" />
    </div>
  )
  if (!product) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#060606' }}>
      <p style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>Продукт не знайдено</p>
      <Link href="/catalog" style={{ fontSize: '12px', color: '#AAAAAA' }}>← Каталог</Link>
    </div>
  )

  const plan = product.plans.find(p => p._id === selectedPlan)

  return (
    <div style={{ minHeight: '100vh', paddingTop: '68px', paddingBottom: '32px', background: '#060606' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 16px' }}>

        {/* Back */}
        <Link href="/catalog">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#AAAAAA', marginBottom: '12px', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#AAAAAA')}>
            <ArrowLeft style={{ width: '12px', height: '12px' }} /> Каталог
          </div>
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }} className="md:grid-cols-3">

          {/* ── LEFT: info panel ── */}
          <div className="md:col-span-2" style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden', background: '#0A0A0A' }}>

            {/* Header */}
            <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '26px', height: '18px', borderRadius: '2px', overflow: 'hidden', background: '#111', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/flags/${product.countryCode.toLowerCase()}.png`} alt={product.countryName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#BBBBBB' }}>{TYPE_LABEL[product.type]}</span>
                {product.isFeatured && <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#FFFFFF', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.06em' }}>Featured</span>}
              </div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(20px,2.5vw,28px)', letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1.1, marginBottom: '5px' }}>
                {product.name}
              </h1>
              <p style={{ fontSize: '12.5px', color: '#999999', lineHeight: 1.6 }}>{product.description}</p>
            </div>

            {/* Specs 2×2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { icon: Zap,    label: 'Швидкість', value: product.speedMbps >= 1000 ? `${product.speedMbps / 1000} Gbps` : `${product.speedMbps} Mbps` },
                { icon: Shield, label: 'Uptime',    value: `${product.uptimePercent}%` },
                { icon: Globe,  label: 'Локація',   value: `${product.city}, ${product.countryName}` },
                { icon: Globe,  label: 'ISP',       value: product.ispName },
              ].map((s, i) => (
                <div key={s.label} style={{ padding: '12px 16px', borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none', borderTop: i >= 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                    <s.icon style={{ width: '10px', height: '10px', color: '#AAAAAA' }} />
                    <span style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#AAAAAA' }}>{s.label}</span>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#EEEEEE' }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Protocols + Included in one row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Protocols */}
              <div style={{ padding: '12px 16px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AAAAAA', marginBottom: '8px' }}>Протоколи</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {product.protocols.map(p => (
                    <span key={p} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, color: '#DDDDDD' }}>
                      {p.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
              {/* Included */}
              <div style={{ padding: '12px 16px' }}>
                <p style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AAAAAA', marginBottom: '8px' }}>Включено</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                  {['Авторизація по IP', 'Логін:Пароль', 'Ротація per-request', 'Sticky sessions', 'Необмежений трафік', 'Заміна проксі'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Check style={{ width: '10px', height: '10px', color: '#BBBBBB', flexShrink: 0 }} />
                      <span style={{ fontSize: '11.5px', color: '#DDDDDD' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT: purchase panel ── */}
          <div>
            <div style={{ position: 'sticky', top: '72px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', background: '#0A0A0A', overflow: 'hidden' }}>

              {/* Plans */}
              <div style={{ padding: '10px 10px 8px' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888888', marginBottom: '5px' }}>План</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px' }}>
                  {product.plans.map(p => {
                    const isActive = selectedPlan === p._id
                    return (
                      <button key={p._id} onClick={() => setSelectedPlan(p._id)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px 2px', borderRadius: '6px', background: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isActive ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.05)'}`, transition: 'all 0.1s', cursor: 'pointer', position: 'relative', gap: '1px' }}
                        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}
                        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)' }}>
                        {p.isPopular && <div style={{ position: 'absolute', top: 0, right: 0, width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E' }} />}
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10.5px', fontWeight: 700, color: isActive ? '#FFFFFF' : '#AAAAAA' }}>${p.priceUsdt.toFixed(0)}</span>
                        <span style={{ fontSize: '9px', color: isActive ? '#CCCCCC' : '#666666' }}>{DURATION_LABELS[p.duration]}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quantity selector */}
              <div style={{ margin: '0 14px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', flexShrink: 0 }}>Кількість замовлень</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    style={{ width: '24px', height: '24px', borderRadius: '5px', background: 'rgba(255,255,255,0.06)', color: '#AAAAAA', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>−</button>
                  <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(100, q + 1))}
                    style={{ width: '24px', height: '24px', borderRadius: '5px', background: 'rgba(255,255,255,0.06)', color: '#AAAAAA', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>+</button>
                </div>
              </div>

              {/* Summary */}
              {plan && (
                <div style={{ margin: '0 14px', padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#AAAAAA' }}>{plan.ipCount * qty} IP · {qty > 1 ? `${qty}×` : ''}{plan.duration}</span>
                    <span style={{ color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>${(plan.priceUsdt * qty * (1 - plan.discount / 100)).toFixed(2)}</span>
                  </div>
                  {plan.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                      <span style={{ color: '#AAAAAA' }}>Знижка</span>
                      <span style={{ color: '#22C55E' }}>−{plan.discount}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button onClick={() => setConfirmOpen(true)} disabled={buying || !selectedPlan || !plan}
                  style={{ height: '40px', borderRadius: '9px', background: '#FFFFFF', color: '#000', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: (buying || !selectedPlan) ? 0.5 : 1, cursor: 'pointer' }}
                  onMouseEnter={e => { if (!buying && selectedPlan) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = (buying || !selectedPlan) ? '0.5' : '1'}>
                  {buying && <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" />}
                  Купити — ${plan ? (plan.priceUsdt * qty * (1 - plan.discount / 100)).toFixed(2) : '—'}
                </button>

                <button
                  disabled={!selectedPlan || !plan}
                  onClick={() => {
                    if (!plan || !product) return
                    addItem({ productId: product._id, planId: plan._id, productName: product.name, countryCode: product.countryCode, countryName: product.countryName, type: product.type, duration: plan.duration, ipCount: plan.ipCount, price: plan.priceUsdt, quantity: qty })
                    toast.success(qty > 1 ? `Додано до кошика ×${qty}` : 'Додано до кошика')
                  }}
                  style={{ height: '34px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#BBBBBB', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', opacity: (!selectedPlan || !plan) ? 0.4 : 1, transition: 'all 0.15s', cursor: 'pointer' }}
                  onMouseEnter={e => { if (selectedPlan && plan) { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)' }}}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#BBBBBB'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}>
                  <ShoppingCart style={{ width: '11px', height: '11px' }} /> В кошик
                </button>

                <p style={{ fontSize: '10px', textAlign: 'center', color: '#AAAAAA' }}>Активація ‹ 30 секунд</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm purchase modal */}
      {confirmOpen && plan && (
        <div
          onClick={() => setConfirmOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '24px', maxWidth: '360px', width: '100%' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '18px', letterSpacing: '-0.03em', color: '#FFFFFF', marginBottom: '16px' }}>
              Підтвердити замовлення
            </p>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: '#AAAAAA' }}>Продукт</span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{product?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: '#AAAAAA' }}>IP × кількість</span>
                <span style={{ color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>{plan.ipCount} IP × {qty} шт.</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: '#AAAAAA' }}>Термін</span>
                <span style={{ color: '#FFFFFF' }}>{DURATION_LABELS[plan.duration] ?? plan.duration}</span>
              </div>
              {plan.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: '#AAAAAA' }}>Знижка</span>
                  <span style={{ color: '#22C55E' }}>−{plan.discount}%</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '4px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>До списання</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '15px', fontWeight: 900, color: '#FFFFFF' }}>
                  ${(plan.priceUsdt * qty * (1 - plan.discount / 100)).toFixed(2)}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setConfirmOpen(false)}
                style={{ flex: 1, height: '40px', borderRadius: '9px', background: 'rgba(255,255,255,0.06)', color: '#AAAAAA', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#FFF' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#AAAAAA' }}>
                Скасувати
              </button>
              <button onClick={confirmBuy}
                style={{ flex: 1, height: '40px', borderRadius: '9px', background: '#FFFFFF', color: '#000', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}>
                Оплатити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
