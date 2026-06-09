export const metadata = { title: 'API Docs — ProxyService' }

const ENDPOINTS = [
  { num: '01', method: 'GET', path: '/api/v1/auth/me', desc: 'Поточний користувач' },
  { num: '02', method: 'POST', path: '/api/v1/auth/login', desc: 'Авторизація' },
  { num: '03', method: 'GET', path: '/api/v1/proxies', desc: 'Список активних проксі' },
  { num: '04', method: 'GET', path: '/api/v1/products', desc: 'Каталог продуктів' },
  { num: '05', method: 'POST', path: '/api/v1/orders', desc: 'Створити замовлення' },
  { num: '06', method: 'GET', path: '/api/v1/billing/transactions', desc: 'Транзакції' },
  { num: '07', method: 'GET', path: '/api/v1/tools/ip', desc: 'Перевірити поточний IP' },
  { num: '08', method: 'GET', path: '/api/v1/api-keys', desc: 'Управління API-ключами' },
]

const METHOD_COLORS: Record<string, string> = {
  GET: '#22C55E',
  POST: '#3B82F6',
  DELETE: '#EF4444',
  PATCH: '#F59E0B',
}

const CODE_EXAMPLES = [
  {
    num: '01',
    lang: 'Python',
    code: `import requests

proxies = {
    "http":  "http://user:pass@proxy.proxyservice.io:8080",
    "https": "http://user:pass@proxy.proxyservice.io:8080",
}

r = requests.get("https://ipinfo.io/json", proxies=proxies)
print(r.json())`,
  },
  {
    num: '02',
    lang: 'Node.js',
    code: `const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const agent = new HttpsProxyAgent(
  'http://user:pass@proxy.proxyservice.io:8080'
);

const res = await axios.get('https://ipinfo.io/json', {
  httpsAgent: agent,
});
console.log(res.data);`,
  },
  {
    num: '03',
    lang: 'cURL',
    code: `curl -x http://user:pass@proxy.proxyservice.io:8080 \\
     https://ipinfo.io/json`,
  },
]

export default function DocsPage() {
  return (
    <div style={{ background: '#060606', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-28">

        {/* Header */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] mb-6" style={{ color: '#DDDDDD' }}>
            Документація
          </p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,5vw,64px)', lineHeight: .92, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            API<br />
            <span className="text-wave">Reference</span>
          </h1>
          <p className="text-sm mt-6 max-w-lg" style={{ color: '#AAAAAA', lineHeight: 1.8 }}>
            REST API для повного контролю над проксі. Авторизація через httpOnly cookie після логіну — надсилай запити без додаткових заголовків.
          </p>
        </div>

        {/* Auth note */}
        <div className="mb-16 p-5 rounded-none" style={{ borderLeft: '2px solid rgba(255,255,255,0.12)', paddingLeft: '20px' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: '#FFFFFF', marginBottom: '8px' }}>
            Авторизація
          </p>
          <p style={{ fontSize: '13px', lineHeight: 1.75, color: '#AAAAAA' }}>
            Після <code style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.06)', padding: '1px 5px' }}>POST /api/v1/auth/login</code> встановлюється httpOnly cookie <code style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.06)', padding: '1px 5px' }}>access_token</code>. Всі захищені endpoints авторизуються автоматично.
          </p>
        </div>

        {/* Endpoints */}
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.18em] mb-6" style={{ color: '#DDDDDD' }}>
            Endpoints
          </p>
          <div>
            {ENDPOINTS.map((e) => (
              <div key={e.path} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="grid grid-cols-[40px_1fr] gap-8 py-5 items-center">
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#CCCCCC', letterSpacing: '0.1em' }}>
                    {e.num}
                  </span>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-mono text-xs font-bold" style={{ color: METHOD_COLORS[e.method], minWidth: '36px' }}>
                      {e.method}
                    </span>
                    <code className="font-mono text-sm flex-1" style={{ color: '#FFFFFF' }}>{e.path}</code>
                    <span className="text-xs" style={{ color: '#EEEEEE' }}>{e.desc}</span>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
          </div>
        </div>

        {/* Code examples */}
        <div>
          <p className="text-xs uppercase tracking-[0.18em] mb-6" style={{ color: '#DDDDDD' }}>
            Швидкий старт
          </p>
          {CODE_EXAMPLES.map((ex) => (
            <div key={ex.lang} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="grid grid-cols-[40px_1fr] gap-8 py-8">
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '11px', color: '#CCCCCC', letterSpacing: '0.1em', paddingTop: '2px' }}>
                  {ex.num}
                </span>
                <div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: '#FFFFFF', marginBottom: '12px' }}>
                    {ex.lang}
                  </p>
                  <div className="rounded-xl overflow-hidden" style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex gap-1.5">
                        {['#FF5F57', '#FFBD2E', '#28C840'].map(col => (
                          <div key={col} className="w-2.5 h-2.5 rounded-full" style={{ background: col }} />
                        ))}
                      </div>
                      <span className="text-xs font-mono ml-2" style={{ color: '#EEEEEE' }}>{ex.lang.toLowerCase()}</span>
                    </div>
                    <pre className="p-4 text-sm overflow-x-auto" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#CCCCCC', lineHeight: 1.7 }}>
                      <code>{ex.code}</code>
                    </pre>
                  </div>
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
            Потрібна допомога?
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
