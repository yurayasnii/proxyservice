# ProxyService — Документація

Платформа для продажу проксі-серверів. Користувачі реєструються, поповнюють баланс і купують проксі (Residential, Datacenter, Mobile, ISP) по всьому світу.

---

## Запуск

```bash
# 1. Встановити залежності
pnpm install

# 2. Запустити MongoDB та Redis
brew services start mongodb-community@7.0
brew services start redis

# 3. Заповнити базу тестовими даними
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
pnpm seed

# 4. Запустити сервер
pnpm dev
# → http://localhost:3000
```

**Тестові акаунти:**
- Admin: `admin@proxyservice.io` / `Admin@123456`
- User: `user@proxyservice.io` / `User@123456`

---

## Структура проекту

```
proxyservice/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Сторінки авторизації (login, register, reset-password)
│   ├── (dashboard)/              # Особистий кабінет (тільки для залогінених)
│   │   ├── layout.tsx            # Навбар, glow-фон, auth guard
│   │   ├── dashboard/page.tsx    # Огляд: статистика, швидкі дії, стан мережі
│   │   ├── proxies/page.tsx      # Список куплених проксі
│   │   ├── billing/page.tsx      # Поповнення балансу, транзакції
│   │   ├── support/page.tsx      # Тікети підтримки
│   │   ├── api-keys/page.tsx     # API ключі
│   │   ├── settings/page.tsx     # Профіль, пароль, OAuth
│   │   └── admin/page.tsx        # Адмін-панель (тільки role=admin)
│   ├── (marketing)/              # Публічний сайт (головна, ціни, блог, docs)
│   ├── (shop)/                   # Магазин
│   │   ├── catalog/page.tsx      # Каталог з фільтрами і сортуванням
│   │   ├── catalog/[id]/page.tsx # Сторінка продукту + вибір тарифу
│   │   └── cart/page.tsx         # Кошик
│   ├── api/v1/                   # REST API
│   │   ├── auth/                 # login, register, logout, refresh, me, reset-password
│   │   ├── products/             # Каталог продуктів
│   │   ├── orders/               # Замовлення (купівля проксі)
│   │   ├── proxies/              # Управління проксі (заміна, перевірка, авто-поновлення)
│   │   ├── billing/              # Транзакції, Stripe, NOWPayments, confirm-payment
│   │   ├── support/tickets/      # Тікети підтримки
│   │   ├── notifications/        # Сповіщення (дзвіночок)
│   │   ├── api-keys/             # API ключі користувача
│   │   ├── admin/                # Статистика, юзери, broadcast (тільки admin)
│   │   ├── status/               # Стан систем (реальні дані з БД)
│   │   └── tools/ip/             # Перевірити поточний IP + геолокація
│   ├── layout.tsx                # Root layout (шрифти, SEO метадані)
│   ├── globals.css               # Дизайн-система: кольори, анімації, утиліти
│   └── providers.tsx             # React провайдери + JWT авто-refresh interceptor
│
├── components/
│   ├── marketing/
│   │   ├── HeroSection.tsx       # Глобус 3D (SVG + requestAnimationFrame)
│   │   ├── LiveStatus.tsx        # Лічильники + осцилоскоп-хвилі мереж (Canvas)
│   │   ├── FeaturesGrid.tsx      # ParticleWave анімація + Unicode сітка
│   │   ├── ProxyTypesSection.tsx # Таби типів + NetworkAnimation
│   │   ├── UseCasesSection.tsx   # Кейси + DataStream анімація
│   │   ├── NetworkAnimation.tsx  # Canvas: вузли міст + пакети даних між ними
│   │   ├── ParticleWave.tsx      # Canvas: синусоїдальна хвиля з точок
│   │   ├── DataStream.tsx        # Canvas: вертикальний потік IP-адрес
│   │   └── Nav.tsx               # Навбар (показує профіль якщо залогінений)
│   └── ui/                       # Базові UI компоненти
│
├── lib/
│   ├── db/
│   │   ├── connect.ts            # MongoDB підключення (кешування між запитами)
│   │   └── seed.ts               # Заповнення БД тестовими даними
│   ├── models/                   # Mongoose схеми (User, Order, UserProxy, ...)
│   ├── jobs/                     # BullMQ фонові задачі
│   │   ├── queue.ts              # Ініціалізація черг Redis
│   │   ├── scheduler.ts          # Розклад: коли запускати кожну задачу
│   │   ├── expiryNotifier.ts     # Сповіщення про закінчення проксі
│   │   ├── autoRenewer.ts        # Авто-поновлення (списує з балансу)
│   │   ├── orderExpiry.ts        # Скасування прострочених замовлень
│   │   └── proxyHealthCheck.ts   # Перевірка чи проксі живий
│   └── utils/
│       ├── jwt.ts                # Підпис і верифікація JWT токенів
│       ├── auth.ts               # requireAuth(), requireRole() для API routes
│       ├── crypto.ts             # Шифрування паролів проксі (AES-256-GCM)
│       ├── redis.ts              # Redis клієнт + rate limiting (sliding window)
│       ├── response.ts           # ok(), error(), unauthorized() хелпери
│       └── authFetch.ts          # fetchMe() з авто-refresh токена
│
├── public/
│   ├── flags/    # 192 прапора країн (us.png, de.png, ua.png...)
│   └── photos/   # 13 фотографій для маркетингових секцій
│
├── types/index.ts      # TypeScript типи для всього проекту
├── workers.ts          # Точка запуску фонових задач: pnpm workers
└── .env.local          # Секретні ключі (не комітити в git!)
```

