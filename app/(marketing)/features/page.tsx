import Link from 'next/link'

export const metadata = { title: 'Функції — ProxyService' }

const FEATURES = [
  {
    num: '01',
    title: '5,000,000+ IP-адрес',
    body: 'Найбільша мережа residential, datacenter, mobile та ISP проксі. Постійно поповнюється новими вузлами по всьому світу.',
  },
  {
    num: '02',
    title: '195 країн',
    body: 'Покриття всіх континентів. Геотаргетинг до рівня міста та ISP-провайдера. Вибирай точну локацію для кожного запиту.',
  },
  {
    num: '03',
    title: 'Миттєва активація',
    body: 'Проксі активуються за лічені секунди після оплати. Жодних перевірок, жодного очікування — відразу до роботи.',
  },
  {
    num: '04',
    title: 'Ротація та sticky sessions',
    body: 'Per-request ротація або фіксовані сесії до 24 годин. Налаштовуй під кожне завдання: парсинг, акаунти, верифікація.',
  },
  {
    num: '05',
    title: 'HTTP / HTTPS / SOCKS5',
    body: 'Всі основні протоколи. Авторизація по IP whitelist або логін:пароль. Сумісність з будь-яким клієнтом і SDK.',
  },
  {
    num: '06',
    title: 'Elite анонімність',
    body: 'Residential та ISP проксі не визначаються антиботами. Обхід CloudFlare, DataDome, PerimeterX, Akamai.',
  },
  {
    num: '07',
    title: 'REST API',
    body: 'Повний API для автоматизації: замовлення, ротація, статистика. SDK для Python, Node.js, Go. Webhooks для подій.',
  },
  {
    num: '08',
    title: 'Підтримка 24/7',
    body: 'Команда підтримки вирішує запити швидко. Фахівець завжди на зв\'язку для складних випадків.',
  },
]

export default function FeaturesPage() {
  return (
    <div style={{ background: '#060606', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-28">

        {/* Header */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] mb-6" style={{ color: '#CCCCCC' }}>
            Можливості
          </p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,5vw,64px)', lineHeight: .92, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Все що потрібно<br />
            <span className="text-wave">для роботи</span>
          </h1>
          <p className="text-sm mt-6 max-w-lg" style={{ color: '#AAAAAA', lineHeight: 1.8 }}>
            Від індивідуального розробника до enterprise-рішень. Інструменти, які масштабуються разом з тобою.
          </p>
        </div>

        {/* Features as rows */}
        <div>
          {FEATURES.map((f) => (
            <div key={f.num} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="grid grid-cols-[40px_1fr] gap-8 py-8">
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#EEEEEE', letterSpacing: '0.1em', paddingTop: '2px' }}>
                  {f.num}
                </span>
                <div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#FFFFFF', letterSpacing: '-0.01em', marginBottom: '12px' }}>
                    {f.title}
                  </h2>
                  <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#AAAAAA' }}>{f.body}</p>
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        </div>

        {/* CTA */}
        <div className="mt-16 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: '#EEEEEE' }}>
            Готові почати?
          </p>
          <Link href="/catalog"
            className="text-xs font-medium"
            style={{ color: '#EEEEEE' }}>
            Переглянути каталог →
          </Link>
        </div>
      </div>
    </div>
  )
}
