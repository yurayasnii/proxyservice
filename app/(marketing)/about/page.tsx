export const metadata = { title: 'Про нас — ProxyService' }

const STATS = [
  { num: '01', label: 'IP-адрес в мережі', value: '5,000,000+' },
  { num: '02', label: 'Країн покриття', value: '195' },
  { num: '03', label: 'Активних клієнтів', value: '50,000+' },
  { num: '04', label: 'Uptime SLA', value: '99.9%' },
]

const SECTIONS = [
  {
    num: '01',
    title: 'Місія',
    body: 'Ми зробили проксі-мережу, якою б самі користувались. Без маркетингового шуму, без прихованих умов — лише чиста продуктивність і прозоре ціноутворення для кожного.',
  },
  {
    num: '02',
    title: 'Технологія',
    body: 'Власна мережа серверів у дата-центрах на 6 континентах. Автоматична ротація IP, real-time моніторинг кожного вузла, підтримка 24/7.',
  },
  {
    num: '03',
    title: 'Безпека та приватність',
    body: 'Ніяких логів трафіку. Мінімальна кількість персональних даних. Відповідність GDPR. Платіжні дані обробляються Stripe та NOWPayments — ми ніколи не зберігаємо номери карток.',
  },
  {
    num: '04',
    title: 'Підтримка',
    body: 'AI-агент вирішує 85% запитів миттєво. Команда інженерів доступна 24/7 для складних випадків. Середній час відповіді — менше 2 хвилин.',
  },
]

export default function AboutPage() {
  return (
    <div style={{ background: '#060606', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-28">

        {/* Header */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] mb-6" style={{ color: '#DDDDDD' }}>
            Про компанію
          </p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,5vw,64px)', lineHeight: .92, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Будуємо<br />
            <span className="text-wave">інтернет-інфраструктуру</span>
          </h1>
          <p className="text-sm mt-8 max-w-xl leading-relaxed" style={{ color: '#AAAAAA' }}>
            ProxyService — команда інженерів, яка вирішила зробити проксі-мережу на рівні enterprise доступною для всіх. Від стартапу до корпорації.
          </p>
        </div>

        {/* Stats as rows */}
        <div className="mb-20">
          {STATS.map((s) => (
            <div key={s.num} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="grid grid-cols-[40px_1fr_auto] gap-8 py-6 items-center">
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#CCCCCC', letterSpacing: '0.1em' }}>
                  {s.num}
                </span>
                <span style={{ fontSize: '14px', color: '#AAAAAA' }}>{s.label}</span>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(24px,3vw,36px)', color: '#FFFFFF', letterSpacing: '-0.03em' }}>
                  {s.value}
                </span>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        </div>

        {/* Sections */}
        <div>
          {SECTIONS.map((s) => (
            <div key={s.num} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="grid grid-cols-[40px_1fr] gap-8 py-8">
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#CCCCCC', letterSpacing: '0.1em', paddingTop: '2px' }}>
                  {s.num}
                </span>
                <div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#FFFFFF', letterSpacing: '-0.01em', marginBottom: '12px' }}>
                    {s.title}
                  </h2>
                  <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#AAAAAA' }}>{s.body}</p>
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: '#CCCCCC' }}>
            Зв'язатись з нами
          </p>
          <a href="/contact"
            className="text-xs font-medium"
            style={{ color: '#EEEEEE' }}>
            Контакти →
          </a>
        </div>
      </div>
    </div>
  )
}