---

## Як працюють JWT токени

### Схема авторизації

```
Користувач → POST /api/v1/auth/login
                    ↓
         Сервер перевіряє email + bcrypt(password)
                    ↓
         Створює 2 JWT токени:
         • access_token  — 15 хвилин  (httpOnly cookie)
         • refresh_token — 30 днів    (httpOnly cookie)
                    ↓
         Браузер автоматично зберігає cookies
```

### Що відбувається коли токен "вилітає"

```
Через 15 хвилин access_token закінчується
              ↓
API повертає 401 Unauthorized
              ↓
providers.tsx перехоплює (глобальний fetch interceptor)
              ↓
Автоматично викликає POST /api/v1/auth/refresh
              ↓
Сервер перевіряє refresh_token (30 днів)
→ Видає новий access_token → зберігає в cookie
              ↓
Повторює оригінальний запит
              ↓
Користувач нічого не помічає ✓
```

**Де реалізовано:** `app/providers.tsx` — глобальний `window.fetch` interceptor.

### Перевірка токена на сервері

Кожен захищений API route:
```typescript
// Звичайний юзер:
const payload = requireAuth(req)
// → { userId, email, role }

// Тільки адмін:
const payload = requireRole(req, ['admin'])
```

---

## База даних (MongoDB)

### Переглянути дані через термінал

```bash
mongosh mongodb://localhost:27017/proxyservice

# Всі юзери:
db.users.find({}, { email:1, username:1, balance:1, role:1 }).pretty()

# Активні проксі:
db.userproxies.find({ status: "active" }).count()

# Транзакції конкретного юзера:
db.transactions.find({ userId: ObjectId("...") }).sort({ createdAt: -1 })

# Продукти каталогу:
db.proxproducts.find({ isActive: true }, { name:1, type:1, countryCode:1 }).limit(10)
```

### Встановити баланс юзеру

```bash
db.users.updateOne(
  { email: "user@proxyservice.io" },
  { $set: { balance: Decimal128("100.00") } }
)
```

### Колекції

