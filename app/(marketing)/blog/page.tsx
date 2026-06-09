import Link from 'next/link'

export const metadata = { title: 'Блог — ProxyService' }

const POSTS = [
  {
    num: '01',
    slug: 'residential-vs-datacenter',
    date: '24 Травня 2026',
    readTime: '5 хв',
    category: 'Гайди',
    title: 'Residential vs Datacenter: коли що вибирати',
    excerpt: 'Детальне порівняння двох основних типів проксі. Коли Residential дає переваги, а коли Datacenter — оптимальний вибір.',
  },
  {
    num: '02',
    slug: 'web-scraping-2026',
    date: '19 Травня 2026',
    readTime: '8 хв',
    category: 'Технічне',
    title: 'Web scraping у 2026: обхід сучасних антиботів',
    excerpt: 'CloudFlare Turnstile, DataDome, PerimeterX — огляд актуальних методів захисту та як з ними працювати.',
  },
  {
    num: '03',
    slug: 'socks5-setup',
    date: '12 Травня 2026',
    readTime: '4 хв',
    category: 'Налаштування',
    title: 'SOCKS5: Python, Node.js, браузер',
    excerpt: 'Покроковий гайд підключення SOCKS5 проксі у популярних середовищах. Requests, axios, Puppeteer.',
  },
  {
    num: '04',
    slug: 'geo-targeting',
    date: '5 Травня 2026',
    readTime: '6 хв',
    category: 'Гайди',
    title: 'Геотаргетинг до рівня міста',
    excerpt: 'Як вибрати конкретне місто при використанні residential проксі. Параметри, приклади, кейси для SEO.',
  },
  {
    num: '05',
    slug: 'mobile-proxies-explained',
    date: '28 Квітня 2026',
    readTime: '7 хв',
    category: 'Технічне',
    title: 'Мобільні проксі 4G/5G: для чого вони',
    excerpt: 'Mobile проксі — найбільш довірені IP в інтернеті. Пояснюємо чому і коли вони незамінні.',
  },
  {
    num: '06',
    slug: 'isp-proxies-guide',
    date: '20 Квітня 2026',
    readTime: '5 хв',
    category: 'Гайди',
    title: 'ISP проксі: швидкість + довіра',
    excerpt: 'Ідеальний баланс між швидкістю datacenter і довірою residential. Коли варто і як отримати максимум.',
  },
]

export default function BlogPage() {
  return (
    <div style={{ background: '#060606', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-28">

        {/* Header */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] mb-6" style={{ color: '#DDDDDD' }}>
            Знання
          </p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,5vw,64px)', lineHeight: .92, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Гайди та<br />
            <span className="text-wave">статті</span>
          </h1>
          <p className="text-sm mt-6" style={{ color: '#AAAAAA' }}>
            Практичні знання про проксі, скрапінг та автоматизацію.
          </p>
        </div>

        {/* Posts as rows */}
        <div>
          {POSTS.map((p) => (
            <div key={p.num} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <Link href={`/blog/${p.slug}`} className="block">
                <div className="grid grid-cols-[40px_1fr_auto] gap-8 py-8 items-start group">
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#CCCCCC', letterSpacing: '0.1em', paddingTop: '2px' }}>
                    {p.num}
                  </span>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs uppercase tracking-widest" style={{ color: '#DDDDDD' }}>{p.category}</span>
                      <span className="text-xs" style={{ color: '#CCCCCC' }}>{p.date} · {p.readTime}</span>
                    </div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#FFFFFF', letterSpacing: '-0.01em', marginBottom: '10px', lineHeight: 1.3 }}>
                      {p.title}
                    </h2>
                    <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#AAAAAA' }}>{p.excerpt}</p>
                  </div>
                  <span className="text-xs pt-1 transition-colors group-hover:text-white" style={{ color: '#CCCCCC', whiteSpace: 'nowrap' }}>
                    Читати →
                  </span>
                </div>
              </Link>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: '#CCCCCC' }}>
            ProxyService Blog
          </p>
          <a href="mailto:support@proxyservice.io"
            className="text-xs font-medium"
            style={{ color: '#EEEEEE' }}>
            support@proxyservice.io →
          </a>
        </div>
      </div>
    </div>
  )
}
