import { NextRequest } from 'next/server'
import { ok } from '@/lib/utils/response'

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') ?? '127.0.0.1'

  try {
    const geo = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,isp,proxy,hosting`, {
      next: { revalidate: 60 },
    })
    if (geo.ok) {
      const d = await geo.json()
      return ok({
        ip,
        country: d.country ?? 'Unknown',
        countryCode: d.countryCode ?? 'XX',
        city: d.city ?? 'Unknown',
        isp: d.isp ?? 'Unknown',
        isProxy: d.proxy || d.hosting || false,
        flag: d.countryCode
          ? String.fromCodePoint(...[...d.countryCode].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
          : '🌐',
      })
    }
  } catch { /* fallback */ }

  return ok({ ip, country: 'Unknown', city: 'Unknown', isp: 'Unknown', isProxy: false, flag: '🌐' })
}
