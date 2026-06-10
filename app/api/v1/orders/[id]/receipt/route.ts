import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import Order from '@/lib/models/Order'
import ProxyProduct from '@/lib/models/ProxyProduct'
import User from '@/lib/models/User'
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from '@/lib/utils/jwt'
import type { JWTPayload } from '@/types'
import mongoose from 'mongoose'

const DURATION_LABELS: Record<string, string> = {
  '1d': '1 день', '7d': '7 днів', '30d': '30 днів',
  '90d': '90 днів', '180d': '6 місяців', '1y': '1 рік',
}

const PAYMENT_LABELS: Record<string, string> = {
  balance: 'Внутрішній баланс', btc: 'Bitcoin', eth: 'Ethereum',
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { payload, newAccessToken } = authFromRequest(req)
    const { id } = await params
    await connectDB()

    const order = await Order.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: payload.userId,
    }).lean()

    if (!order) {
      return new Response('Замовлення не знайдено', { status: 404 })
    }

    const user = await User.findById(payload.userId).lean()

    const productIds = order.items.map(i => i.productId)
    const products = await ProxyProduct.find({ _id: { $in: productIds } }).lean()
    const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]))

    const total    = parseFloat(order.totalUsdt?.toString() ?? '0')
    const discount = parseFloat(order.discountUsdt?.toString() ?? '0')
    const subtotal = total + discount

    const orderId   = order._id.toString()
    const shortId   = orderId.slice(-10).toUpperCase()
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleString('uk-UA', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        })
      : '—'

    const itemsHtml = order.items.map(item => {
      const product = productMap[item.productId?.toString() ?? '']
      const name    = product?.name ?? 'Proxy Service'
      const plan    = product?.plans?.find((p: { _id: mongoose.Types.ObjectId }) => p._id.toString() === item.planId?.toString())
      const dur     = DURATION_LABELS[plan?.duration ?? ''] ?? plan?.duration ?? '—'
      const price   = parseFloat(item.priceUsdt?.toString() ?? '0')
      const totalLine = price * item.quantity

      return `
        <tr>
          <td class="td-name">
            <span class="item-name">${name}</span>
            <span class="item-sub">${plan?.duration ? dur : '—'} · ${item.ipCount ?? 0} IP / замовлення</span>
          </td>
          <td class="td-num">${item.quantity}</td>
          <td class="td-num">$${price.toFixed(2)}</td>
          <td class="td-num bold">$${totalLine.toFixed(2)}</td>
        </tr>`
    }).join('')

    /* Logo CSS values for 34px box (Logo component formula) */
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
  <title>Квитанція #${shortId} — ProxyService</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }

    html, body {
      height: 100%;
      font-family: -apple-system, 'Inter', 'Segoe UI', sans-serif;
      background: #EBEBEC;
      color: #18181B;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 16px;
      gap: 12px;
    }

    /* Toolbar */
    .toolbar {
      width: 100%; max-width: 760px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .toolbar-label { font-size: 12px; color: #888; font-weight: 500; letter-spacing: 0.01em; }
    .btn-print {
      display: flex; align-items: center; gap: 7px;
      background: #18181B; color: #FFF;
      font-size: 12.5px; font-weight: 600;
      padding: 8px 18px; border-radius: 9px;
      cursor: pointer; border: none; transition: opacity 0.15s;
    }
    .btn-print:hover { opacity: 0.84 }

    /* Receipt card */
    .receipt {
      width: 100%; max-width: 760px;
      background: #FFF;
      border-radius: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07), 0 12px 40px rgba(0,0,0,0.06);
      overflow: hidden;
    }

    /* ── HEADER ── */
    .rh {
      background: #18181B;
      padding: 18px 28px 16px;
      display: flex; align-items: center; justify-content: space-between;
      gap: 16px;
    }
    .brand { display: flex; align-items: center; gap: 9px; }
    .brand-icon {
      width: 34px; height: 34px; border-radius: 8px;
      background: #FFF; position: relative; overflow: hidden; flex-shrink: 0;
    }
    .brand-icon-inner {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: ${logoBottom}px;
      background-image: url('/logo.png');
      background-size: ${logoBgW}px ${logoBgH}px;
      background-position: ${logoPosX}px ${logoPosY}px;
      background-repeat: no-repeat;
    }
    .brand-name { font-size: 16px; font-weight: 800; color: #FFF; letter-spacing: -0.03em; }
    .brand-sub  { font-size: 10px; color: rgba(255,255,255,0.38); margin-top: 1px; }

    .rh-right { text-align: right; }
    .rh-doc { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 2px; }
    .rh-title { font-size: 22px; font-weight: 900; color: #FFF; letter-spacing: -0.04em; }

    /* Meta strip */
    .meta-strip {
      background: #111;
      padding: 10px 28px;
      display: flex; gap: 32px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .mi-label { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 3px; }
    .mi-val { font-size: 12px; font-weight: 600; color: #FFF; }
    .mi-val.mono { font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 0.04em; }
    .badge-paid {
      display: inline-flex; align-items: center; gap: 3px;
      background: rgba(34,197,94,0.14); border: 1px solid rgba(34,197,94,0.28); color: #4ADE80;
      font-size: 9.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
      padding: 2px 7px; border-radius: 4px;
    }

    /* ── BODY: two-column ── */
    .rb {
      display: grid;
      grid-template-columns: 1fr 220px;
      gap: 0;
    }
    .rb-left {
      padding: 18px 24px 18px 28px;
      border-right: 1px solid #F0F0F1;
    }
    .rb-right {
      padding: 18px 20px;
      display: flex; flex-direction: column; justify-content: space-between;
    }

    .sec-label {
      font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      color: #A1A1AA; margin-bottom: 8px;
    }

    /* Customer */
    .customer-box {
      background: #F8F8F9; border-radius: 8px;
      padding: 10px 14px; margin-bottom: 16px;
    }
    .cust-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .cust-name { font-size: 13px; font-weight: 600; color: #18181B; }
    .cust-email { font-size: 11px; color: #71717A; margin-top: 1px; }
    .cust-id { font-family: 'Courier New', monospace; font-size: 9.5px; color: #ABABAB; text-align: right; line-height: 1.5; }

    /* Table */
    table { width: 100%; border-collapse: collapse; }
    thead th {
      font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      color: #A1A1AA; padding: 0 0 8px;
      border-bottom: 1px solid #E8E8EA;
    }
    thead th:not(:first-child) { text-align: right; }
    tbody tr:not(:last-child) td { border-bottom: 1px solid #F5F5F6; }
    .td-name { padding: 10px 0; }
    .td-num { padding: 10px 0 10px 12px; text-align: right; font-size: 12.5px; color: #3F3F46; white-space: nowrap; }
    .bold { font-weight: 700; color: #18181B; }
    .item-name { display: block; font-size: 12.5px; font-weight: 500; color: #18181B; }
    .item-sub { display: block; font-size: 10.5px; color: #71717A; margin-top: 1px; font-family: 'Courier New', monospace; }

    /* Right column: totals */
    .totals { border-top: 1.5px solid #18181B; padding-top: 12px; }
    .total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .tl { font-size: 11px; color: #71717A; }
    .tv { font-size: 12px; color: #3F3F46; font-family: 'Courier New', monospace; }
    .total-row.final { margin-top: 10px; padding-top: 10px; border-top: 1px solid #E8E8EA; }
    .total-row.final .tl { font-size: 13px; font-weight: 800; color: #18181B; }
    .total-row.final .tv { font-size: 20px; font-weight: 900; color: #18181B; letter-spacing: -0.04em; font-family: inherit; }
    .disc { color: #16A34A; }

    /* Right column: signature */
    .sig-wrap { margin-top: 16px; }
    .sig-label { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #A1A1AA; margin-bottom: 6px; }
    .sig-svg-wrap { border-bottom: 1.5px solid #D4D4D8; padding-bottom: 2px; }
    .sig-name { font-size: 10px; color: #71717A; margin-top: 4px; }

    /* Stamp */
    .stamp-wrap { display: flex; justify-content: center; margin-top: 14px; }

    /* ── FOOTER ── */
    .rf {
      background: #FAFAFA; border-top: 1px solid #F0F0F1;
      padding: 11px 28px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .rf-text { font-size: 10px; color: #ABABAB; line-height: 1.6; }
    .rf-text strong { color: #888; }
    .rf-hash { font-family: 'Courier New', monospace; font-size: 9px; color: #C8C8CA; text-align: right; }

    /* ── PRINT ── */
    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { display: block !important; background: #EBEBEC !important; padding: 8mm !important; margin: 0 !important; min-height: 0 !important; height: auto !important; }
      .toolbar { display: none !important; }
      .receipt { box-shadow: none !important; border-radius: 6px !important; max-width: 100% !important; width: 100% !important; }
      .rh { background: #18181B !important; }
      .meta-strip { background: #111 !important; }
      .customer-box { background: #F8F8F9 !important; }
      @page { size: A4 landscape; margin: 0; }
    }
  </style>
</head>
<body>

  <div class="toolbar">
    <span class="toolbar-label">Квитанція #${shortId}</span>
    <button class="btn-print" onclick="window.print()">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"/>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
        <rect x="6" y="14" width="12" height="8"/>
      </svg>
      Зберегти PDF
    </button>
  </div>

  <div class="receipt">

    <!-- Header -->
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
        <div class="rh-title">КВИТАНЦІЯ</div>
      </div>
    </div>

    <!-- Meta strip -->
    <div class="meta-strip">
      <div>
        <div class="mi-label">Номер</div>
        <div class="mi-val mono">#${shortId}</div>
      </div>
      <div>
        <div class="mi-label">Дата оплати</div>
        <div class="mi-val">${orderDate}</div>
      </div>
      <div>
        <div class="mi-label">Статус</div>
        <div class="mi-val"><span class="badge-paid">✓ Оплачено</span></div>
      </div>
    </div>

    <!-- Body: left + right -->
    <div class="rb">

      <!-- LEFT: customer + items -->
      <div class="rb-left">
        <div class="sec-label">Клієнт</div>
        <div class="customer-box">
          <div class="cust-row">
            <div>
              <div class="cust-name">${user?.username ?? 'Користувач'}</div>
              <div class="cust-email">${user?.email ?? ''}</div>
            </div>
            <div class="cust-id">ID замовлення<br/>${orderId}</div>
          </div>
        </div>

        <div class="sec-label">Послуги</div>
        <table>
          <thead>
            <tr>
              <th style="text-align:left">Опис</th>
              <th>К-сть</th>
              <th>Ціна</th>
              <th>Сума</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
      </div>

      <!-- RIGHT: totals + signature + stamp -->
      <div class="rb-right">
        <div>
          <div class="sec-label" style="margin-bottom:10px">Підсумок</div>
          <div class="totals">
            <div class="total-row">
              <span class="tl">Проміжний</span>
              <span class="tv">$${subtotal.toFixed(2)}</span>
            </div>
            ${discount > 0 ? `
            <div class="total-row">
              <span class="tl">Знижка</span>
              <span class="tv disc">−$${discount.toFixed(2)}</span>
            </div>` : ''}
            <div class="total-row">
              <span class="tl">Оплата</span>
              <span class="tv" style="font-size:10px">${PAYMENT_LABELS[order.paymentMethod ?? ''] ?? '—'}</span>
            </div>
            <div class="total-row final">
              <span class="tl">Разом</span>
              <span class="tv">$${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <div class="sig-wrap">
            <div class="sig-label">Підпис</div>
            <div class="sig-svg-wrap">
              <svg width="175" height="44" viewBox="0 0 175 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- P -->
                <path d="M5 36 L5 10 C5 10 5 5 10 5 C15 5 17 9 17 13 C17 18 13.5 20 8 20" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- r -->
                <path d="M19 26 L19 16 C19 16 21 12 25 13" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- o -->
                <path d="M27 20 C27 20 25 15 29.5 14 C34 13 37 16 36.5 20 C36 25 32 26 28.5 25 C26 24 26 21 27 20 Z" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- x -->
                <path d="M39 14 L47 26 M47 14 L39 26" stroke="#18181B" stroke-width="1.6" stroke-linecap="round"/>
                <!-- y -->
                <path d="M50 14 L55 24 M60 14 L55 24 C53 29 50 32 46.5 33" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- S -->
                <path d="M73 16 C73 16 68 12 65 15 C62 18 66 21 70 22 C74 23 77 26 74 29 C71 32 66 30 64 27" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- e -->
                <path d="M80 20 C80 20 78 15.5 82 14 C86 12.5 89.5 16 88.5 20 C87.5 24 82.5 25.5 80 22.5 C78.5 21 80 18.5 82 18" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- r -->
                <path d="M92 26 L92 16 C92 16 94 12 98 13" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- v -->
                <path d="M101 14 L106 25 L111 14" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- i -->
                <path d="M114 15 L114 26" stroke="#18181B" stroke-width="1.6" stroke-linecap="round"/>
                <circle cx="114" cy="11" r="1.4" fill="#18181B"/>
                <!-- c -->
                <path d="M125 17.5 C123 14.5 119 14.5 117 17.5 C115 20.5 116 24.5 119 25.5 C122 26.5 125 24.5 125 24.5" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- e -->
                <path d="M128 20 C128 20 126 15.5 130 14 C134 12.5 137.5 16 136.5 20 C135.5 24 130.5 25.5 128 22.5 C126.5 21 128 18.5 130 18" stroke="#18181B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- underline flourish -->
                <path d="M4 37 C35 34 90 36 138 35 C155 34.5 165 36 173 34" stroke="#18181B" stroke-width="1" stroke-linecap="round" opacity="0.28"/>
              </svg>
            </div>
            <div class="sig-name">ProxyService LLC · Директор</div>
          </div>

          <!-- Stamp -->
          <div class="stamp-wrap">
            <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="44" cy="44" r="42" stroke="#18181B" stroke-width="2"/>
              <circle cx="44" cy="44" r="35" stroke="#18181B" stroke-width="0.7" stroke-dasharray="1.8 2"/>
              <path id="tArc" d="M44 44 m-32 0 a32 32 0 0 1 64 0" fill="none"/>
              <text font-size="6.5" font-weight="700" letter-spacing="2.8" fill="#18181B" font-family="sans-serif">
                <textPath href="#tArc" startOffset="7%">PROXYSERVICE.IO</textPath>
              </text>
              <path id="bArc" d="M44 44 m-32 0 a32 32 0 0 0 64 0" fill="none"/>
              <text font-size="6" font-weight="600" letter-spacing="2.2" fill="#18181B" font-family="sans-serif" opacity="0.55">
                <textPath href="#bArc" startOffset="10%">OFFICIAL RECEIPT</textPath>
              </text>
              <clipPath id="sc"><circle cx="44" cy="44" r="22"/></clipPath>
              <image href="/logo.png"
                x="${44 - logoBgW/2 + logoPosX + 27}" y="${44 - logoBgH/2 - logoPosY - 1}"
                width="${logoBgW}" height="${logoBgH}"
                clip-path="url(#sc)"
                preserveAspectRatio="xMidYMid meet"/>
              <text x="10" y="46" font-size="6" fill="#18181B" opacity="0.4" font-family="sans-serif">✦</text>
              <text x="74" y="46" font-size="6" fill="#18181B" opacity="0.4" font-family="sans-serif">✦</text>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="rf">
      <div class="rf-text">
        <strong>ProxyService LLC</strong> · proxyservice.io ·
        Офіційне підтвердження оплати послуг.
      </div>
      <div class="rf-hash">Верифікаційний ID<br/>${orderId}</div>
    </div>

  </div>

</body>
</html>`

    const headers = new Headers({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-cache',
    })
    if (newAccessToken) {
      headers.append('Set-Cookie', `access_token=${newAccessToken}; HttpOnly; SameSite=Strict; Max-Age=${15 * 60}; Path=/`)
    }
    return new Response(html, { status: 200, headers })
  } catch (err) {
    const msg = (err as Error).message
    if (msg === 'No token provided' || msg?.includes('jwt')) {
      return new Response('{"success":false,"error":"Unauthorized"}', { status: 401, headers: { 'Content-Type': 'application/json' } })
    }
    return new Response('Помилка сервера', { status: 500 })
  }
}
