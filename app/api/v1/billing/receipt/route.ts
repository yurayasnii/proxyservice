import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import Transaction from '@/lib/models/Transaction'
import User from '@/lib/models/User'
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from '@/lib/utils/jwt'
import type { JWTPayload } from '@/types'
import mongoose from 'mongoose'

const METHOD_LABELS: Record<string, string> = {
  card: 'Банківська картка',
  crypto: 'Криптовалюта',
  balance: 'Внутрішній баланс',
  btc: 'Bitcoin', eth: 'Ethereum',
  usdt_trc20: 'USDT (TRC-20)', usdt_erc20: 'USDT (ERC-20)',
  ton: 'TON', ltc: 'Litecoin',
}

function authFromRequest(req: NextRequest): { payload: JWTPayload; newAccessToken?: string } {
  const access = req.cookies.get('access_token')?.value
  if (access) {
    try { return { payload: verifyAccessToken(access) } } catch {}
  }
  const refresh = req.cookies.get('refresh_token')?.value
  if (!refresh) throw new Error('No token provided')
  const payload = verifyRefreshToken(refresh)
  const newAccessToken = signAccessToken({ userId: payload.userId, email: payload.email, role: payload.role })
  return { payload, newAccessToken }
}

export async function GET(req: NextRequest) {
  try {
    const { payload, newAccessToken } = authFromRequest(req)
    const txId = req.nextUrl.searchParams.get('txId')
    if (!txId) return new Response('Missing txId', { status: 400 })

    await connectDB()

    const tx = await Transaction.findOne({
      _id: new mongoose.Types.ObjectId(txId),
      userId: payload.userId,
    }).lean()

    if (!tx) return new Response('Транзакцію не знайдено', { status: 404 })

    const user = await User.findById(payload.userId).lean()
    const amount = parseFloat(tx.amountUsdt?.toString() ?? tx.amount?.toString() ?? '0')
    const shortId = tx._id.toString().slice(-10).toUpperCase()
    const txDate = tx.createdAt
      ? new Date(tx.createdAt).toLocaleString('uk-UA', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        })
      : '—'
    const methodLabel = METHOD_LABELS[tx.network ?? ''] ?? METHOD_LABELS['crypto'] ?? 'Криптовалюта'
    const currency = tx.currency ?? 'USDT'

    const logoScale = (34 * 0.75) / 435
    const logoBgW   = Math.round(1408 * logoScale)
    const logoBgH   = Math.round(768  * logoScale)
    const logoPosX  = Math.round(34 / 2 - 700  * logoScale)
    const logoPosY  = Math.round(34 / 2 - 277.5 * logoScale)
    const logoBottom = Math.max(0, 34 - Math.round(460 * logoScale + logoPosY) - 1)

    const html = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Квитанція поповнення #${shortId} — ProxyService</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
    html, body { height: 100%; font-family: -apple-system, 'Inter', 'Segoe UI', sans-serif; background: #EBEBEC; color: #18181B; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; gap: 12px; }
    .toolbar { width: 100%; max-width: 560px; display: flex; align-items: center; justify-content: space-between; }
    .toolbar-label { font-size: 12px; color: #888; font-weight: 500; }
    .btn-print { display: flex; align-items: center; gap: 7px; background: #18181B; color: #FFF; font-size: 12.5px; font-weight: 600; padding: 8px 18px; border-radius: 9px; cursor: pointer; border: none; transition: opacity 0.15s; }
    .btn-print:hover { opacity: 0.84 }
    .receipt { width: 100%; max-width: 560px; background: #FFF; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.07), 0 12px 40px rgba(0,0,0,0.06); overflow: hidden; }
    .rh { background: #18181B; padding: 18px 28px 16px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .brand { display: flex; align-items: center; gap: 9px; }
    .brand-icon { width: 34px; height: 34px; border-radius: 8px; background: #FFF; position: relative; overflow: hidden; flex-shrink: 0; }
    .brand-icon-inner { position: absolute; top: 0; left: 0; right: 0; bottom: ${logoBottom}px; background-image: url('/logo.png'); background-size: ${logoBgW}px ${logoBgH}px; background-position: ${logoPosX}px ${logoPosY}px; background-repeat: no-repeat; }
    .brand-name { font-size: 16px; font-weight: 800; color: #FFF; letter-spacing: -0.03em; }
    .brand-sub  { font-size: 10px; color: rgba(255,255,255,0.38); margin-top: 1px; }
    .rh-right { text-align: right; }
    .rh-doc { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 2px; }
    .rh-title { font-size: 22px; font-weight: 900; color: #FFF; letter-spacing: -0.04em; }
    .meta-strip { background: #111; padding: 10px 28px; display: flex; gap: 32px; border-top: 1px solid rgba(255,255,255,0.06); }
    .mi-label { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 3px; }
    .mi-val { font-size: 12px; font-weight: 600; color: #FFF; }
    .mi-val.mono { font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 0.04em; }
    .badge-ok { display: inline-flex; align-items: center; gap: 3px; background: rgba(34,197,94,0.14); border: 1px solid rgba(34,197,94,0.28); color: #4ADE80; font-size: 9.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; }
    .rb { padding: 24px 28px 28px; }
    .sec-label { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #A1A1AA; margin-bottom: 10px; }
    .customer-box { background: #F8F8F9; border-radius: 8px; padding: 10px 14px; margin-bottom: 20px; }
    .cust-name { font-size: 13px; font-weight: 600; color: #18181B; }
    .cust-email { font-size: 11px; color: #71717A; margin-top: 1px; }
    .amount-box { display: flex; align-items: center; justify-content: space-between; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; }
    .amount-label { font-size: 11px; color: #16A34A; font-weight: 600; }
    .amount-val { font-size: 32px; font-weight: 900; color: #15803D; letter-spacing: -0.04em; }
    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F5F5F6; font-size: 12.5px; }
    .details-row:last-child { border-bottom: none; }
    .dl { color: #71717A; }
    .dv { color: #18181B; font-weight: 500; font-family: 'Courier New', monospace; font-size: 11.5px; }
    .sig-wrap { margin-top: 20px; display: flex; align-items: flex-end; justify-content: space-between; }
    .sig-left { flex: 1; }
    .sig-label { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #A1A1AA; margin-bottom: 6px; }
    .sig-svg-wrap { border-bottom: 1.5px solid #D4D4D8; padding-bottom: 2px; display: inline-block; }
    .sig-name { font-size: 10px; color: #71717A; margin-top: 4px; }
    .stamp-wrap { margin-left: 16px; }
    .rf { background: #FAFAFA; border-top: 1px solid #F0F0F1; padding: 11px 28px; display: flex; align-items: center; justify-content: space-between; }
    .rf-text { font-size: 10px; color: #ABABAB; line-height: 1.6; }
    .rf-text strong { color: #888; }
    .rf-hash { font-family: 'Courier New', monospace; font-size: 9px; color: #C8C8CA; text-align: right; }
    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { display: block !important; background: #EBEBEC !important; padding: 8mm !important; margin: 0 !important; min-height: 0 !important; height: auto !important; }
      .toolbar { display: none !important; }
      .receipt { box-shadow: none !important; border-radius: 6px !important; max-width: 100% !important; width: 100% !important; }
      .rh { background: #18181B !important; }
      .meta-strip { background: #111 !important; }
      .amount-box { background: #F0FDF4 !important; border: 1px solid #BBF7D0 !important; }
      .customer-box { background: #F8F8F9 !important; }
      @page { size: A4 portrait; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span class="toolbar-label">Квитанція поповнення #${shortId}</span>
    <button class="btn-print" onclick="window.print()">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
      </svg>
      Зберегти PDF
    </button>
  </div>

  <div class="receipt">
    <div class="rh">
      <div class="brand">
        <div class="brand-icon"><div class="brand-icon-inner"></div></div>
        <div>
          <div class="brand-name">ProxyService</div>
          <div class="brand-sub">proxyservice.io</div>
        </div>
      </div>
      <div class="rh-right">
        <div class="rh-doc">Документ</div>
        <div class="rh-title">ДЕПОЗИТ</div>
      </div>
    </div>

    <div class="meta-strip">
      <div><div class="mi-label">Номер</div><div class="mi-val mono">#${shortId}</div></div>
      <div><div class="mi-label">Дата</div><div class="mi-val">${txDate}</div></div>
      <div><div class="mi-label">Статус</div><div class="mi-val"><span class="badge-ok">✓ Зараховано</span></div></div>
    </div>

    <div class="rb">
      <div class="sec-label">Клієнт</div>
      <div class="customer-box">
        <div class="cust-name">${user?.username ?? 'Користувач'}</div>
        <div class="cust-email">${user?.email ?? ''}</div>
      </div>

      <div class="sec-label">Сума поповнення</div>
      <div class="amount-box">
        <div class="amount-label">Зараховано на баланс</div>
        <div class="amount-val">+$${amount.toFixed(2)}</div>
      </div>

      <div class="sec-label">Деталі транзакції</div>
      <div>
        <div class="details-row"><span class="dl">Метод оплати</span><span class="dv">${methodLabel}</span></div>
        <div class="details-row"><span class="dl">Валюта</span><span class="dv">${currency}</span></div>
        <div class="details-row"><span class="dl">ID транзакції</span><span class="dv">${tx._id.toString()}</span></div>
        <div class="details-row"><span class="dl">Сума USD</span><span class="dv">$${amount.toFixed(2)}</span></div>
      </div>

      <div class="sig-wrap">
        <div class="sig-left">
          <div class="sig-label">Підпис</div>
          <div class="sig-svg-wrap">
            <svg width="175" height="44" viewBox="0 0 175 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 36 L5 10 C5 10 5 5 10 5 C15 5 17 9 17 13 C17 18 13.5 20 8 20" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M19 26 L19 16 C19 16 21 12 25 13" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M27 20 C27 20 25 15 29.5 14 C34 13 37 16 36.5 20 C36 25 32 26 28.5 25 C26 24 26 21 27 20 Z" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M39 14 L47 26 M47 14 L39 26" stroke="#18181B" stroke-width="1.6" stroke-linecap="round"/>
              <path d="M50 14 L55 24 M60 14 L55 24 C53 29 50 32 46.5 33" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M73 16 C73 16 68 12 65 15 C62 18 66 21 70 22 C74 23 77 26 74 29 C71 32 66 30 64 27" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M80 20 C80 20 78 15.5 82 14 C86 12.5 89.5 16 88.5 20 C87.5 24 82.5 25.5 80 22.5 C78.5 21 80 18.5 82 18" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M92 26 L92 16 C92 16 94 12 98 13" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M101 14 L106 25 L111 14" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M114 15 L114 26" stroke="#18181B" stroke-width="1.6" stroke-linecap="round"/>
              <circle cx="114" cy="11" r="1.4" fill="#18181B"/>
              <path d="M125 17.5 C123 14.5 119 14.5 117 17.5 C115 20.5 116 24.5 119 25.5 C122 26.5 125 24.5 125 24.5" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M128 20 C128 20 126 15.5 130 14 C134 12.5 137.5 16 136.5 20 C135.5 24 130.5 25.5 128 22.5 C126.5 21 128 18.5 130 18" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4 37 C35 34 90 36 138 35 C155 34.5 165 36 173 34" stroke="#18181B" stroke-width="1" stroke-linecap="round" opacity="0.28"/>
            </svg>
          </div>
          <div class="sig-name">ProxyService LLC · Бухгалтерія</div>
        </div>
        <div class="stamp-wrap">
          <svg width="80" height="80" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="44" cy="44" r="42" stroke="#18181B" stroke-width="2"/>
            <circle cx="44" cy="44" r="35" stroke="#18181B" stroke-width="0.7" stroke-dasharray="1.8 2"/>
            <path id="tArc2" d="M44 44 m-32 0 a32 32 0 0 1 64 0" fill="none"/>
            <text font-size="6.5" font-weight="700" letter-spacing="2.8" fill="#18181B" font-family="sans-serif"><textPath href="#tArc2" startOffset="7%">PROXYSERVICE.IO</textPath></text>
            <path id="bArc2" d="M44 44 m-32 0 a32 32 0 0 0 64 0" fill="none"/>
            <text font-size="6" font-weight="600" letter-spacing="2.2" fill="#18181B" font-family="sans-serif" opacity="0.55"><textPath href="#bArc2" startOffset="12%">DEPOSIT RECEIPT</textPath></text>
            <text x="30" y="48" font-size="11" font-weight="800" fill="#18181B" font-family="sans-serif">+$${amount.toFixed(0)}</text>
          </svg>
        </div>
      </div>
    </div>

    <div class="rf">
      <div class="rf-text"><strong>ProxyService LLC</strong> · proxyservice.io · Підтвердження поповнення балансу.</div>
      <div class="rf-hash">TX ID<br/>${tx._id.toString()}</div>
    </div>
  </div>
</body>
</html>`

    const headers = new Headers({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-cache' })
    if (newAccessToken) headers.append('Set-Cookie', `access_token=${newAccessToken}; HttpOnly; SameSite=Strict; Max-Age=${15 * 60}; Path=/`)
    return new Response(html, { status: 200, headers })
  } catch (err) {
    const msg = (err as Error).message
    if (msg === 'No token provided' || msg?.includes('jwt')) {
      return new Response('{"success":false,"error":"Unauthorized"}', { status: 401, headers: { 'Content-Type': 'application/json' } })
    }
    return new Response('Помилка сервера', { status: 500 })
  }
}
