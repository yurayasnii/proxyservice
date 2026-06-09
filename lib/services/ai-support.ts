import mongoose from 'mongoose'
import User from '../models/User'
import UserProxy from '../models/UserProxy'
import Transaction from '../models/Transaction'
import SupportTicket from '../models/SupportTicket'
import { encrypt } from '../utils/crypto'
import crypto from 'crypto'
import type { AIResponse, AIAction } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Returns true if user message signals the issue is resolved / they're happy
function isResolved(text: string): boolean {
  const t = text.toLowerCase()
  if (/не\s+(працює|спрацювало|вийшло|допомогло|вирішено|запрацювало)/.test(t)) return false
  return /спасибі|дякую|все добре|все правильно|все ок|all good|вирішено|fixed|запрацювало|ок[,!. ]|^ок$|окей|perfect|дякс|допомогло/.test(t)
}

// Returns true if user says problem is still there or wants replacement
function isStillBroken(text: string): boolean {
  const t = text.toLowerCase()
  return /все одно|досі|ще не|не допомогло|не виходить|не підключ|не прац|connection refused|timeout|407|refused|error|помилк|замін|replace|не йде|не йде|не йде/.test(t)
}

function wantsReplace(text: string): boolean {
  return /замін|replace proxy|заміна|новий проксі/.test(text.toLowerCase())
}

type UserContext = {
  proxy: { id: unknown; replacedCount: number; usedPercent: number; ageHours: number } | null
  mostRecentProxy: { usedPercent: number; ageHours: number; amountUsdt: number } | null
  recentTransactions: Array<{ amountUsdt: number; createdAt: Date }>
  totalActiveProxies: number
}

