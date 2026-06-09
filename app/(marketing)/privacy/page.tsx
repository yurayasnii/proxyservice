export const metadata = { title: 'Приватність — ProxyService' }

const SECTIONS = [
  { title: '1. Які дані ми збираємо', body: 'Email адреса та ім\'я користувача при реєстрації. Платіжна інформація обробляється виключно Stripe та NOWPayments — ми ніколи не зберігаємо дані карток. Технічні логи (IP підключення, час сесій) — видаляються через 7 днів.' },
  { title: '2. Як ми використовуємо дані', body: 'Тільки для надання сервісу: активація проксі, підтримка, сповіщення про стан замовлення. Ми не продаємо і не передаємо дані третім особам для маркетингових цілей.' },
  { title: '3. Трафік через проксі', body: 'Ми не ведемо логи трафіку, що проходить через наші проксі-сервери. Ваша активність в інтернеті через ProxyService є приватною.' },
  { title: '4. Cookies', body: 'Використовуємо лише технічно необхідні cookies для авторизації (HttpOnly, Secure). Ніяких трекінгових або рекламних cookies.' },
  { title: '5. Зберігання даних', body: 'Дані зберігаються на серверах у ЄС та США. Передача відповідає вимогам GDPR. Ви можете запросити видалення акаунту і всіх пов\'язаних даних у будь-який момент.' },
  { title: '6. Ваші права', body: 'Право на доступ, виправлення, видалення, обмеження обробки та портабельність даних відповідно до GDPR. Запит надсилайте на privacy@proxyservice.io.' },
]

export default function PrivacyPage() {
  return (
    <div style={{ background: '#060606', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 py-32">
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] mb-6" style={{ color: '#CCCCCC' }}>Юридичний документ</p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,5vw,64px)', lineHeight: .92, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Політика<br />
            <span className="text-wave">приватності</span>
          </h1>
          <p className="text-xs uppercase tracking-widest mt-6" style={{ color: '#DDDDDD' }}>Останнє оновлення: травень 2026</p>
        </div>

        <div>
          {SECTIONS.map((s, i) => (
            <div key={s.title} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="grid grid-cols-[40px_1fr] gap-8 py-8">
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#EEEEEE', letterSpacing: '0.1em', paddingTop: '2px' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#FFFFFF', letterSpacing: '-0.01em', marginBottom: '12px' }}>
                    {s.title.replace(/^\d+\.\s/, '')}
                  </h2>
                  <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#AAAAAA' }}>{s.body}</p>
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        </div>

        <div className="mt-16 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: '#EEEEEE' }}>Є питання?</p>
          <a href="mailto:privacy@proxyservice.io" className="text-xs font-medium" style={{ color: '#EEEEEE' }}>
            privacy@proxyservice.io →
          </a>
        </div>
      </div>
    </div>
  )
}