| Колекція | Що зберігає |
|---|---|
| `users` | Акаунти: email, username, balance, role, referralCode |
| `proxproducts` | Каталог: країна, тип, швидкість, тарифи, ціни |
| `orders` | Замовлення: статус, сума, метод оплати |
| `userproxies` | Куплені проксі: host:port, логін/пароль, термін дії |
| `transactions` | Фінанси: поповнення, покупки, повернення |
| `supporttickets` | Тікети підтримки з повідомленнями |
| `apikeys` | API ключі для зовнішніх інтеграцій |
| `notifications` | Сповіщення в дзвіночку шапки |

---

## API Reference

Базовий URL: `/api/v1/`

### Авторизація
| Метод | Шлях | Опис |
|---|---|---|
| POST | `/auth/register` | Реєстрація (email, username, password) |
| POST | `/auth/login` | Вхід |
| POST | `/auth/logout` | Вихід (очищає cookies) |
| POST | `/auth/refresh` | Оновити access_token через refresh_token |
| GET | `/auth/me` | Поточний юзер |
| PATCH | `/auth/me` | Оновити профіль або пароль |
| POST | `/auth/reset-password` | Скинути пароль (надсилає email) |

### Продукти і замовлення
| Метод | Шлях | Опис |
|---|---|---|
| GET | `/products` | Каталог (фільтри: type, country, limit) |
| GET | `/products/:id` | Один продукт |
| POST | `/orders` | Купити проксі (списує з балансу) |
| GET | `/proxies` | Мої проксі |
| POST | `/proxies/:id` | Дія: replace / check / toggle_renew |

### Білінг
| Метод | Шлях | Опис |
|---|---|---|
| GET | `/billing/transactions` | Список транзакцій |
| POST | `/billing/confirm-payment` | Демо-поповнення балансу |
| POST | `/billing/stripe` | Ініціювати Stripe платіж |
| POST | `/billing/deposit` | Крипто-депозит (NOWPayments) |

### Адмін (role=admin)
| Метод | Шлях | Опис |
|---|---|---|
| GET | `/admin/stats` | Загальна статистика |
| GET | `/admin/users` | Список юзерів з пошуком |
| POST | `/admin/users/:id` | Дії: ban / unban / refund / deactivate_proxies |
| POST | `/admin/notify` | Broadcast сповіщення всім юзерам |
| PATCH | `/products/:id` | Активувати/деактивувати продукт у каталозі |

---

## Фонові задачі

Запустити окремим процесом:
```bash
pnpm workers
```

| Задача | Розклад | Що робить |
|---|---|---|
| proxy-health | кожні 5 хв | Перевіряє чи проксі живий (TCP ping) |
| expiry-notifier | кожну годину | Сповіщення за 3 дні і за 1 день до закінчення |
| auto-renewer | кожні 6 год | Поновлює проксі з auto-renew (списує з балансу) |
| order-expiry | щохвилини | Скасовує незаплачені замовлення |

---

## Зовнішні сервіси

| Сервіс | Ключ (.env.local) | Призначення |
|---|---|---|
| MongoDB | `MONGODB_URI` | Основна база даних |
| Redis | `REDIS_URL` | Черги задач, rate limiting |
| Resend | `RESEND_API_KEY` | Email: reset password, контактна форма |
| Stripe | `STRIPE_SECRET_KEY` | Оплата банківською карткою |
| NOWPayments | `NOWPAYMENTS_API_KEY` | Оплата криптовалютою |
| Google OAuth | `AUTH_GOOGLE_ID/SECRET` | Вхід через Google |
| GitHub OAuth | `AUTH_GITHUB_ID/SECRET` | Вхід через GitHub |

---

## Стек технологій

| Категорія | Технологія |
|---|---|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, Tailwind CSS |
| Database | MongoDB + Mongoose |
| Queue | BullMQ + Redis |
| Auth | JWT + NextAuth (Google/GitHub) |
| Email | Resend |
| Payments | Stripe + NOWPayments |
| Animations | Canvas API + requestAnimationFrame |
| Runtime | Node.js 20, pnpm |
