import Link from 'next/link'

const POSTS: Record<string, {
  title: string; date: string; readTime: string; category: string
  sections: Array<{ heading?: string; body: string }>
}> = {
  'residential-vs-datacenter': {
    title: 'Residential vs Datacenter: коли що вибирати',
    date: '24 Травня 2026', readTime: '5 хв', category: 'Гайди',
    sections: [
      { body: 'Residential проксі — це IP реальних домашніх пристроїв, виданих інтернет-провайдерами. Datacenter — IP з серверних центрів. Обидва типи корисні, але для різних завдань.' },
      { heading: 'Коли вибирати Residential', body: 'Соціальні мережі (Instagram, TikTok, Twitter) блокують датацентрові IP агресивно. Ad verification потребує погляду "реального користувача". E-commerce з суворими перевірками — тільки residential. Скрізь, де потрібна максимальна довіра.' },
      { heading: 'Коли вибирати Datacenter', body: 'Масовий скрапінг без суворих обмежень. SEO-моніторинг та SERP-парсинг у великих обсягах. Задачі де швидкість важливіша за анонімність. Великі обсяги з обмеженим бюджетом.' },
      { heading: 'Висновок', body: 'Якщо блокування неприпустиме — Residential. Якщо потрібна швидкість і великі обсяги — Datacenter. Для критичних операцій розглянь ISP проксі як золоту середину.' },
    ],
  },
  'web-scraping-2026': {
    title: 'Web scraping у 2026: обхід сучасних антиботів',
    date: '19 Травня 2026', readTime: '8 хв', category: 'Технічне',
    sections: [
      { body: 'Сучасні системи захисту стали значно складнішими. Ось що потрібно знати для успішного скрапінгу у 2026 році.' },
      { heading: 'CloudFlare Turnstile', body: 'Базується на поведінковому аналізі та fingerprinting. Residential проксі + реальний браузер (Playwright або Puppeteer з stealth-плагіном) — найефективніший підхід. Уникай curl та прямих HTTP-запитів.' },
      { heading: 'DataDome', body: 'Аналізує fingerprint пристрою, швидкість запитів, патерни мишки та keyboard. Потрібні мобільні або residential проксі з ротацією на кожен запит. Обов\'язкові реалістичні User-Agent.' },
      { heading: 'PerimeterX (HUMAN)', body: 'Машинне навчання для виявлення ботів у реальному часі. Sticky sessions + realistic delays + residential IPs з правильним fingerprint браузера.' },
      { heading: 'Практичні поради', body: '1. Завжди використовуй rotating residential для складних цілей. 2. Реалістичні затримки між запитами (1–3 секунди). 3. Headless browser замість прямих HTTP. 4. Ротуй User-Agent разом з IP. 5. Дотримуйся robots.txt.' },
    ],
  },
  'socks5-setup': {
    title: 'SOCKS5: Python, Node.js, браузер',
    date: '12 Травня 2026', readTime: '4 хв', category: 'Налаштування',
    sections: [
      { body: 'SOCKS5 — найуніверсальніший протокол для проксі. Підтримує будь-який тип трафіку, включно з UDP. Ось як підключити у популярних середовищах.' },
      { heading: 'Python (requests + PySocks)', body: 'Встанови PySocks: pip install requests[socks]. Потім: proxies = {"http": "socks5://user:pass@proxy.ps.io:1080", "https": "socks5://user:pass@proxy.ps.io:1080"}. Передай у requests.get(url, proxies=proxies).' },
      { heading: 'Node.js (axios + socks-proxy-agent)', body: 'npm install socks-proxy-agent. Створи агента: const agent = new SocksProxyAgent("socks5://user:pass@proxy.ps.io:1080"). Передай у axios як httpsAgent та httpAgent.' },
      { heading: 'Браузер (Chrome)', body: 'Налаштування → Система → Відкрити налаштування проксі. Або використовуй розширення FoxyProxy для зручного перемикання між проксі профілями.' },
    ],
  },
  'geo-targeting': {
    title: 'Геотаргетинг до рівня міста',
    date: '5 Травня 2026', readTime: '6 хв', category: 'Гайди',
    sections: [
      { body: 'Геотаргетинг дозволяє вибрати конкретну локацію для кожного запиту. Незамінний для price monitoring, локального SEO та перевірки геозалежного контенту.' },
      { heading: 'Параметри підключення', body: 'Використовуй синтаксис: user-country-US:pass@proxy.ps.io:8080 для країни. Для міста: user-country-US-city-NewYork:pass@proxy.ps.io:8080. Для ISP: user-country-DE-isp-Telekom:pass@proxy.ps.io:8080.' },
      { heading: 'SEO моніторинг', body: 'Перевіряй позиції у Google з різних міст. Збирай локальний SERP без блокувань. Моніторинг featured snippets для конкретних регіонів.' },
      { heading: 'Price monitoring', body: 'Авіаквитки, готелі, e-commerce — ціни залежать від локації. Residential проксі з геотаргетингом дають реальні ціни для кожного регіону без детекту.' },
    ],
  },
  'mobile-proxies-explained': {
    title: 'Мобільні проксі 4G/5G: для чого вони',
    date: '28 Квітня 2026', readTime: '7 хв', category: 'Технічне',
    sections: [
      { body: 'Mobile проксі — реальні IP від мобільних операторів. Один IP може одночасно використовуватись тисячами абонентів, тому платформи ніколи не блокують mobile IP агресивно.' },
      { heading: 'Чому мобільні IP найдовіреніші', body: 'Мобільні оператори використовують NAT — один зовнішній IP ділять сотні або тисячі пристроїв. Блокування такого IP означало б відключення реальних користувачів. Тому Instagram, TikTok, Facebook ніколи не блокують mobile IP.' },
      { heading: 'Для чого підходять', body: 'Instagram та TikTok automation. Управління множинними акаунтами без ризику бану. Тестування мобільних застосунків з реальними IP. Mobile gaming з обходом регіональних обмежень.' },
      { heading: 'Sticky sessions', body: 'Mobile проксі підтримують sticky sessions до 24 годин — один IP для одного акаунту. Критично для соціальних мереж, де зміна IP = підозра на злом.' },
    ],
  },
  'isp-proxies-guide': {
    title: 'ISP проксі: швидкість + довіра',
    date: '20 Квітня 2026', readTime: '5 хв', category: 'Гайди',
    sections: [
      { body: 'ISP проксі реєструються в базах даних інтернет-провайдерів як residential IP, але фізично знаходяться в дата-центрах. Ідеальний гібрид для бізнесу.' },
      { heading: 'Переваги над residential', body: 'Швидкість датацентру (до 10 Gbps) при довірі residential IP. Статичні IP — один і той самий адрес без ротації. Ідеально для акаунт-менеджменту де потрібна стабільність.' },
      { heading: 'Переваги над datacenter', body: 'Не визначаються як проксі у IP-репутаційних базах. Проходять перевірки платформ, які блокують датацентрові IP. Підходять для sneaker copping, ticket purchasing, e-commerce.' },
      { heading: 'Коли вибирати ISP', body: 'Sneaker drops та лімітовані releases. Купівля квитків на концерти. Управління множинними e-commerce акаунтами. Будь-де де потрібна швидкість datacenter + довіра residential.' },
    ],
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = POSTS[slug]
  return { title: post ? `${post.title} — ProxyService` : 'Стаття — ProxyService' }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = POSTS[slug]

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#060606' }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color: '#FFFFFF' }}>
          Стаття не знайдена
        </p>
        <Link href="/blog" className="text-xs uppercase tracking-widest" style={{ color: '#EEEEEE' }}>
          ← Назад до блогу
        </Link>
      </div>
    )
  }

  return (
    <div style={{ background: '#060606', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-28">

        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest mb-16 transition-colors"
          style={{ color: '#CCCCCC' }}>
          ← Блог
        </Link>

        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] mb-6" style={{ color: '#DDDDDD' }}>
            {post.category} · {post.date} · {post.readTime}
          </p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(28px,4vw,52px)', lineHeight: 1, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            {post.title}
          </h1>
        </div>

        {/* Content as sections */}
        <div>
          {post.sections.map((s, i) => (
            <div key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="grid grid-cols-[40px_1fr] gap-8 py-8">
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#CCCCCC', letterSpacing: '0.1em', paddingTop: '2px' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  {s.heading && (
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#FFFFFF', letterSpacing: '-0.01em', marginBottom: '12px' }}>
                      {s.heading}
                    </h2>
                  )}
                  <p style={{ fontSize: '14px', lineHeight: 1.85, color: '#AAAAAA' }}>{s.body}</p>
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        </div>

        {/* CTA */}
        <div className="mt-16 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: '#CCCCCC' }}>
            Готові почати?
          </p>
          <Link href="/catalog" className="text-xs font-medium" style={{ color: '#EEEEEE' }}>
            Переглянути каталог →
          </Link>
        </div>
      </div>
    </div>
  )
}
