'use client'

const SECTIONS = [
  {
    num: '01',
    title: 'Загальні положення',
    body: 'Використовуючи сервіс ProxyService, ви погоджуєтесь з цими Умовами. Якщо ви не погоджуєтесь, припиніть використання сервісу.',
  },
  {
    num: '02',
    title: 'Дозволене використання',
    body: 'Проксі-сервери ProxyService призначені виключно для законної діяльності: веб-скрапінг публічних даних, SEO-моніторинг, перевірка реклами, тестування геолокації, дослідження ринку.',
  },
  {
    num: '03',
    title: 'Заборонене використання',
    body: 'Категорично заборонено: спам, фішинг, DDoS-атаки, доступ до незаконного контенту, обхід авторизації без дозволу власника, будь-яка діяльність що порушує законодавство України або країни перебування.',
  },
  {
    num: '04',
    title: 'Оплата та повернення',
    body: 'Усі платежі виконуються в USD. Повернення коштів можливе протягом 24 годин з моменту оплати, якщо проксі не були активовані. Після активації кошти не повертаються.',
  },
  {
    num: '05',
    title: 'Конфіденційність',
    body: 'Ми не продаємо і не передаємо ваші персональні дані третім особам. Логи трафіку зберігаються не більше 7 днів і використовуються виключно для діагностики та безпеки.',
  },
  {
    num: '06',
    title: 'Відповідальність',
    body: "ProxyService не несе відповідальності за будь-які збитки, пов'язані з використанням або неможливістю використання сервісу. Сервіс надається «як є».",
  },
  {
    num: '07',
    title: 'Зміни умов',
    body: 'Ми залишаємо за собою право змінювати ці Умови. Про суттєві зміни повідомлятимемо електронною поштою за 7 днів до набрання чинності.',
  },
]

export default function TermsPage() {
  return (
    <div style={{ background: '#060606', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-28">

        {/* Header */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] mb-6" style={{ color: '#CCCCCC' }}>
            Правовий документ
          </p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,5vw,64px)', lineHeight: .92, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Умови<br />
            <span className="text-wave">використання</span>
          </h1>
          <p className="text-xs uppercase tracking-widest mt-6" style={{ color: '#DDDDDD' }}>
            Останнє оновлення: травень 2026
          </p>
        </div>

        {/* Sections */}
        <div>
          {SECTIONS.map((s, i) => (
            <div key={s.num} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="grid grid-cols-[40px_1fr] gap-8 py-8">
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#EEEEEE', letterSpacing: '0.1em', paddingTop: '2px' }}>
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
          <p className="text-xs uppercase tracking-widest" style={{ color: '#EEEEEE' }}>
            Є питання?
          </p>
          <a href="mailto:support@proxyservice.io"
            className="text-xs font-medium transition-colors"
            style={{ color: '#EEEEEE' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
            support@proxyservice.io →
          </a>
        </div>
      </div>
    </div>
  )
}
