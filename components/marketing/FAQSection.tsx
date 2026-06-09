'use client'



import { useState, useEffect, useRef } from 'react'
import { Plus } from 'lucide-react'

const FAQ_ITEMS = [
  {
    q: 'Як швидко я отримаю доступ до проксі після оплати?',
    a: 'Після підтвердження криптовалютної транзакції (1–15 хвилин) credentials з\'являться в особистому кабінеті миттєво. Ви також отримаєте email-повідомлення.',
  },
  {
    q: 'Чи можна повернути кошти якщо проксі не працює?',
    a: 'Так. Якщо ви використали менше 25% терміну підписки — повернемо 80% на баланс. До 50% — 50%. Понад 50% — повернення не передбачене. Рішення приймає AI автоматично.',
  },
  {
    q: 'Скільки разів можна замінити проксі?',
    a: 'До 3 замін на кожний куплений проксі за весь термін підписки. Заміна доступна через кабінет або через кабінет.',
  },
  {
    q: 'Які криптовалюти ви приймаєте?',
    a: 'BTC, ETH, USDT (TRC20 та ERC20), TON, LTC та інші через NOWPayments. Також можна поповнити внутрішній баланс і платити ним.',
  },
  {
    q: 'Чи ведуться логи активності?',
    a: 'Ні. Ми не зберігаємо логи трафіку. Зберігаються тільки дані для роботи сервісу: IP-адреси проксі та технічна статистика.',
  },
  {
    q: 'Чим відрізняється Residential від ISP?',
    a: 'Residential — реальні домашні IP від ISP-провайдерів, обертаються. ISP — зареєстровані на ISP, але розміщені в дата-центрі. Поєднує швидкість DC з довірою residential.',
  },
]

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect() } }, { threshold: 0.06 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, on }
}

export default function FAQSection() {
  
  const [open, setOpen] = useState<number | null>(null)
  const { ref, on } = useReveal()

  return (
    <section ref={ref} className="py-32" style={{ background: '#060606' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-14">
        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-20 lg:gap-32"
          style={{
            opacity: on ? 1 : 0,
            transform: on ? 'none' : 'translateY(24px)',
            transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Left — sticky header */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-center gap-4 mb-3">
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#CCCCCC', letterSpacing: '0.2em' }}>09</span>
              <div className="w-10 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#DDDDDD', marginBottom: '20px' }}>FAQ</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,5vw,62px)', lineHeight: 0.9, letterSpacing: '-0.04em', color: '#FFFFFF' }}>
              Часті<br />
              <span className="text-wave">питання</span>
            </h2>
            <p style={{ fontSize: '13px', color: '#DDDDDD', marginTop: '24px', lineHeight: 1.7, maxWidth: '260px' }}>
              Не знайшли відповідь? Зверніться до нашої підтримки.
            </p>
          </div>

          {/* Right — accordion */}
          <div>
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-start justify-between gap-6 py-6 text-left"
                >
                  <span style={{ fontSize: '14px', fontWeight: 500, color: open === i ? '#FFFFFF' : '#888', lineHeight: 1.5, flex: 1, transition: 'color 0.2s ease' }}>
                    {item.q}
                  </span>
                  <div style={{
                    width: '20px', height: '20px',
                    flexShrink: 0,
                    marginTop: '2px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                    transform: open === i ? 'rotate(45deg)' : 'none',
                    color: open === i ? '#555' : '#222',
                  }}>
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </button>
                <div style={{
                  maxHeight: open === i ? '400px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1)',
                }}>
                  <p style={{ fontSize: '13.5px', color: '#AAAAAA', lineHeight: 1.8, paddingBottom: '24px' }}>
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />
          </div>
        </div>
      </div>
    </section>
  )
}