async function getUserContext(userId: string, proxyId?: string): Promise<UserContext> {
  const [allProxies, transactions] = await Promise.all([
    UserProxy.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    Transaction.find({ userId, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
      .sort({ createdAt: -1 }).limit(10).lean(),
  ])

  const activeProxies = allProxies.filter((p) => p.status === 'active')

  function calcProxy(p: typeof allProxies[0]) {
    const now = Date.now()
    const total = p.expiresAt.getTime() - p.createdAt.getTime()
    const used = now - p.createdAt.getTime()
    const ageHours = Math.round(used / (1000 * 60 * 60))
    return {
      id: p._id,
      replacedCount: p.replacedCount ?? 0,
      usedPercent: Math.min(100, Math.round((used / total) * 100)),
      ageHours,
    }
  }

  let proxyCtx: UserContext['proxy'] = null
  if (proxyId) {
    const p = allProxies.find((x) => x._id.toString() === proxyId)
    if (p) proxyCtx = calcProxy(p)
  }

  // Fallback: most recently bought proxy (even without proxyId on ticket)
  let mostRecentProxy: UserContext['mostRecentProxy'] = null
  if (allProxies.length > 0) {
    const p = allProxies[0]
    const calc = calcProxy(p)
    // Find matching transaction
    const txAmount = transactions[0]?.amountUsdt
      ? parseFloat(transactions[0].amountUsdt.toString())
      : 0
    mostRecentProxy = { usedPercent: calc.usedPercent, ageHours: calc.ageHours, amountUsdt: txAmount }
  }

  return {
    proxy: proxyCtx,
    mostRecentProxy,
    totalActiveProxies: activeProxies.length,
    recentTransactions: transactions.map((t) => ({
      amountUsdt: parseFloat(t.amountUsdt?.toString() ?? '0'),
      createdAt: t.createdAt,
    })),
  }
}

// ─── Response builders ────────────────────────────────────────────────────

type Result = { message: string; action: AIAction; quickReplies?: string[]; actionMeta?: AIResponse['actionMeta'] }

function proxyNotWorking(step: number, text: string, ctx: UserContext): Result {
  if (isResolved(text)) {
    return {
      message: pick([
        '✅ Супер, радий що все запрацювало! Якщо виникнуть питання — звертайтесь, підтримка 24/7 🙂',
        '✅ Відмінно! Гарного користування проксі 🚀 Якщо ще щось — пишіть!',
      ]),
      action: null,
    }
  }

  if (step >= 1 && (isStillBroken(text) || wantsReplace(text))) {
    const canReplace = (ctx.proxy?.replacedCount ?? 0) < 3
    if (canReplace && ctx.proxy) {
      return {
        message: pick([
          '🔄 Замінюю проксі на новий вузол прямо зараз!\n\n**Нові дані з\'являться у розділі "Мої проксі" протягом хвилини.** Після цього оновіть налаштування у вашому клієнті та спробуйте ще раз.',
          '🔄 Запускаю заміну проксі!\n\n**Нові дані будуть у "Мої проксі" за хвилину.** Скопіюй їх і встав в налаштування заново.',
        ]),
        action: 'REPLACE_PROXY',
        quickReplies: ['Запрацювало після заміни ✅', 'Все одно не підключається', 'Потрібна допомога оператора'],
        actionMeta: { proxyId: ctx.proxy.id?.toString(), reason: 'Proxy replacement requested' },
      }
    }
    return {
      message: 'На жаль, ліміт автоматичних замін для цього проксі вичерпано.\n\nПередаю тікет живому оператору — він розгляне вашу ситуацію. **Очікуйте відповіді протягом 1–4 годин.**',
      action: 'ESCALATE',
      actionMeta: { reason: 'Max replacements reached' },
    }
  }

  return {
    message: pick([
      '🔧 Ей, привіт! Зараз розберемось 💪\n\nШвидкий чеклист — перевір кожен пункт:\n1. **Хост і порт** — скопійовані точно з розділу "Мої проксі"?\n2. **Протокол** — HTTP чи SOCKS5? Спробуй SOCKS5 якщо ще не пробував\n3. **Логін/пароль** — без зайвих пробілів на початку чи в кінці?\n4. **VPN** — якщо увімкнений, спробуй вимкнути і перевір ще раз',
      '🔧 Привіт! Не переживай, разом вирішимо 😊\n\nДавай перевіримо по кроках:\n1. **Дані актуальні?** — іноді браузер кешує старі налаштування\n2. **Термін дії не минув?** — глянь дату в "Мої проксі"\n3. **Протокол правильний?** — спробуй SOCKS5, він надійніший',
    ]),
    action: null,
    quickReplies: ['Допомогло, все працює ✅', 'Все одно не йде', 'Замініть проксі', 'Connection refused', 'Timeout помилка'],
  }
}

function slowSpeed(step: number, text: string, ctx: UserContext): Result {
  if (isResolved(text)) {
    return { message: '✅ Клас, швидкість покращилась! Гарного користування 🚀', action: null }
  }

  if (step >= 1 && isStillBroken(text)) {
    return {
      message: '😔 Розумію, швидкість все ще не влаштовує.\n\n🎁 **Додаю +7 днів до підписки безкоштовно** як компенсацію!\n\nТакож спробуй проксі з іншої локації — в каталозі 196+ країн, часто інший вузол дає набагато кращу швидкість 🌍',
      action: 'EXTEND_SUBSCRIPTION',
      quickReplies: ['Дякую, все добре ✅', 'Хочу змінити локацію', 'Потрібна допомога оператора'],
      actionMeta: { extendDays: 7, reason: 'Speed compensation' },
    }
  }

  return {
    message: '📉 Ей, зрозумів — швидкість не влаштовує!\n\nКілька речей що реально допомагають:\n1. **SOCKS5 замість HTTP** — зазвичай швидший\n2. **Вимкни VPN якщо є** — подвійне тунелювання суттєво ріже швидкість\n3. **Пікові години (18–23 UTC)** — краще тестувати вночі\n4. **Обери ближчий сервер** до цільового сайту',
    action: null,
    quickReplies: ['Стало краще, дякую ✅', 'Все одно повільно', 'SOCKS5 не допоміг', 'Хочу +7 днів компенсації'],
  }
}

function wrongGeo(step: number, text: string): Result {
  if (isResolved(text)) {
    return { message: '✅ Відмінно, геолокація правильна! Звертайтесь якщо щось ще 🙂', action: null }
  }

  if (step >= 1) {
    return {
      message: '🌍 Геолокація залежить від бази даних — різні сервіси можуть показувати різне для одного IP.\n\nПередаю тікет оператору для ручного аналізу 🤝 **Відповідь протягом 1–4 годин**',
      action: 'ESCALATE',
      actionMeta: { reason: 'GEO mismatch requires manual review' },
    }
  }

  return {
    message: '🌍 Ей, зрозумів — геолокація не та!\n\nСпробуй перевірити на [ip-api.com](http://ip-api.com/json) — він найточніший.\n\nРізні сервіси іноді показують різні країни для одного IP, тому важливо де перевіряти 🔍',
    action: null,
    quickReplies: ['ip-api.com показує не ту країну', 'Геолокація правильна, дякую ✅', 'Потрібен інший IP з тією ж країною', 'Передайте оператору'],
  }
}

function paymentIssue(step: number, text: string): Result {
  if (isResolved(text)) {
    return { message: '✅ Чудово, оплата пройшла! Дякую, що звернувся 😊', action: null }
  }

  if (/не зарахувалось|не прийшло|не дійшло|чекаю|довго|не отримав|де гроші/.test(text.toLowerCase())) {
    return {
      message: '⏳ Криптоплатежі іноді затримуються — це нормально!\n\n**Типові терміни:**\n- BTC: ~10–30 хвилин\n- ETH / USDT ERC20: ~3–5 хвилин\n- USDT TRC20: ~1–2 хвилини\n- TON: майже миттєво ⚡\n\nЯкщо минуло **більше 2 годин** — поділись txid і я перевірю вручну 🔍',
      action: null,
      quickReplies: ['✅ Зарахувалось, дякую', 'Минуло більше 2 годин', 'Хочу вказати txid', 'Потрібна допомога оператора'],
    }
  }

  return {
    message: '💳 Привіт! Допоможу розібратись з оплатою 🔍\n\nЩо сталось?',
    action: null,
    quickReplies: ['Платіж не пройшов', 'Гроші списались але не зарахувались', 'Чекаю підтвердження вже довго', 'Інша проблема з оплатою'],
  }
}

function refundRequest(step: number, text: string, ctx: UserContext, pendingPct?: number | null): Result {
  const t = text.toLowerCase()

  if (isResolved(t)) {
    return { message: 'Звертайся будь-коли!', action: null }
  }

  // Decline / cancel
  if (/ні.*залишу|ні.*замінити|залишу як є|скасую|відміня|не треба повернення/.test(t)) {
    return {
      message: 'Добре, залишаємо все як є.\n\nЯкщо щось ще — пиши!',
      action: null,
    }
  }

  // Confirmation of a previously-proposed refund
  const isConfirming = /так.*підтвердити|підтверджую/.test(t)
  if (isConfirming && pendingPct) {
    const spent = ctx.recentTransactions?.[0]?.amountUsdt ?? 0
    const amount = parseFloat((spent * (pendingPct / 100)).toFixed(2))
    const amountStr = amount > 0 ? `$${amount} USDT` : 'кошти'
    return {
      message: `Повернення **${pendingPct}%** виконано!\n\n${amountStr} зараховано на внутрішній баланс акаунту. Використовуй для купівлі будь-яких проксі в каталозі.`,
      action: 'REFUND_TO_BALANCE',
      actionMeta: { refundPercent: pendingPct, refundAmount: amount, reason: 'Confirmed refund' },
    }
  }

  // User wants replacement instead of refund
  if (wantsReplace(t)) {
    return {
      message: 'Зрозумів, заміна краще!\n\nПерейди у **"Мої проксі"**, знайди потрібний і натисни "Замінити". Новий вузол буде готовий за хвилину.',
      action: null,
      quickReplies: ['Зрозумів, дякую', 'Потрібна допомога оператора'],
    }
  }

  // ── Reason-based logic ───────────────────────────────────────────────────

  const buyMistake  = /помилково|випадково|не те|не той|не ту|не хотів/.test(t)
  const changedMind = /передумав|не потрібн|передумала/.test(t)
  const notWorking  = /не працює|не підключ/.test(t)
  const wrongGeoReq = /геолокац|країна|локація/.test(t)
  const wantsRefund = buyMistake || changedMind || /поверніть|refund|поверн/.test(t)

  if (notWorking) {
    return {
      message: 'Якщо проксі не працює — це технічна проблема, а не причина для повернення.\n\nВідкрий тікет **"Проксі не працює"** — я замінюю проксі автоматично і зазвичай це вирішує проблему за хвилину.',
      action: null,
      quickReplies: ['Добре, відкрию новий тікет', 'Все одно хочу повернення'],
    }
  }

  if (wrongGeoReq) {
    return {
      message: 'Проблема з геолокацією — вирішується без повернення.\n\nВідкрий тікет **"Неправильна геолокація"** — підберемо інший IP з правильною країною.',
      action: null,
      quickReplies: ['Добре, спробую так', 'Все одно хочу повернення'],
    }
  }

  // ── Calculate refund (propose only — executes on confirmation) ────────────

  if (wantsRefund) {
    const proxyData = ctx.proxy ?? ctx.mostRecentProxy
    const spent = ctx.recentTransactions?.[0]?.amountUsdt ?? 0
    const purchasedHoursAgo = ctx.mostRecentProxy?.ageHours ?? ctx.proxy?.ageHours ?? 9999

    // Bought by mistake and very recent (< 2h) → full 100% refund
    if (buyMistake && purchasedHoursAgo < 2) {
      const amount = parseFloat(spent.toFixed(2))
      const timeStr = purchasedHoursAgo < 1 ? 'менше години тому' : `${purchasedHoursAgo} год тому`
      return {
        message: `Бачу, що проксі куплено ${timeStr} — цілком зрозуміло.\n\nМожу повернути **100% вартості** на внутрішній баланс.\n\n💰 **Сума: ${amount > 0 ? `$${amount} USDT` : 'вартість покупки'}**\n\nПідтвердити повернення?`,
        action: null,
        quickReplies: ['Так, підтвердити повернення', 'Ні, залишу проксі'],
        actionMeta: { refundPercent: 100, refundAmount: amount, reason: 'Bought by mistake, <2h ago' },
      }
    }

    if (!proxyData) {
      return {
        message: 'Не можу знайти активні проксі у твоєму акаунті для розрахунку суми.\n\nПередаю тікет оператору — він перевірить вручну і відповість. **Очікуй відповіді протягом 1–4 годин.**',
        action: 'ESCALATE',
        actionMeta: { reason: 'Refund: no proxy data found' },
      }
    }

    const used = proxyData.usedPercent

    if (used < 25) {
      const amount = parseFloat((spent * 0.8).toFixed(2))
      return {
        message: `Перевірив — ти використав лише **${used}%** підписки (${proxyData.ageHours}г з моменту покупки).\n\nМожу повернути **80% вартості** на внутрішній баланс.\n\n💰 **Сума: ${amount > 0 ? `$${amount} USDT` : 'вартість покупки × 80%'}**\n\nПідтвердити?`,
        action: null,
        quickReplies: ['Так, підтвердити', 'Ні, краще замінити проксі'],
        actionMeta: { refundPercent: 80, refundAmount: amount, reason: 'Refund, <25% used' },
      }
    }

    if (used < 50) {
      const amount = parseFloat((spent * 0.5).toFixed(2))
      return {
        message: `Перевірив — ти використав **${used}%** підписки. По нашій політиці при 25–50% використання повертаємо **50% вартості** на баланс.\n\n💰 **Сума: ${amount > 0 ? `$${amount} USDT` : 'вартість покупки × 50%'}**\n\nПідтвердити?`,
        action: null,
        quickReplies: ['Так, підтвердити', 'Ні, залишу як є'],
        actionMeta: { refundPercent: 50, refundAmount: amount, reason: 'Refund, <50% used' },
      }
    }

    return {
      message: `Перевірив — ти вже використав **${used}%** підписки (куплено **${proxyData.ageHours}г тому**).\n\nПри використанні >50% грошове повернення не передбачено за нашою [політикою](/terms).\n\nАле можу:\n- Замінити проксі на інший вузол (безкоштовно)\n- Якщо є технічна проблема — вирішимо без повернення`,
      action: null,
      quickReplies: ['Замінити проксі', 'Є технічна проблема', 'Передайте оператору'],
    }
  }

  // Step 0 — ask reason
  return {
    message: 'Привіт! Зрозумів, питання щодо повернення.\n\nПоясни причину — щоб я міг одразу знайти найкраще рішення:',
    action: null,
    quickReplies: ['Куплено помилково', 'Просто передумав', 'Проксі не працює', 'Не та геолокація'],
  }
}

function other(step: number, text: string, ctx: UserContext): Result {
  const t = text.toLowerCase()

  if (isResolved(t)) {
    return { message: pick(['✅ Будь ласка! Звертайся будь-коли.', '✅ Рад допомогти! Гарного дня 🚀']), action: null }
  }

  if (/потрібна допомога оператора|передай оператору|живий|людина|менеджер/.test(t)) {
    return {
      message: 'Зрозумів — передаю тікет живому оператору.\n\n**Очікуй відповіді протягом 1–4 годин.** Зазвичай відповідаємо швидше 🙂',
      action: 'ESCALATE',
      actionMeta: { reason: 'User explicitly requested human operator' },
    }
  }

  // API / integration
  if (/\bapi\b|інтеграц|endpoint|sdk|curl|бібліотек|запит/.test(t)) {
    return {
      message: 'Для роботи з API:\n- Ключі та документація — розділ **"API Ключі"** у кабінеті\n- Базовий URL: `https://api.proxyservice.io/v1`\n- Авторизація: `Authorization: Bearer <ключ>`\n\nЯкий саме endpoint потрібен? Підкажу приклад.',
      action: null,
      quickReplies: ['Отримати список проксі', 'Перевірити статус проксі', 'Зрозумів, дякую ✅', 'Потрібна допомога оператора'],
    }
  }

  // Pricing
  if (/ціна|тариф|план|скільки коштує|вартість|знижка|промокод|дешевше/.test(t)) {
    return {
      message: 'Всі тарифи — в розділі **[Каталог](/catalog)**.\n\nЄ плани від 1 дня до 1 року для **196+ країн**. Довші підписки — до **25% знижки**.\n\nПромокод вводиш при оформленні замовлення.',
      action: null,
      quickReplies: ['Відкрити каталог ✅', 'Є промокод, як застосувати?', 'Яка мінімальна ціна?'],
    }
  }

  // Promo code how-to
  if (/як застосувати|ввести промокод|де промокод/.test(t)) {
    return {
      message: 'Промокод вводиться на сторінці оформлення замовлення — поле **"Промокод"** з\'являється перед оплатою.\n\n1. Відкрий **[Каталог](/catalog)**\n2. Обери проксі і тариф\n3. Натисни "Купити"\n4. Введи промокод у поле — знижка застосується автоматично',
      action: null,
      quickReplies: ['Зрозумів ✅', 'Промокод не спрацьовує'],
    }
  }

  // Min price question
  if (/мінімальна ціна|найдешевш|від скільки/.test(t)) {
    return {
      message: 'Мінімальна ціна — від **$1.50/день** для деяких регіонів (Африка, Азія).\n\nДля популярних напрямків (США, Європа): від **$4–6/день**.\n\nПовний список цін — у **[Каталозі](/catalog)**.',
      action: null,
      quickReplies: ['Відкрити каталог ✅', 'Інше питання'],
    }
  }

  // Countries / availability
  if (/країн|локац|геолокац|де є|яких країн|доступн|196/.test(t)) {
    return {
      message: 'Ми покриваємо **196 країн** — від США і Європи до Африки та Океанії.\n\nПовний список з фільтром по регіонах — у **[Каталозі](/catalog)**.\n\nЯкщо потрібна конкретна країна — уточни, перевірю наявність.',
      action: null,
      quickReplies: ['Є проксі з США?', 'Є проксі з України?', 'Відкрити каталог ✅'],
    }
  }

  // USA / Ukraine availability (common questions)
  if (/\busa\b|\bсша\b|америк|united states/.test(t)) {
    return {
      message: '✅ Так, США є в каталозі — residential, datacenter, ISP і mobile проксі.\n\nВідкрий **[Каталог](/catalog)** і відфільтруй по регіону "Північна Америка".',
      action: null,
      quickReplies: ['Відкрити каталог ✅', 'Ще питання'],
    }
  }

  if (/украін|україн|ukrainian|ukraine/.test(t)) {
    return {
      message: '✅ Так, Україна є в каталозі.\n\nВідкрий **[Каталог](/catalog)** і відфільтруй по регіону "Європа" або введи "UA" у пошук.',
      action: null,
      quickReplies: ['Відкрити каталог ✅', 'Ще питання'],
    }
  }

  // Payment methods
  if (/оплат|платіж|крипт|btc|eth|usdt|ton|картк|баланс/.test(t)) {
    return {
      message: 'Методи оплати:\n- **Крипто**: BTC, ETH, USDT (TRC20/ERC20), TON, LTC\n- **Баланс** акаунту (поповнюється криптою)\n\nОплата картою наразі недоступна. Після оплати криптою проксі активуються **автоматично** протягом хвилини.',
      action: null,
      quickReplies: ['Зрозумів ✅', 'Гроші списались але не зарахувались', 'Інше питання'],
    }
  }

  // Protocol questions
  if (/протокол|socks5|http|https|тип проксі/.test(t)) {
    return {
      message: 'Всі наші проксі підтримують **HTTP, HTTPS і SOCKS5**.\n\n**SOCKS5** — рекомендований: швидший, надійніший, працює з будь-якими програмами.\n\n**HTTP/HTTPS** — для браузерів і простих задач.\n\nПротокол обирається в налаштуваннях твого клієнта.',
      action: null,
      quickReplies: ['Зрозумів ✅', 'Як налаштувати SOCKS5?', 'Ще питання'],
    }
  }

  // Setup / how to use
  if (/як налаштувати|як підключити|налаштуван|встановити|setup|firefox|chrome|telegram|python/.test(t)) {
    return {
      message: 'Базова схема підключення:\n1. Відкрий **"Мої проксі"** → скопіюй хост, порт, логін, пароль\n2. В налаштуваннях програми знайди "Proxy" або "Мережа"\n3. Вибери тип **SOCKS5**, вкажи хост і порт\n4. Введи логін і пароль\n\nДля якої програми налаштовуєш? Підкажу детально.',
      action: null,
      quickReplies: ['Для браузера (Chrome/Firefox)', 'Для Python/коду', 'Для Telegram', 'Зрозумів ✅'],
    }
  }

  if (/браузер|chrome|firefox|safari/.test(t)) {
    return {
      message: 'Для браузера найпростіший варіант — розширення **FoxyProxy** (Firefox/Chrome):\n1. Встанови FoxyProxy\n2. Додай новий проксі: тип SOCKS5, хост, порт\n3. Логін/пароль\n4. Активуй\n\nАбо можна налаштувати системний проксі (Windows: Параметри → Мережа → Проксі).',
      action: null,
      quickReplies: ['Зрозумів, спробую ✅', 'Не вийшло, потрібна допомога'],
    }
  }

  if (/python|код|програм|script/.test(t)) {
    return {
      message: 'Для Python з бібліотекою `requests`:\n\n```python\nimport requests\n\nproxies = {\n  "http":  "socks5://login:pass@host:port",\n  "https": "socks5://login:pass@host:port"\n}\n\nr = requests.get("https://api.ipify.org", proxies=proxies)\nprint(r.text)  # покаже IP проксі\n```\n\nДля aiohttp або httpx — аналогічно, підкажу якщо треба.',
      action: null,
      quickReplies: ['Зрозумів ✅', 'Потрібен приклад для aiohttp', 'Не працює, помилка'],
    }
  }

  if (/telegram/.test(t)) {
    return {
      message: 'Для Telegram Desktop:\n1. Налаштування → Додатково → Тип підключення\n2. Обери **SOCKS5**\n3. Введи хост, порт, логін, пароль\n4. Натисни "Перевірити підключення"\n\nДля мобільного Telegram: Налаштування → Дані і пам\'ять → Тип підключення.',
      action: null,
      quickReplies: ['Зрозумів ✅', 'Підключення не проходить'],
    }
  }

  // Account / profile questions
  if (/акаунт|профіл|логін|пароль|увійти|зареєструватись|2fa/.test(t)) {
    return {
      message: 'По питаннях акаунту:\n- Забув пароль → **[Відновлення паролю](/auth/forgot-password)**\n- Налаштування → розділ **"Налаштування"** в кабінеті\n- 2FA — вмикається в налаштуваннях\n\nЯке саме питання?',
      action: null,
      quickReplies: ['Не можу увійти', 'Змінити пароль', 'Зрозумів ✅'],
    }
  }

  // Step >= 3 and no clear topic → escalate
  if (step >= 3) {
    return {
      message: 'Дякую за деталі! Схоже, питання потребує живого оператора.\n\nПередаю тікет — **відповідь протягом 1–4 годин** 🤝',
      action: 'ESCALATE',
      actionMeta: { reason: 'No matching topic after 3 exchanges' },
    }
  }

  // First message or unknown topic
  if (step === 0) {
    return {
      message: pick([
        '👋 Привіт! Я AI-підтримка ProxyService.\n\nЧим можу допомогти?',
        '👋 Привіт! Слухаю тебе.\n\nЩо за питання?',
      ]),
      action: null,
      quickReplies: ['Проксі не підключається', 'Питання по оплаті', 'Питання по API', 'Ціни і тарифи', 'Як налаштувати проксі'],
    }
  }

  // Follow-up with unknown intent — ask to clarify
  return {
    message: 'Уточни, будь ласка — не зовсім зрозумів 🙂\n\nАбо можу одразу передати живому оператору якщо питання складне.',
    action: null,
    quickReplies: ['Питання по оплаті', 'Питання по налаштуванню', 'Передай оператору', 'Зрозумів, дякую ✅'],
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

// Only detect pending proposals (contain "Підтвердити?"), not executed confirmations
function extractPendingRefundPct(content: string): number | null {
  if (!/підтвердити/i.test(content)) return null
  if (/100%/.test(content)) return 100
  if (/80%/.test(content)) return 80
  if (/50%/.test(content)) return 50
  return null
}

// ─── Main export ──────────────────────────────────────────────────────────

export async function processTicketMessage(
  ticketId: string,
  userId: string,
  userMessage: string
): Promise<AIResponse> {
  const ticket = await SupportTicket.findOne({ _id: ticketId, userId })
  if (!ticket) throw new Error('Ticket not found')

  const ctx = await getUserContext(userId, ticket.proxyId?.toString())
  const step = ticket.messages.filter((m) => m.role === 'user').length

  const lastAiMsg = [...ticket.messages].reverse().find((m) => m.role === 'assistant')
  const pendingPct = lastAiMsg ? extractPendingRefundPct(lastAiMsg.content) : null

  let result: Result

  switch (ticket.category) {
    case 'proxy_not_working':  result = proxyNotWorking(step, userMessage, ctx); break
    case 'slow_speed':         result = slowSpeed(step, userMessage, ctx); break
    case 'wrong_geo':          result = wrongGeo(step, userMessage); break
    case 'payment_issue':      result = paymentIssue(step, userMessage); break
    case 'refund_request':     result = refundRequest(step, userMessage, ctx, pendingPct); break
    default:                   result = other(step, userMessage, ctx)
  }

  const aiResponse: AIResponse = { message: result.message, action: result.action, quickReplies: result.quickReplies, actionMeta: result.actionMeta }

  ticket.messages.push({ role: 'user', content: userMessage } as typeof ticket.messages[0])
  ticket.messages.push({ role: 'assistant', content: aiResponse.message, quickReplies: result.quickReplies } as typeof ticket.messages[0])

  if (aiResponse.action) await executeAction(aiResponse.action, aiResponse.actionMeta, ticket, userId)

  await ticket.save()
  return aiResponse
}

// ─── Action executor ──────────────────────────────────────────────────────

async function executeAction(
  action: AIAction,
  meta: AIResponse['actionMeta'],
  ticket: Awaited<ReturnType<typeof SupportTicket.findOne>>,
  userId: string
) {
  if (!ticket) return

  switch (action) {
    case 'REPLACE_PROXY': {
      if (!ticket.proxyId) break
      const proxy = await UserProxy.findOne({ _id: ticket.proxyId as mongoose.Types.ObjectId, userId: new mongoose.Types.ObjectId(userId) })
      if (!proxy || proxy.replacedCount >= 3) break
      const hosts = ['195.154.122.30', '185.220.101.60', '91.108.4.30']
      proxy.host = hosts[Math.floor(Math.random() * hosts.length)]
      proxy.port = 8080 + Math.floor(Math.random() * 200)
      proxy.username = `ps_replaced_${Date.now()}`
      proxy.password = encrypt(crypto.randomBytes(12).toString('base64url'))
      proxy.replacedCount += 1
      await proxy.save()
      ticket.actions.push({ type: 'proxy_replaced', executedBy: 'AI', meta: { proxyId: ticket.proxyId, reason: meta?.reason } } as unknown as typeof ticket.actions[0])
      ticket.status = 'ai_resolved'
      break
    }

    case 'REFUND_TO_BALANCE': {
      const alreadyRefunded = ticket.actions.some((a) => a.type === 'refund_to_balance')
      if (alreadyRefunded) break
      const amount = meta?.refundAmount ?? 0
      if (amount > 0) {
        const user = await User.findById(userId)
        if (user) {
          const bal = parseFloat(user.balance.toString())
          user.balance = mongoose.Types.Decimal128.fromString((bal + amount).toFixed(8))
          await user.save()
          await Transaction.create({
            userId, type: 'refund',
            amount: mongoose.Types.Decimal128.fromString(amount.toFixed(8)),
            currency: 'USDT',
            amountUsdt: mongoose.Types.Decimal128.fromString(amount.toFixed(8)),
            status: 'confirmed',
            description: `Refund via AI support (ticket ${ticket._id})`,
          })
        }
      }
      ticket.actions.push({ type: 'refund_to_balance', executedBy: 'AI', meta: { refundAmount: amount, refundPercent: meta?.refundPercent, reason: meta?.reason } } as unknown as typeof ticket.actions[0])
      ticket.status = 'ai_resolved'
      break
    }

    case 'EXTEND_SUBSCRIPTION': {
      if (!ticket.proxyId || !meta?.extendDays) break
      const proxy = await UserProxy.findOne({ _id: ticket.proxyId as mongoose.Types.ObjectId, userId: new mongoose.Types.ObjectId(userId) })
      if (!proxy) break
      proxy.expiresAt = new Date(proxy.expiresAt.getTime() + (meta.extendDays ?? 0) * 24 * 60 * 60 * 1000)
      await proxy.save()
      ticket.actions.push({ type: 'subscription_extended', executedBy: 'AI', meta: { extendDays: meta.extendDays, proxyId: ticket.proxyId } } as unknown as typeof ticket.actions[0])
      ticket.status = 'ai_resolved'
      break
    }

    case 'ESCALATE': {
      ticket.actions.push({ type: 'escalated', executedBy: 'AI', meta: { reason: meta?.reason } } as unknown as typeof ticket.actions[0])
      ticket.status = 'pending_human'
      // Admin notifications wired up when admin panel is ready
      break
    }
  }
}
