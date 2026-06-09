'use client'



import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Copy, Loader2, ArrowUpRight, ArrowDownLeft, X, Check, CreditCard } from 'lucide-react'

// ── Coins with networks ──────────────────────────────────────────────────────

const COINS = [
  {
    id: 'btc', symbol: 'BTC', name: 'Bitcoin', color: '#F7931A', slug: 'bitcoin',
    networks: [{ id: 'btc', label: 'Bitcoin Mainnet', slug: 'bitcoin', addr: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' }],
  },
  {
    id: 'eth', symbol: 'ETH', name: 'Ethereum', color: '#627EEA', slug: 'ethereum',
    networks: [{ id: 'eth', label: 'ERC-20 (Ethereum)', slug: 'ethereum', addr: '0x742d35Cc6634C0532925a3b8D4C9C4e456B7bA6F' }],
  },
  {
    id: 'usdt', symbol: 'USDT', name: 'Tether', color: '#26A17B', slug: 'tether',
    networks: [
      { id: 'usdt_trc20', label: 'TRC-20 (TRON)', slug: 'tron', addr: 'TNJjGXEPDpXhSvQtBtQv4N7Bz2xJpFkUmC' },
      { id: 'usdt_erc20', label: 'ERC-20 (Ethereum)', slug: 'ethereum', addr: '0x742d35Cc6634C0532925a3b8D4C9C4e456B7bA6F' },
      { id: 'usdt_bsc',   label: 'BEP-20 (BSC)',      slug: 'binance',  addr: '0x742d35Cc6634C0532925a3b8D4C9C4e456B7bA6F' },
    ],
  },
  {
    id: 'bnb', symbol: 'BNB', name: 'BNB Chain', color: '#F3BA2F', slug: 'binance',
    networks: [
      { id: 'bnb_bsc',   label: 'BEP-20 (BSC)',    slug: 'binance',  addr: '0x742d35Cc6634C0532925a3b8D4C9C4e456B7bA6F' },
      { id: 'bnb_bnb',   label: 'BEP-2 (Binance)', slug: 'binance',  addr: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2' },
    ],
  },
  {
    id: 'sol', symbol: 'SOL', name: 'Solana', color: '#9945FF', slug: 'solana',
    networks: [{ id: 'sol', label: 'Solana Mainnet', slug: 'solana', addr: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' }],
  },
  {
    id: 'ton', symbol: 'TON', name: 'Toncoin', color: '#0098EA', slug: 'ton',
    networks: [{ id: 'ton', label: 'TON Network', slug: 'ton', addr: 'EQDmkj65Ab_m0aZaW8IpKw4kYqIgITw_HRstYxkFc-FDjp6Z' }],
  },
  {
    id: 'matic', symbol: 'MATIC', name: 'Polygon', color: '#8247E5', slug: 'polygon',
    networks: [{ id: 'matic', label: 'Polygon Mainnet', slug: 'polygon', addr: '0x742d35Cc6634C0532925a3b8D4C9C4e456B7bA6F' }],
  },
  {
    id: 'xrp', symbol: 'XRP', name: 'Ripple', color: '#346AA9', slug: 'xrp',
    networks: [{ id: 'xrp', label: 'XRP Ledger', slug: 'xrp', addr: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' }],
  },
  {
    id: 'ltc', symbol: 'LTC', name: 'Litecoin', color: '#A6A9AA', slug: 'litecoin',
    networks: [{ id: 'ltc', label: 'Litecoin Mainnet', slug: 'litecoin', addr: 'ltc1qd98gnkdy2sehxnuvhfhgzrqrz5y2kf9kkdwqcj' }],
  },
  {
    id: 'doge', symbol: 'DOGE', name: 'Dogecoin', color: '#C2A633', slug: 'dogecoin',
    networks: [{ id: 'doge', label: 'Dogecoin Mainnet', slug: 'dogecoin', addr: 'DRzwFzFVrpQkbp1TBVdJgNSuBDCDQCRtLe' }],
  },
  {
    id: 'trx', symbol: 'TRX', name: 'TRON', color: '#FF060A', slug: 'tron',
    networks: [{ id: 'trx', label: 'TRON Mainnet', slug: 'tron', addr: 'TNJjGXEPDpXhSvQtBtQv4N7Bz2xJpFkUmC' }],
  },
]

// ── Card brands (icon-only, no bg) ──────────────────────────────────────────

const CARDS = [
  {
    id: 'visa', label: 'Visa', slug: 'visa', color: '#1A1F71',
    gradient: 'linear-gradient(135deg, #1A1F71 0%, #1565C0 100%)',
    number: '4532 8771 0547 5564', cvv: '123', expiry: '06/28', bank: 'PrivatBank',
  },
  {
    id: 'mastercard', label: 'Mastercard', slug: 'mastercard', color: '#EB001B',
    gradient: 'linear-gradient(135deg, #1E1E1E 0%, #9B0000 100%)',
    number: '5425 2334 3010 9903', cvv: '456', expiry: '09/27', bank: 'Monobank',
  },
  {
    id: 'paypal', label: 'PayPal', slug: 'paypal', color: '#003087',
    gradient: 'linear-gradient(135deg, #003087 0%, #009CDE 100%)',
    number: '4111 1111 1111 1111', cvv: '789', expiry: '12/26', bank: 'PayPal Business',
  },
  {
    id: 'applepay', label: 'Apple Pay', slug: 'applepay', color: '#AAAAAA',
    gradient: 'linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)',
    number: '4929 4212 3456 7890', cvv: '321', expiry: '03/29', bank: 'Apple Card',
  },
  {
    id: 'googlepay', label: 'Google Pay', slug: 'googlepay', color: '#4285F4',
    gradient: 'linear-gradient(135deg, #1557A0 0%, #34A853 100%)',
    number: '4000 0000 0000 0002', cvv: '654', expiry: '11/28', bank: 'Google Pay',
  },
  {
    id: 'amex', label: 'Amex', slug: 'americanexpress', color: '#016FD0',
    gradient: 'linear-gradient(135deg, #016FD0 0%, #0D4F8B 100%)',
    number: '3782 822463 10005', cvv: '1234', expiry: '08/27', bank: 'American Express',
  },
]

interface Transaction {
  _id: string; type: string; amountUsdt: number; currency: string; status: string; description: string; createdAt: string
}
const TX_LABELS: Record<string, string> = {
  deposit: 'Поповнення', purchase: 'Покупка проксі', refund: 'Повернення', referral_bonus: 'Реферальний бонус',
}

// ── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(total: number, active: boolean) {
  const [left, setLeft] = useState(total)
  useEffect(() => {
    if (!active) { setLeft(total); return }
    setLeft(total)
    const t = setInterval(() => setLeft(p => Math.max(0, p - 1)), 1000)
    return () => clearInterval(t)
  }, [active, total])
  const m = String(Math.floor(left / 60)).padStart(2, '0')
  const s = String(left % 60).padStart(2, '0')
  return { left, label: `${m}:${s}`, expired: left === 0 }
}

// ── Component ────────────────────────────────────────────────────────────────

const VISIBLE_DEFAULT = 6

export default function BillingPage() {

  const router = useRouter()
  const [balance, setBalance]           = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading]           = useState(true)
  const [expanded, setExpanded]         = useState(false)

  // Modal state
  const [showModal, setShowModal]       = useState(false)
  const [payMethod, setPayMethod]       = useState<'card' | 'crypto'>('card')
  const [amount, setAmount]             = useState('50')

  // Coin/network selection
  const [selectedCardId, setSelectedCardId] = useState('visa')
  const [coinId, setCoinId]             = useState('usdt')
  const [netId, setNetId]               = useState('usdt_trc20')
  const activeCoin = COINS.find(c => c.id === coinId)!
  const activeCard = CARDS.find(c => c.id === selectedCardId) ?? CARDS[0]
  const activeNet  = activeCoin.networks.find(n => n.id === netId) ?? activeCoin.networks[0]

  function selectCoin(id: string) {
    setCoinId(id)
    const coin = COINS.find(c => c.id === id)!
    setNetId(coin.networks[0].id)
  }

  // Payment screens
  const [screen, setScreen]             = useState<'picker' | 'card-pay' | 'crypto-pay' | 'success'>('picker')
  const [canConfirm, setCanConfirm]     = useState(false)
  const [confirming, setConfirming]     = useState(false)
  const [copiedAddr, setCopiedAddr]     = useState(false)
  const confirmTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const cardCountdown   = useCountdown(600, screen === 'card-pay')
  const cryptoCountdown = useCountdown(600, screen === 'crypto-pay')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [uR, tR] = await Promise.all([fetch('/api/v1/auth/me'), fetch('/api/v1/billing/transactions')])
      const [uD, tD] = await Promise.all([uR.json(), tR.json()])
      setBalance(uD.data?.balance ?? 0)
      setTransactions(tD.data?.items ?? [])
    } finally { setLoading(false) }
  }

  function openModal() { setShowModal(true); setScreen('picker'); setCanConfirm(false) }

  function closeModal() {
    setShowModal(false)
    clearTimeout(confirmTimer.current)
    setScreen('picker')
    setCanConfirm(false)
    setCopiedAddr(false)
  }

  function startCardPay() {
    if (parseFloat(amount) < 10) return toast.error('Мінімум $10')
    setScreen('card-pay')
    setCanConfirm(false)
    clearTimeout(confirmTimer.current)
    confirmTimer.current = setTimeout(() => setCanConfirm(true), 20_000)
  }

  function startCryptoPay() {
    if (parseFloat(amount) < 10) return toast.error('Мінімум $10')
    setScreen('crypto-pay')
    setCanConfirm(false)
    clearTimeout(confirmTimer.current)
    confirmTimer.current = setTimeout(() => setCanConfirm(true), 20_000)
  }

  async function confirmPayment() {
    setConfirming(true)
    try {
      const res  = await fetch('/api/v1/billing/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), method: payMethod, currency: activeNet.id }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Помилка'); return }
      setBalance(data.data.newBalance)
      setScreen('success')
      await load()
    } finally { setConfirming(false) }
  }

  function copyAddr() {
    navigator.clipboard.writeText(activeNet.addr)
    setCopiedAddr(true)
    toast.success('Адресу скопійовано')
    setTimeout(() => setCopiedAddr(false), 3000)
  }

  const S: React.CSSProperties = { fontFamily: 'Syne, sans-serif', fontWeight: 900, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1 }

  return (
    <div className="space-y-8">
      <h1 style={{ ...S, fontSize: '26px' }}>Оплата</h1>

      {/* Balance + top-up */}
      <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', minHeight: '120px' }}>
          <div style={{ padding: '28px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CCCCCC', marginBottom: '14px' }}>Баланс</p>
            {loading
              ? <div className="skeleton" style={{ height: '44px', width: '120px', borderRadius: '8px' }} />
              : <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ ...S, fontSize: '44px' }}>${balance.toFixed(2)}</span>
                  <span style={{ fontSize: '13px', color: '#CCCCCC' }}>USD</span>
                </div>
            }
          </div>
          <div style={{ background: 'rgba(255,255,255,0.20)' }} />
          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CCCCCC', marginBottom: '14px' }}>Поповнення</p>
            <button onClick={openModal}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 20px', borderRadius: '9px', background: '#FFFFFF', color: '#000', fontSize: '13px', fontWeight: 600, alignSelf: 'flex-start' }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}>
              <Plus style={{ width: '14px', height: '14px' }} /> Поповнити
            </button>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#CCCCCC', marginBottom: '14px' }}>Транзакції</p>
        <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '16px' }} className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '52px', borderRadius: '8px' }} />)}
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>Немає транзакцій</p>
              <p style={{ fontSize: '12px', color: '#CCCCCC' }}>Поповніть баланс щоб почати</p>
            </div>
          ) : (
            <>
              {/* Always-visible first N rows */}
              {transactions.slice(0, VISIBLE_DEFAULT).map((tx, i) => {
                const isCredit = tx.type !== 'purchase'
                return (
                  <div key={tx._id} className="row-hover-accent"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCredit ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)' }}>
                        {isCredit ? <ArrowDownLeft style={{ width: '14px', height: '14px', color: '#22C55E' }} /> : <ArrowUpRight style={{ width: '14px', height: '14px', color: '#EF4444' }} />}
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>{TX_LABELS[tx.type] ?? tx.type}</p>
                        <p style={{ fontSize: '11.5px', color: '#CCCCCC', marginTop: '2px' }}>
                          {new Date(tx.createdAt).toLocaleString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {tx.currency?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: isCredit ? '#22C55E' : '#EF4444' }}>
                        {isCredit ? '+' : '-'}${tx.amountUsdt?.toFixed(2)}
                      </p>
                      <p style={{ fontSize: '11px', color: '#BBBBBB', marginTop: '2px', textTransform: 'capitalize' }}>{tx.status}</p>
                    </div>
                  </div>
                )
              })}

              {/* Smooth grid-rows expand — no squish */}
              {transactions.length > VISIBLE_DEFAULT && (
                <div style={{
                  display: 'grid',
                  gridTemplateRows: expanded ? '1fr' : '0fr',
                  transition: 'grid-template-rows 0.45s cubic-bezier(0.16,1,0.3,1)',
                }}>
                  <div style={{ overflow: 'hidden' }}>
                    {transactions.slice(VISIBLE_DEFAULT).map((tx, i) => {
                      const isCredit = tx.type !== 'purchase'
                      return (
                        <div key={tx._id} className="row-hover-accent"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 20px',
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            opacity: expanded ? 1 : 0,
                            transform: expanded ? 'none' : 'translateY(6px)',
                            transition: `opacity 0.3s ease ${Math.min(i, 8) * 40}ms, transform 0.35s cubic-bezier(0.16,1,0.3,1) ${Math.min(i, 8) * 40}ms`,
                          }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCredit ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)' }}>
                              {isCredit ? <ArrowDownLeft style={{ width: '14px', height: '14px', color: '#22C55E' }} /> : <ArrowUpRight style={{ width: '14px', height: '14px', color: '#EF4444' }} />}
                            </div>
                            <div>
                              <p style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>{TX_LABELS[tx.type] ?? tx.type}</p>
                              <p style={{ fontSize: '11.5px', color: '#CCCCCC', marginTop: '2px' }}>
                                {new Date(tx.createdAt).toLocaleString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {tx.currency?.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: isCredit ? '#22C55E' : '#EF4444' }}>
                              {isCredit ? '+' : '-'}${tx.amountUsdt?.toFixed(2)}
                            </p>
                            <p style={{ fontSize: '11px', color: '#BBBBBB', marginTop: '2px', textTransform: 'capitalize' }}>{tx.status}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Expand / collapse button */}
              {transactions.length > VISIBLE_DEFAULT && (
                <button
                  onClick={() => setExpanded(e => !e)}
                  style={{
                    width: '100%', padding: '12px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    fontSize: '12px', fontWeight: 600, color: '#555',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    background: 'transparent',
                    transition: 'color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#555'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  <svg
                    width="12" height="12" viewBox="0 0 12 12" fill="none"
                    style={{ transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {expanded
                    ? 'Згорнути'
                    : `Показати ще ${transactions.length - VISIBLE_DEFAULT}`}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── PAYMENT MODAL ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="animate-modal-in" style={{ width: '100%', maxWidth: '440px', borderRadius: '18px', background: '#0C0C0C', boxShadow: '0 0 0 1px rgba(255,255,255,0.28), 0 32px 80px rgba(0,0,0,0.8)', overflow: 'hidden' }}>

            {/* ── SUCCESS ── */}
            {screen === 'success' && (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Check style={{ width: '26px', height: '26px', color: '#22C55E' }} />
                </div>
                <p style={{ ...S, fontSize: '22px', marginBottom: '20px' }}>Оплата підтверджена!</p>

                {/* Зараховано — велика цифра */}
                <div style={{ background: 'rgba(34,197,94,0.08)', borderRadius: '12px', padding: '20px', marginBottom: '14px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#22C55E', marginBottom: '6px' }}>Зараховано</p>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '40px', letterSpacing: '-0.03em', color: '#22C55E', lineHeight: 1 }}>+${amount}</p>
                </div>

                {/* Новий баланс — окремо, менший */}
                <div style={{ background: 'rgba(255,255,255,0.20)', borderRadius: '10px', padding: '14px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '11px', color: '#CCCCCC', marginBottom: '4px' }}>Поточний баланс</p>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '22px', color: '#FFFFFF' }}>${balance.toFixed(2)}</p>
                </div>

                <button onClick={closeModal} style={{ width: '100%', height: '44px', borderRadius: '10px', background: '#FFFFFF', color: '#000', fontSize: '13.5px', fontWeight: 600 }}>
                  Закрити
                </button>
              </div>
            )}

            {/* ── CARD PAYMENT WINDOW ── */}
            {screen === 'card-pay' && (
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.25)' }}>
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Оплата карткою</p>
                    <p style={{ fontSize: '12px', color: '#CCCCCC', marginTop: '2px' }}>Переведіть кошти на реквізити нижче</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '20px', fontWeight: 700, color: cardCountdown.expired ? '#EF4444' : '#F59E0B' }}>
                      {cardCountdown.label}
                    </div>
                    <button onClick={closeModal} style={{ color: '#BBBBBB', marginLeft: '8px' }}>
                      <X style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  {/* Bank card visual — кольір відповідно до вибраної картки */}
                  <div style={{
                    borderRadius: '14px', padding: '24px',
                    background: activeCard.gradient,
                    marginBottom: '20px', position: 'relative', overflow: 'hidden',
                    boxShadow: `0 8px 32px ${activeCard.color}40`,
                    transition: 'background 0.4s ease, box-shadow 0.4s ease',
                  }}>
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
                    <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.20)' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', position: 'relative' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>{activeCard.bank}</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/icons/${activeCard.slug}-ffffff.svg`}
                        alt={activeCard.label} width={28} height={28}
                        style={{ width: '28px', height: '28px', objectFit: 'contain', opacity: 0.85 }}
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>

                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '18px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.1em', marginBottom: '20px', position: 'relative' }}>
                      {activeCard.number}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
                      <div>
                        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px', letterSpacing: '0.08em' }}>КАРТКА</p>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.04em' }}>{activeCard.label}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px', letterSpacing: '0.08em' }}>ТЕРМІН</p>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>{activeCard.expiry}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ background: 'rgba(255,255,255,0.20)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#DDDDDD' }}>Номер картки</span>
                      <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#FFFFFF', fontWeight: 600 }}>{activeCard.number}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#DDDDDD' }}>CVV</span>
                      <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#FFFFFF', fontWeight: 600 }}>{activeCard.cvv}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: '10px', marginTop: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Сума</span>
                      <span style={{ fontSize: '16px', fontFamily: 'Syne, sans-serif', fontWeight: 900, color: '#FFFFFF' }}>${amount}</span>
                    </div>
                  </div>

                  {!canConfirm && (
                    <p style={{ fontSize: '11.5px', color: '#CCCCCC', textAlign: 'center', marginBottom: '12px' }}>
                      Кнопка підтвердження з&apos;явиться через кілька секунд...
                    </p>
                  )}

                  <button
                    disabled={!canConfirm || confirming || cardCountdown.expired}
                    onClick={confirmPayment}
                    style={{ width: '100%', height: '48px', borderRadius: '12px', background: canConfirm ? '#FFFFFF' : 'rgba(255,255,255,0.35)', color: canConfirm ? '#000' : '#444', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s ease', cursor: canConfirm ? 'pointer' : 'not-allowed' }}
                    onMouseEnter={e => { if (canConfirm) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}>
                    {confirming ? <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" /> : <Check style={{ width: '16px', height: '16px' }} />}
                    {cardCountdown.expired ? 'Час вийшов' : canConfirm ? 'Я оплатив' : 'Зачекайте...'}
                  </button>
                </div>
              </div>
            )}

            {/* ── CRYPTO PAYMENT WINDOW ── */}
            {screen === 'crypto-pay' && (
              <div style={{ background: '#FFFBEB', borderRadius: '18px', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.08)', background: '#FEF3C7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/icons/${activeCoin.slug}-${activeCoin.color.replace('#','').toLowerCase()}.svg`}
                      alt={activeCoin.symbol} width={22} height={22} style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                      onError={e => { e.currentTarget.style.display = 'none' }} />
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#000' }}>{activeCoin.symbol} · {activeNet.label}</p>
                      <p style={{ fontSize: '11px', color: '#CCCCCC', marginTop: '1px' }}>Відправте точну суму на адресу нижче</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '20px', fontWeight: 700, color: cryptoCountdown.expired ? '#DC2626' : '#D97706' }}>
                      {cryptoCountdown.label}
                    </div>
                    <button onClick={closeModal} style={{ color: '#CCCCCC', marginLeft: '6px' }}>
                      <X style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  {/* Amount */}
                  <div style={{ textAlign: 'center', marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.04)', borderRadius: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#CCCCCC', marginBottom: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Сума до оплати</p>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '32px', color: '#000', letterSpacing: '-0.03em' }}>${amount}</p>
                    <p style={{ fontSize: '11px', color: '#DDDDDD', marginTop: '2px' }}>≈ {amount} {activeCoin.symbol}</p>
                  </div>

                  {/* Address */}
                  <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '16px', marginBottom: '16px', border: '1px solid rgba(0,0,0,0.08)' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#CCCCCC', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Адреса {activeCoin.symbol} гаманця
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11.5px', color: '#000', flex: 1, wordBreak: 'break-all', lineHeight: 1.5 }}>
                        {activeNet.addr}
                      </p>
                      <button
                        onClick={copyAddr}
                        style={{ flexShrink: 0, width: '34px', height: '34px', borderRadius: '8px', background: copiedAddr ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: copiedAddr ? '#16A34A' : '#000', transition: 'all 0.15s' }}>
                        {copiedAddr ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '11.5px', color: '#92400E', background: '#FEF3C7', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', lineHeight: 1.6 }}>
                    ⚠️ Надішліть точну суму тільки на мережу <strong>{activeNet.label}</strong>. Помилкова мережа призведе до втрати коштів.
                  </p>

                  {!canConfirm && (
                    <p style={{ fontSize: '11.5px', color: '#92400E', textAlign: 'center', marginBottom: '12px' }}>
                      Кнопка підтвердження з&apos;явиться через кілька секунд...
                    </p>
                  )}

                  <button
                    disabled={!canConfirm || confirming || cryptoCountdown.expired}
                    onClick={confirmPayment}
                    style={{ width: '100%', height: '48px', borderRadius: '12px', background: canConfirm ? '#000' : 'rgba(0,0,0,0.15)', color: canConfirm ? '#FFFFFF' : '#999', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s ease', cursor: canConfirm ? 'pointer' : 'not-allowed' }}>
                    {confirming ? <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" /> : <Check style={{ width: '16px', height: '16px' }} />}
                    {cryptoCountdown.expired ? 'Час вийшов' : canConfirm ? 'Я оплатив' : 'Зачекайте...'}
                  </button>
                </div>
              </div>
            )}

            {/* ── PICKER ── */}
            {screen === 'picker' && (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#FFFFFF' }}>Поповнити баланс</p>
                  <button onClick={closeModal} style={{ color: '#CCCCCC' }}>
                    <X style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>

                {/* Method tabs — без емодзі */}
                <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '10px', marginBottom: '20px' }}>
                  {(['card', 'crypto'] as const).map(m => (
                    <button key={m} onClick={() => setPayMethod(m)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: payMethod === m ? '#FFFFFF' : '#444', background: payMethod === m ? 'rgba(255,255,255,0.1)' : 'transparent', transition: 'all 0.15s' }}>
                      {m === 'card' ? 'Карткою' : 'Криптою'}
                    </button>
                  ))}
                </div>

                {/* Amount — single input only */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#DDDDDD' }}>Сума</p>
                    <p style={{ fontSize: '11px', color: '#BBBBBB' }}>мін. $10</p>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', fontWeight: 700, color: '#444', pointerEvents: 'none' }}>$</span>
                    <input
                      type="number" min="10" value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', height: '48px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#FFFFFF', fontSize: '20px', fontWeight: 700, padding: '0 12px 0 30px', outline: 'none', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
                      onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.15)')}
                      onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
                    />
                  </div>
                </div>

                {/* CARD method */}
                {payMethod === 'card' && (
                  <>
                    <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#DDDDDD', marginBottom: '12px' }}>Оберіть картку</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px' }}>
                      {CARDS.map(card => {
                        const isActive = selectedCardId === card.id
                        return (
                          <button
                            key={card.id}
                            onClick={() => setSelectedCardId(card.id)}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                              padding: '14px 8px', borderRadius: '12px', cursor: 'pointer',
                              background: isActive ? '#111111' : '#000000',
                              outline: isActive ? `2px solid ${card.color}80` : '2px solid rgba(255,255,255,0.08)',
                              transition: 'all 0.15s ease',
                            }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/icons/${card.slug}-${card.color.replace('#','').toLowerCase()}.svg`}
                              alt={card.label} width={26} height={26}
                              style={{ width: '26px', height: '26px', objectFit: 'contain', filter: isActive ? 'none' : 'grayscale(1) brightness(0.5)' }}
                              onError={e => { e.currentTarget.style.display = 'none' }}
                            />
                            <span style={{ fontSize: '11px', fontWeight: 600, color: isActive ? '#FFFFFF' : '#555' }}>{card.label}</span>
                          </button>
                        )
                      })}
                    </div>
                    <button onClick={startCardPay}
                      style={{ width: '100%', height: '44px', borderRadius: '10px', background: '#FFFFFF', color: '#000', fontSize: '13.5px', fontWeight: 600 }}
                      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
                      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}>
                      Оплатити карткою — ${amount}
                    </button>
                  </>
                )}

                {/* CRYPTO method */}
                {payMethod === 'crypto' && (
                  <>
                    {/* Step 1: Coin grid */}
                    <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#DDDDDD', marginBottom: '10px' }}>Монета</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '16px' }}>
                      {COINS.map(coin => {
                        const isAct = coinId === coin.id
                        return (
                          <button key={coin.id} onClick={() => selectCoin(coin.id)}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                              padding: '12px 6px', borderRadius: '12px',
                              background: isAct ? '#111111' : '#000000',
                              outline: isAct ? `2px solid ${coin.color}80` : '2px solid rgba(255,255,255,0.08)',
                              transition: 'all 0.15s',
                              cursor: 'pointer',
                            }}>
                            {/* Circular icon with brand bg */}
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: isAct ? `${coin.color}30` : 'rgba(255,255,255,0.28)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: `1.5px solid ${isAct ? coin.color + '60' : 'rgba(255,255,255,0.30)'}`,
                              transition: 'all 0.15s',
                            }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`/icons/${coin.slug}-${coin.color.replace('#','').toLowerCase()}.svg`}
                                alt={coin.symbol} width={20} height={20}
                                style={{ width: '20px', height: '20px', objectFit: 'contain', filter: isAct ? 'none' : 'grayscale(1) brightness(0.35)' }}
                                onError={e => { e.currentTarget.style.display = 'none' }}
                              />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.03em', color: isAct ? '#FFFFFF' : '#555' }}>
                              {coin.symbol}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Step 2: Network */}
                    <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#DDDDDD', marginBottom: '8px' }}>Мережа</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                      {activeCoin.networks.map(net => {
                        const isAct = netId === net.id
                        return (
                          <button key={net.id} onClick={() => setNetId(net.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '7px',
                              padding: '8px 14px', borderRadius: '8px',
                              background: isAct ? `${activeCoin.color}15` : 'rgba(255,255,255,0.20)',
                              border: `1px solid ${isAct ? activeCoin.color + '50' : 'rgba(255,255,255,0.25)'}`,
                              transition: 'all 0.15s',
                            }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`/icons/${net.slug}-${activeCoin.color.replace('#','').toLowerCase()}.svg`}
                              alt={net.label} width={13} height={13}
                              style={{ width: '13px', height: '13px', objectFit: 'contain', filter: isAct ? 'none' : 'grayscale(1) brightness(0.35)' }}
                              onError={e => { e.currentTarget.style.display = 'none' }} />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: isAct ? '#FFFFFF' : '#555' }}>{net.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    <button onClick={startCryptoPay}
                      style={{ width: '100%', height: '44px', borderRadius: '10px', background: '#FFFFFF', color: '#000', fontSize: '13.5px', fontWeight: 600 }}
                      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
                      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}>
                      Отримати адресу — ${amount}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
