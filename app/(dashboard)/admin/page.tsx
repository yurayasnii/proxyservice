'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Users, Globe, ShoppingCart, MessageSquare, TrendingUp, DollarSign,
  RefreshCw, Bell, Send, Loader2, Search, Ban, Wallet,
  PowerOff, Power, ChevronRight, X, Package, Eye, EyeOff,
  AlertTriangle, ShieldOff, Plus, Pencil, Trash2, Check,
  Activity, Clock, CreditCard, Zap, ArrowDownLeft, ArrowUpRight,
  Bot, User as UserIcon, MapPin,
} from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────── */

const DURATIONS   = ['1d', '7d', '30d', '90d', '180d', '1y'] as const
const PROTOCOLS   = ['http', 'https', 'socks5'] as const
const PROXY_TYPES = ['residential', 'datacenter', 'mobile', 'isp'] as const

const COUNTRIES: { code: string; name: string }[] = [
  {code:'ad',name:'Andorra'},{code:'ae',name:'UAE'},{code:'af',name:'Afghanistan'},
  {code:'al',name:'Albania'},{code:'am',name:'Armenia'},{code:'ao',name:'Angola'},
  {code:'ar',name:'Argentina'},{code:'at',name:'Austria'},{code:'au',name:'Australia'},
  {code:'az',name:'Azerbaijan'},{code:'ba',name:'Bosnia'},{code:'bd',name:'Bangladesh'},
  {code:'be',name:'Belgium'},{code:'bg',name:'Bulgaria'},{code:'bh',name:'Bahrain'},
  {code:'bn',name:'Brunei'},{code:'bo',name:'Bolivia'},{code:'br',name:'Brazil'},
  {code:'by',name:'Belarus'},{code:'bz',name:'Belize'},{code:'ca',name:'Canada'},
  {code:'cd',name:'DR Congo'},{code:'ch',name:'Switzerland'},{code:'cl',name:'Chile'},
  {code:'cm',name:'Cameroon'},{code:'cn',name:'China'},{code:'co',name:'Colombia'},
  {code:'cr',name:'Costa Rica'},{code:'cu',name:'Cuba'},{code:'cy',name:'Cyprus'},
  {code:'cz',name:'Czech Republic'},{code:'de',name:'Germany'},{code:'dk',name:'Denmark'},
  {code:'do',name:'Dominican Rep.'},{code:'dz',name:'Algeria'},{code:'ec',name:'Ecuador'},
  {code:'ee',name:'Estonia'},{code:'eg',name:'Egypt'},{code:'es',name:'Spain'},
  {code:'et',name:'Ethiopia'},{code:'fi',name:'Finland'},{code:'fj',name:'Fiji'},
  {code:'fr',name:'France'},{code:'gb',name:'United Kingdom'},{code:'ge',name:'Georgia'},
  {code:'gh',name:'Ghana'},{code:'gr',name:'Greece'},{code:'gt',name:'Guatemala'},
  {code:'gy',name:'Guyana'},{code:'hn',name:'Honduras'},{code:'hr',name:'Croatia'},
  {code:'ht',name:'Haiti'},{code:'hu',name:'Hungary'},{code:'id',name:'Indonesia'},
  {code:'ie',name:'Ireland'},{code:'il',name:'Israel'},{code:'in',name:'India'},
  {code:'iq',name:'Iraq'},{code:'ir',name:'Iran'},{code:'is',name:'Iceland'},
  {code:'it',name:'Italy'},{code:'jm',name:'Jamaica'},{code:'jo',name:'Jordan'},
  {code:'jp',name:'Japan'},{code:'ke',name:'Kenya'},{code:'kg',name:'Kyrgyzstan'},
  {code:'kh',name:'Cambodia'},{code:'kr',name:'South Korea'},{code:'kw',name:'Kuwait'},
  {code:'kz',name:'Kazakhstan'},{code:'la',name:'Laos'},{code:'lb',name:'Lebanon'},
  {code:'li',name:'Liechtenstein'},{code:'lk',name:'Sri Lanka'},{code:'lt',name:'Lithuania'},
  {code:'lu',name:'Luxembourg'},{code:'lv',name:'Latvia'},{code:'ly',name:'Libya'},
  {code:'ma',name:'Morocco'},{code:'md',name:'Moldova'},{code:'me',name:'Montenegro'},
  {code:'mk',name:'North Macedonia'},{code:'mn',name:'Mongolia'},{code:'mo',name:'Macao'},
  {code:'mt',name:'Malta'},{code:'mu',name:'Mauritius'},{code:'mv',name:'Maldives'},
  {code:'mx',name:'Mexico'},{code:'my',name:'Malaysia'},{code:'mz',name:'Mozambique'},
  {code:'na',name:'Namibia'},{code:'ne',name:'Niger'},{code:'ng',name:'Nigeria'},
  {code:'ni',name:'Nicaragua'},{code:'nl',name:'Netherlands'},{code:'no',name:'Norway'},
  {code:'np',name:'Nepal'},{code:'nz',name:'New Zealand'},{code:'om',name:'Oman'},
  {code:'pa',name:'Panama'},{code:'pe',name:'Peru'},{code:'ph',name:'Philippines'},
  {code:'pk',name:'Pakistan'},{code:'pl',name:'Poland'},{code:'pt',name:'Portugal'},
  {code:'py',name:'Paraguay'},{code:'qa',name:'Qatar'},{code:'ro',name:'Romania'},
  {code:'rs',name:'Serbia'},{code:'ru',name:'Russia'},{code:'rw',name:'Rwanda'},
  {code:'sa',name:'Saudi Arabia'},{code:'sd',name:'Sudan'},{code:'se',name:'Sweden'},
  {code:'sg',name:'Singapore'},{code:'si',name:'Slovenia'},{code:'sk',name:'Slovakia'},
  {code:'sn',name:'Senegal'},{code:'so',name:'Somalia'},{code:'sr',name:'Suriname'},
  {code:'sv',name:'El Salvador'},{code:'sy',name:'Syria'},{code:'sz',name:'Eswatini'},
  {code:'td',name:'Chad'},{code:'th',name:'Thailand'},{code:'tj',name:'Tajikistan'},
  {code:'tl',name:'Timor-Leste'},{code:'tm',name:'Turkmenistan'},{code:'tn',name:'Tunisia'},
  {code:'tr',name:'Turkey'},{code:'tt',name:'Trinidad'},{code:'tz',name:'Tanzania'},
  {code:'ua',name:'Ukraine'},{code:'ug',name:'Uganda'},{code:'us',name:'United States'},
  {code:'uy',name:'Uruguay'},{code:'uz',name:'Uzbekistan'},{code:'ve',name:'Venezuela'},
  {code:'vn',name:'Vietnam'},{code:'ye',name:'Yemen'},{code:'za',name:'South Africa'},
  {code:'zm',name:'Zambia'},{code:'zw',name:'Zimbabwe'},
]

const TICKET_CATEGORIES: Record<string, string> = {
  proxy_not_working: 'Проксі не працює', slow_speed: 'Повільна швидкість',
  wrong_geo: 'Неправильна геолокація', payment_issue: 'Проблема з оплатою',
  refund_request: 'Запит на повернення', other: 'Інше',
}
const TICKET_STATUS_COLOR: Record<string, string> = {
  open: '#22C55E', ai_resolved: '#888', pending_human: '#F59E0B', closed: '#555',
}

const ORDER_STATUSES = ['', 'pending', 'awaiting_payment', 'paid', 'processing', 'completed', 'cancelled', 'refunded'] as const

const STATUS_COLORS: Record<string, string> = {
  completed: '#22C55E', paid: '#22C55E', processing: '#3B82F6',
  pending: '#F59E0B', awaiting_payment: '#F59E0B',
  cancelled: '#EF4444', refunded: '#8B5CF6',
}

interface PricingPlan {
  _id?: string; duration: string; ipCount: number; priceUsdt: number; discount: number; isPopular: boolean
}
interface AdminProduct {
  _id: string; name: string; description?: string; type: string
  countryCode: string; countryName: string; city?: string; ispName?: string
  protocols: string[]; speedMbps?: number; uptimePercent?: number
  stock: number; isActive: boolean; isFeatured: boolean; tags: string[]
  plans: PricingPlan[]
}
const EMPTY_PLAN: PricingPlan = { duration: '30d', ipCount: 1, priceUsdt: 9.99, discount: 0, isPopular: false }
function emptyProduct(): Omit<AdminProduct, '_id'> {
  return {
    name: '', description: '', type: 'datacenter', countryCode: 'US', countryName: 'United States',
    city: '', ispName: '', protocols: ['http', 'https'], speedMbps: 100, uptimePercent: 99.9,
    stock: -1, isActive: true, isFeatured: false, tags: [], plans: [{ ...EMPTY_PLAN }],
  }
}

interface AdminStats {
  totalUsers: number; activeProxies: number; totalOrders: number
  openTickets: number; revenue: number; pendingHumanTickets: number
}
interface AdminUser {
  _id: string; username: string; email: string; role: string
  balance: number; activeProxies: number; isBanned: boolean
  createdAt: string; oauthProviders?: string[]
}
interface AdminOrder {
  _id: string; status: string; totalUsdt: string | number
  paymentMethod: string; createdAt: string
  userId?: { username: string; email: string } | null
  items?: { ipCount: number }[]
}
interface AdminTicket {
  _id: string; category: string; status: string; createdAt: string
  messages: Array<{ role: string; content: string; createdAt: string }>
}
interface HealthStatus {
  ok: boolean; status: string
}
interface Health {
  mongodb: HealthStatus; redis: HealthStatus
  nowpayments: HealthStatus; resend: HealthStatus; stripe: HealthStatus
}
interface ActivityUser {
  _id: string; username: string; email: string; createdAt: string; role: string; oauthProviders?: string[]
}
interface AdminTransaction {
  _id: string; type: string; amountUsdt: string | number; currency: string
  status: string; description?: string; createdAt: string; txHash?: string; network?: string
  userId?: { username: string; email: string } | null
}

type Tab = 'overview' | 'analytics' | 'users' | 'products' | 'orders' | 'transactions' | 'support' | 'audit' | 'notify'

const TX_TYPE_COLORS: Record<string, string> = {
  deposit: '#22C55E', purchase: '#3B82F6', refund: '#8B5CF6', referral_bonus: '#F59E0B',
}
const TX_TYPE_LABELS: Record<string, string> = {
  deposit: 'Поповнення', purchase: 'Покупка', refund: 'Повернення', referral_bonus: 'Реф. бонус',
}

const STATS_CFG: { key: string; label: string; icon: React.ElementType; fmt?: (v: number) => string; alert?: boolean }[] = [
  { key: 'totalUsers',          label: 'Користувачів',    icon: Users },
  { key: 'activeProxies',       label: 'Активних проксі', icon: Globe },
  { key: 'totalOrders',         label: 'Замовлень',       icon: ShoppingCart },
  { key: 'openTickets',         label: 'Відкриті тікети', icon: MessageSquare },
  { key: 'revenue',             label: 'Дохід (USD)',     icon: DollarSign, fmt: (v) => `$${v.toFixed(2)}` },
  { key: 'pendingHumanTickets', label: 'Чекають оператора', icon: AlertTriangle, alert: true },
]

function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 0.01)
  const show = data.slice(-30)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
      {show.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
          <div
            title={`${d.label}: ${d.value}`}
            style={{ width: '100%', borderRadius: '3px 3px 0 0', background: d.value > 0 ? color : 'rgba(255,255,255,0.04)', height: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 2)}%`, transition: 'height 0.3s ease', opacity: 0.85 }}
          />
        </div>
      ))}
    </div>
  )
}

const INPUT: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', border: 'none', outline: 'none',
  color: '#FFFFFF', fontSize: '13.5px', borderRadius: '9px',
  transition: 'box-shadow 0.15s ease',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'щойно'
  if (m < 60)  return `${m}хв тому`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}год тому`
  return `${Math.floor(h / 24)}д тому`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ── Component ──────────────────────────────────────────────── */

export default function AdminPage() {
  const [stats,        setStats]        = useState<AdminStats>({ totalUsers: 0, activeProxies: 0, totalOrders: 0, openTickets: 0, revenue: 0, pendingHumanTickets: 0 })
  const [loadingStats, setLoadingStats] = useState(true)
  const [lastRefresh,  setLastRefresh]  = useState<Date | null>(null)
  const [activeTab,    setActiveTab]    = useState<Tab>('overview')

  // Health
  const [health,        setHealth]        = useState<Health | null>(null)
  const [loadingHealth, setLoadingHealth] = useState(false)

  // Activity
  const [activityUsers,  setActivityUsers]  = useState<ActivityUser[]>([])
  const [activityOrders, setActivityOrders] = useState<AdminOrder[]>([])
  const [loadingActivity, setLoadingActivity] = useState(false)

  // Products
  const [products,      setProducts]      = useState<AdminProduct[]>([])
  const [loadingProds,  setLoadingProds]  = useState(false)
  const [prodSearch,    setProdSearch]    = useState('')
  const [togglingProd,  setTogglingProd]  = useState<string | null>(null)
  const [prodFilter,    setProdFilter]    = useState<'all' | 'active' | 'inactive'>('all')
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editingId,     setEditingId]     = useState<string | null>(null)
  const [form,          setForm]          = useState<Omit<AdminProduct, '_id'>>(emptyProduct())
  const [savingProd,    setSavingProd]    = useState(false)
  const [deletingProd,  setDeletingProd]  = useState<string | null>(null)

  // Users
  const [users,         setUsers]         = useState<AdminUser[]>([])
  const [loadingUsers,  setLoadingUsers]  = useState(false)
  const [search,        setSearch]        = useState('')
  const [selected,      setSelected]      = useState<AdminUser | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [refundAmount,  setRefundAmount]  = useState('10')
  const [showRefund,    setShowRefund]    = useState(false)
  const [confirmBan,    setConfirmBan]    = useState(false)

  // Orders
  const [orders,        setOrders]        = useState<AdminOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [orderStatus,   setOrderStatus]   = useState('')
  const [orderPage,     setOrderPage]     = useState(1)
  const [orderPages,    setOrderPages]    = useState(1)
  const [orderTotal,    setOrderTotal]    = useState(0)

  // Tickets modal
  const [ticketsModal,     setTicketsModal]     = useState(false)
  const [userTickets,      setUserTickets]      = useState<AdminTicket[]>([])
  const [loadingTickets,   setLoadingTickets]   = useState(false)
  const [activeTicketIdx,  setActiveTicketIdx]  = useState(0)

  // Add proxy modal
  const [addProxyModal,    setAddProxyModal]    = useState(false)
  const [countrySearch,    setCountrySearch]    = useState('')
  const [selectedCountry,  setSelectedCountry]  = useState<{code:string;name:string}|null>(null)
  const [proxyProtocol,    setProxyProtocol]    = useState<'http'|'https'|'socks5'>('http')
  const [proxyDuration,    setProxyDuration]    = useState<typeof DURATIONS[number]>('30d')
  const [proxyIpCount,     setProxyIpCount]     = useState(1)
  const [addingProxy,      setAddingProxy]      = useState(false)

  // Transactions
  const [txList,        setTxList]        = useState<AdminTransaction[]>([])
  const [loadingTx,     setLoadingTx]     = useState(false)
  const [txTypeFilter,  setTxTypeFilter]  = useState('')
  const [txPage,        setTxPage]        = useState(1)
  const [txPages,       setTxPages]       = useState(1)
  const [txTotal,       setTxTotal]       = useState(0)

  // Analytics
  const [analytics,       setAnalytics]       = useState<{ revenue: {date:string;amount:number}[]; registrations: {date:string;count:number}[]; topSpenders: {_id:string;username:string;email:string;total:number;count:number}[] } | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [analyticsDays,   setAnalyticsDays]   = useState(30)

  // Expiring proxies
  const [expiring,       setExpiring]       = useState<{_id:string;host:string;port:number;protocol:string;expiresAt:string;autoRenew:boolean;userId:{username:string;email:string}|null}[]>([])
  const [loadingExpiring, setLoadingExpiring] = useState(false)
  const [expiringDays,   setExpiringDays]   = useState(7)

  // User timeline modal
  const [timelineModal,   setTimelineModal]   = useState(false)
  const [timeline,        setTimeline]        = useState<{type:string;label:string;sub?:string;amount?:number;color:string;date:string}[]>([])
  const [loadingTimeline, setLoadingTimeline] = useState(false)

  // Admin notes modal
  const [notesModal,    setNotesModal]    = useState(false)
  const [notes,         setNotes]         = useState<{_id:string;content:string;createdAt:string;adminId:{username:string}|null}[]>([])
  const [loadingNotes,  setLoadingNotes]  = useState(false)
  const [newNote,       setNewNote]       = useState('')
  const [savingNote,    setSavingNote]    = useState(false)

  // Individual notify modal
  const [notifyUserModal, setNotifyUserModal] = useState(false)
  const [notifyTitle,     setNotifyTitle]     = useState('')
  const [notifyBody,      setNotifyBody]      = useState('')
  const [sendingNotify,   setSendingNotify]   = useState(false)

  // Bulk select
  const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set())
  const [bulkAction,    setBulkAction]    = useState<'notify' | 'ban' | null>(null)
  const [bulkTitle,     setBulkTitle]     = useState('')
  const [bulkBody,      setBulkBody]      = useState('')
  const [bulkLoading,   setBulkLoading]   = useState(false)

  // Support tickets
  const [supportTickets,      setSupportTickets]      = useState<{_id:string;category:string;status:string;createdAt:string;updatedAt:string;messages:{role:string;content:string;createdAt:string}[];userId:{username:string;email:string}|null}[]>([])
  const [loadingSupport,      setLoadingSupport]      = useState(false)
  const [supportStatusFilter, setSupportStatusFilter] = useState('')
  const [supportPage,         setSupportPage]         = useState(1)
  const [supportPages,        setSupportPages]        = useState(1)
  const [supportTotal,        setSupportTotal]        = useState(0)
  const [openedTicket,        setOpenedTicket]        = useState<string | null>(null)
  const [deletingTicket,      setDeletingTicket]      = useState<string | null>(null)
  const [closingTicket,       setClosingTicket]       = useState<string | null>(null)
  const [replyText,           setReplyText]           = useState('')
  const [sendingReply,        setSendingReply]        = useState(false)
  const [ticketAction,        setTicketAction]        = useState<'orders'|'refund'|'ban'|'proxy'|null>(null)
  const [ticketOrders,        setTicketOrders]        = useState<AdminOrder[]>([])
  const [loadingTicketOrders, setLoadingTicketOrders] = useState(false)
  const [ticketRefundAmt,     setTicketRefundAmt]     = useState('10')
  const [ticketActionLoading, setTicketActionLoading] = useState(false)
  const [ticketProxies,       setTicketProxies]       = useState<{_id:string;host:string;port:number;protocol:string;expiresAt:string;replacedCount:number;countryCode?:string;countryName?:string}[]>([])
  const [loadingTicketProxies,setLoadingTicketProxies] = useState(false)
  const [replacingProxy,      setReplacingProxy]      = useState<string|null>(null)

  // Audit log
  const [auditLog,       setAuditLog]       = useState<{_id:string;adminUsername:string;action:string;targetName?:string;details?:Record<string,unknown>;createdAt:string}[]>([])
  const [loadingAudit,   setLoadingAudit]   = useState(false)
  const [auditPage,      setAuditPage]      = useState(1)
  const [auditPages,     setAuditPages]     = useState(1)

  // Notify
  const [notifTitle, setNotifTitle] = useState('')
  const [notifBody,  setNotifBody]  = useState('')
  const [notifType,  setNotifType]  = useState<'all' | 'active'>('all')
  const [sending,    setSending]    = useState(false)

  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const refreshTimer = useRef<ReturnType<typeof setInterval>>(undefined)

  /* ── Data loading ─────────────────────────────────────────── */

  const loadStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const r = await fetch('/api/v1/admin/stats')
      const d = await r.json()
      setStats(d.data ?? {})
      setLastRefresh(new Date())
    } finally { setLoadingStats(false) }
  }, [])

  const loadHealth = useCallback(async () => {
    setLoadingHealth(true)
    try {
      const r = await fetch('/api/v1/admin/health')
      const d = await r.json()
      if (d.success) setHealth(d.data)
    } finally { setLoadingHealth(false) }
  }, [])

  const loadActivity = useCallback(async () => {
    setLoadingActivity(true)
    try {
      const r = await fetch('/api/v1/admin/activity')
      const d = await r.json()
      if (d.success) {
        setActivityUsers(d.data.recentUsers ?? [])
        setActivityOrders(d.data.recentOrders ?? [])
      }
    } finally { setLoadingActivity(false) }
  }, [])

  const loadUsers = useCallback(async (q = '') => {
    setLoadingUsers(true)
    try {
      const res  = await fetch(`/api/v1/admin/users?q=${encodeURIComponent(q)}&limit=50`)
      const data = await res.json()
      setUsers(data.data?.items ?? [])
    } finally { setLoadingUsers(false) }
  }, [])

  const loadProducts = useCallback(async () => {
    setLoadingProds(true)
    try {
      const res  = await fetch('/api/v1/products?limit=500&all=true')
      const data = await res.json()
      setProducts(data.data?.items ?? [])
    } finally { setLoadingProds(false) }
  }, [])

  const loadOrders = useCallback(async (page = 1, status = '') => {
    setLoadingOrders(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (status) params.set('status', status)
      const res  = await fetch(`/api/v1/admin/orders?${params}`)
      const data = await res.json()
      if (data.success) {
        setOrders(data.data.items ?? [])
        setOrderPages(data.data.pages ?? 1)
        setOrderTotal(data.data.total ?? 0)
      }
    } finally { setLoadingOrders(false) }
  }, [])

  const loadSupport = useCallback(async (page = 1, status = '') => {
    setLoadingSupport(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' })
      if (status) params.set('status', status)
      const res  = await fetch(`/api/v1/admin/support?${params}`)
      const data = await res.json()
      if (data.success) {
        setSupportTickets(data.data.items ?? [])
        setSupportPages(data.data.pages ?? 1)
        setSupportTotal(data.data.total ?? 0)
      }
    } finally { setLoadingSupport(false) }
  }, [])

  const loadAnalytics = useCallback(async (days: number) => {
    setLoadingAnalytics(true)
    try {
      const res  = await fetch(`/api/v1/admin/analytics?days=${days}`)
      const data = await res.json()
      if (data.success) setAnalytics(data.data)
    } finally { setLoadingAnalytics(false) }
  }, [])

  const loadExpiring = useCallback(async (days: number) => {
    setLoadingExpiring(true)
    try {
      const res  = await fetch(`/api/v1/admin/proxies-expiring?days=${days}`)
      const data = await res.json()
      if (data.success) setExpiring(data.data.items ?? [])
    } finally { setLoadingExpiring(false) }
  }, [])

  const loadAudit = useCallback(async (page = 1) => {
    setLoadingAudit(true)
    try {
      const res  = await fetch(`/api/v1/admin/audit?page=${page}`)
      const data = await res.json()
      if (data.success) { setAuditLog(data.data.items ?? []); setAuditPages(data.data.pages ?? 1) }
    } finally { setLoadingAudit(false) }
  }, [])

  const loadTx = useCallback(async (page = 1, type = '') => {
    setLoadingTx(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' })
      if (type) params.set('type', type)
      const res  = await fetch(`/api/v1/admin/transactions?${params}`)
      const data = await res.json()
      if (data.success) {
        setTxList(data.data.items ?? [])
        setTxPages(data.data.pages ?? 1)
        setTxTotal(data.data.total ?? 0)
      }
    } finally { setLoadingTx(false) }
  }, [])

  // Initial load
  useEffect(() => {
    loadStats()
    loadHealth()
    loadActivity()
  }, [loadStats, loadHealth, loadActivity])

  // Auto-refresh stats every 60s
  useEffect(() => {
    refreshTimer.current = setInterval(() => { loadStats(); loadHealth() }, 60_000)
    return () => clearInterval(refreshTimer.current)
  }, [loadStats, loadHealth])

  useEffect(() => { if (activeTab === 'users')    loadUsers()   }, [activeTab, loadUsers])
  useEffect(() => { if (activeTab === 'products') loadProducts() }, [activeTab, loadProducts])
  useEffect(() => { if (activeTab === 'support') loadSupport(1, supportStatusFilter) }, [activeTab, supportStatusFilter])
  useEffect(() => { if (activeTab === 'orders')  loadOrders(1, orderStatus)         }, [activeTab, loadOrders, orderStatus])
  useEffect(() => { if (activeTab === 'transactions') loadTx(1, txTypeFilter)   }, [activeTab, txTypeFilter])
  useEffect(() => { if (activeTab === 'analytics')    loadAnalytics(analyticsDays) }, [activeTab, analyticsDays])
  useEffect(() => { if (activeTab === 'audit')        loadAudit(1)               }, [activeTab])
  useEffect(() => { if (activeTab === 'overview')     loadExpiring(expiringDays)  }, [activeTab, expiringDays])

  /* ── Product actions ──────────────────────────────────────── */

  function openCreate() { setEditingId(null); setForm(emptyProduct()); setModalOpen(true) }
  function openEdit(p: AdminProduct) {
    setEditingId(p._id)
    setForm({ name: p.name, description: p.description ?? '', type: p.type, countryCode: p.countryCode, countryName: p.countryName, city: p.city ?? '', ispName: p.ispName ?? '', protocols: p.protocols, speedMbps: p.speedMbps, uptimePercent: p.uptimePercent, stock: p.stock, isActive: p.isActive, isFeatured: p.isFeatured, tags: p.tags, plans: p.plans.map(pl => ({ ...pl })) })
    setModalOpen(true)
  }

  async function saveProduct() {
    setSavingProd(true)
    try {
      const url    = editingId ? `/api/v1/products/${editingId}` : '/api/v1/products'
      const method = editingId ? 'PUT' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data   = await res.json()
      if (!data.success) { toast.error(data.error ?? 'Помилка'); return }
      toast.success(editingId ? 'Продукт оновлено' : 'Продукт створено')
      setModalOpen(false); loadProducts()
    } finally { setSavingProd(false) }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Видалити продукт?')) return
    setDeletingProd(id)
    try {
      const res  = await fetch(`/api/v1/products/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!data.success) { toast.error(data.error ?? 'Помилка'); return }
      toast.success('Продукт видалено')
      setProducts(prev => prev.filter(p => p._id !== id))
    } finally { setDeletingProd(null) }
  }

  function setFormField<K extends keyof Omit<AdminProduct, '_id'>>(k: K, v: Omit<AdminProduct, '_id'>[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }
  function setPlan(i: number, k: keyof PricingPlan, v: unknown) {
    setForm(f => ({ ...f, plans: f.plans.map((p, idx) => idx === i ? { ...p, [k]: v } : p) }))
  }
  function addPlan()          { setForm(f => ({ ...f, plans: [...f.plans, { ...EMPTY_PLAN }] })) }
  function removePlan(i: number) { setForm(f => ({ ...f, plans: f.plans.filter((_, idx) => idx !== i) })) }

  async function toggleProduct(id: string, isActive: boolean) {
    setTogglingProd(id)
    try {
      const res  = await fetch(`/api/v1/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive }) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Помилка'); return }
      setProducts(prev => prev.map(p => p._id === id ? { ...p, isActive } : p))
      toast.success(isActive ? 'Продукт активовано' : 'Продукт деактивовано')
    } finally { setTogglingProd(null) }
  }

  /* ── User actions ─────────────────────────────────────────── */

  function handleSearch(q: string) {
    setSearch(q)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => loadUsers(q), 350)
  }

  async function userAction(userId: string, action: string, extra?: Record<string, unknown>) {
    setActionLoading(action); setConfirmBan(false)
    try {
      const res  = await fetch(`/api/v1/admin/users/${userId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...extra }) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Помилка'); return }
      toast.success(data.data?.message ?? 'Готово')
      const update = (u: AdminUser): AdminUser => ({
        ...u,
        isBanned:      action === 'ban' ? true : action === 'unban' ? false : u.isBanned,
        balance:       typeof data.data?.newBalance === 'number' ? data.data.newBalance : u.balance,
        activeProxies: action === 'deactivate_proxies' ? 0 : u.activeProxies,
      })
      setUsers(prev => prev.map(u => u._id === userId ? update(u) : u))
      if (selected?._id === userId) setSelected(prev => prev ? update(prev) : null)
      setShowRefund(false)
    } finally { setActionLoading(null) }
  }

  /* ── Timeline modal ───────────────────────────────────────── */

  async function openTimeline(userId: string) {
    setTimelineModal(true); setTimeline([]); setLoadingTimeline(true)
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/timeline`)
      const data = await res.json()
      if (data.success) setTimeline(data.data.events ?? [])
    } finally { setLoadingTimeline(false) }
  }

  /* ── Notes modal ───────────────────────────────────────────── */

  async function openNotes(userId: string) {
    setNotesModal(true); setNotes([]); setLoadingNotes(true); setNewNote('')
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/notes`)
      const data = await res.json()
      if (data.success) setNotes(data.data.items ?? [])
    } finally { setLoadingNotes(false) }
  }

  async function saveNote() {
    if (!selected || !newNote.trim()) return
    setSavingNote(true)
    try {
      const res = await fetch(`/api/v1/admin/users/${selected._id}/notes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
      })
      const data = await res.json()
      if (data.success) { setNotes(prev => [data.data, ...prev]); setNewNote('') }
      else toast.error(data.error)
    } finally { setSavingNote(false) }
  }

  async function deleteNote(noteId: string) {
    await fetch(`/api/v1/admin/users/${selected!._id}/notes`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: noteId }),
    })
    setNotes(prev => prev.filter(n => n._id !== noteId))
  }

  /* ── Individual notify ─────────────────────────────────────── */

  async function sendNotifyUser() {
    if (!selected || !notifyTitle.trim() || !notifyBody.trim()) return
    setSendingNotify(true)
    try {
      const res = await fetch(`/api/v1/admin/users/${selected._id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'notify', title: notifyTitle, body: notifyBody }),
      })
      const data = await res.json()
      if (data.success) { toast.success('Повідомлення надіслано'); setNotifyUserModal(false); setNotifyTitle(''); setNotifyBody('') }
      else toast.error(data.error)
    } finally { setSendingNotify(false) }
  }

  /* ── Role change ───────────────────────────────────────────── */

  async function changeRole(newRole: 'user' | 'admin') {
    if (!selected) return
    const res = await fetch(`/api/v1/admin/users/${selected._id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_role', role: newRole }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(`Роль змінено на ${newRole}`)
      setSelected(prev => prev ? { ...prev, role: newRole } : null)
      setUsers(prev => prev.map(u => u._id === selected._id ? { ...u, role: newRole } : u))
    } else toast.error(data.error)
  }

  /* ── CSV Export ────────────────────────────────────────────── */

  function exportCSV() {
    const rows = [['ID', 'Username', 'Email', 'Balance', 'Proxies', 'Role', 'Banned', 'Created']]
    users.forEach(u => rows.push([u._id, u.username, u.email, String(u.balance ?? 0), String(u.activeProxies), u.role, String(u.isBanned), u.createdAt]))
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = `users_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  /* ── Bulk actions ──────────────────────────────────────────── */

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  async function runBulkAction() {
    if (!selectedIds.size || !bulkAction) return
    setBulkLoading(true)
    try {
      await Promise.all([...selectedIds].map(id =>
        fetch(`/api/v1/admin/users/${id}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            bulkAction === 'ban'
              ? { action: 'ban' }
              : { action: 'notify', title: bulkTitle, body: bulkBody }
          ),
        })
      ))
      toast.success(`Дію "${bulkAction}" застосовано до ${selectedIds.size} юзерів`)
      setSelectedIds(new Set()); setBulkAction(null); setBulkTitle(''); setBulkBody('')
      if (bulkAction === 'ban') loadUsers()
    } finally { setBulkLoading(false) }
  }

  /* ── Tickets modal ────────────────────────────────────────── */

  async function openTickets(userId: string) {
    setTicketsModal(true); setUserTickets([]); setActiveTicketIdx(0); setLoadingTickets(true)
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/tickets`)
      const data = await res.json()
      if (data.success) setUserTickets(data.data.items ?? [])
    } finally { setLoadingTickets(false) }
  }

  /* ── Add proxy modal ───────────────────────────────────────── */

  async function submitAddProxy() {
    if (!selected || !selectedCountry) return
    setAddingProxy(true)
    try {
      const res = await fetch(`/api/v1/admin/users/${selected._id}/proxies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: selectedCountry.code.toUpperCase(),
          countryName: selectedCountry.name,
          protocol: proxyProtocol,
          duration: proxyDuration,
          ipCount: proxyIpCount,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Помилка'); return }
      toast.success(`Додано ${data.data.added} проксі до ${selected.username}`)
      setAddProxyModal(false)
      setSelected(prev => prev ? { ...prev, activeProxies: prev.activeProxies + proxyIpCount } : null)
      setUsers(prev => prev.map(u => u._id === selected._id ? { ...u, activeProxies: u.activeProxies + proxyIpCount } : u))
    } finally { setAddingProxy(false) }
  }

  /* ── Notify ───────────────────────────────────────────────── */

  async function sendBroadcast() {
    if (!notifTitle.trim() || !notifBody.trim()) return toast.error('Заповніть заголовок і текст')
    setSending(true)
    try {
      const res  = await fetch('/api/v1/admin/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: notifTitle, body: notifBody, type: notifType }) })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error ?? 'Помилка')
      toast.success(`Надіслано ${data.data?.count ?? ''} користувачам`)
      setNotifTitle(''); setNotifBody('')
    } finally { setSending(false) }
  }

  /* ── Derived ──────────────────────────────────────────────── */

  const filteredProducts = products.filter(p => {
    const matchSearch = !prodSearch || p.name.toLowerCase().includes(prodSearch.toLowerCase()) || p.countryName.toLowerCase().includes(prodSearch.toLowerCase())
    const matchFilter = prodFilter === 'all' || (prodFilter === 'active' ? p.isActive : !p.isActive)
    return matchSearch && matchFilter
  })
  const activeCount   = products.filter(p => p.isActive).length
  const inactiveCount = products.filter(p => !p.isActive).length

  /* ── Render ───────────────────────────────────────────────── */

  return (
    <div className="space-y-5">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '3px 9px', borderRadius: '4px', display: 'inline-block', marginBottom: '8px' }}>Admin</span>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '26px', letterSpacing: '-0.03em', color: '#FFFFFF' }}>Адмін-панель</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {lastRefresh && (
            <span style={{ fontSize: '11px', color: '#444', fontFamily: 'JetBrains Mono, monospace' }}>
              {lastRefresh.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button onClick={() => { loadStats(); loadHealth(); loadActivity() }} disabled={loadingStats}
            style={{ width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCCCCC', background: 'rgba(255,255,255,0.06)', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
            <RefreshCw style={{ width: '13px', height: '13px' }} className={loadingStats ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Alert */}
      {stats.pendingHumanTickets > 0 && (
        <div onClick={() => { setActiveTab('support'); setSupportStatusFilter('pending_human'); setSupportPage(1); loadSupport(1, 'pending_human') }}
          style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.06)', borderRadius: '10px', borderLeft: '2px solid #EF4444', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#EF4444' }}>
            ⚠️ {stats.pendingHumanTickets} тікет(ів) очікує оператора — перейти до тікетів →
          </p>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '10px', width: 'fit-content' }}>
        {([['overview', 'Огляд'], ['analytics', 'Аналітика'], ['users', 'Користувачі'], ['products', 'Продукти'], ['orders', 'Замовлення'], ['transactions', 'Транзакції'], ['support', `Тікети${stats.openTickets > 0 ? ` (${stats.openTickets})` : ''}`], ['audit', 'Журнал'], ['notify', 'Сповіщення']] as const).map(([t, l]) => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: activeTab === t ? '#FFFFFF' : '#555', background: activeTab === t ? 'rgba(255,255,255,0.09)' : 'transparent', transition: 'all 0.15s' }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <>
          {/* Stats grid */}
          <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0 }} className="md:grid-cols-3 lg:grid-cols-6">
              {STATS_CFG.map(({ key, label, icon: Icon, fmt, alert }, i) => {
                const val     = (stats as unknown as Record<string, number>)[key]
                const isAlert = alert && val > 0
                return (
                  <div key={key} style={{ padding: '20px', borderRight: i < 5 ? '1px solid rgba(255,255,255,0.06)' : 'none', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <Icon style={{ width: '12px', height: '12px', color: isAlert ? '#EF4444' : '#444' }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: isAlert ? '#EF4444' : '#444' }}>{label}</span>
                    </div>
                    {loadingStats
                      ? <div className="skeleton" style={{ height: '26px', width: '50px', borderRadius: '5px' }} />
                      : <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '22px', letterSpacing: '-0.03em', color: isAlert ? '#EF4444' : '#FFFFFF', lineHeight: 1 }}>{fmt ? fmt(val) : String(val ?? 0)}</p>
                    }
                  </div>
                )
              })}
            </div>
          </div>

          {/* Activity + Health */}
          <div style={{ display: 'grid', gap: '12px' }} className="lg:grid-cols-[1fr_280px]">

            {/* Recent Activity */}
            <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity style={{ width: '12px', height: '12px', color: '#444' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Остання активність</span>
                {loadingActivity && <Loader2 style={{ width: '11px', height: '11px', color: '#444', marginLeft: 'auto' }} className="animate-spin" />}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                {/* Recent signups */}
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444' }}>Реєстрації</span>
                  </div>
                  {activityUsers.slice(0, 6).map((u, i) => (
                    <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#CCCCCC', flexShrink: 0 }}>
                          {u.username?.slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '12px', fontWeight: 500, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</p>
                          {u.oauthProviders && u.oauthProviders.length > 0 && (
                            <p style={{ fontSize: '10px', color: '#444' }}>{u.oauthProviders[0]}</p>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', color: '#444', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>{timeAgo(u.createdAt)}</span>
                    </div>
                  ))}
                  {activityUsers.length === 0 && !loadingActivity && (
                    <p style={{ fontSize: '12px', color: '#333', padding: '20px 14px', textAlign: 'center' }}>Немає даних</p>
                  )}
                </div>

                {/* Recent orders */}
                <div>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444' }}>Замовлення</span>
                  </div>
                  {activityOrders.slice(0, 6).map((o, i) => (
                    <div key={o._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: 500, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(o.userId as { username: string } | null)?.username ?? 'Unknown'}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, color: STATUS_COLORS[o.status] ?? '#888', background: `${STATUS_COLORS[o.status] ?? '#888'}18`, padding: '1px 5px', borderRadius: '3px' }}>{o.status}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>${parseFloat(String(o.totalUsdt)).toFixed(2)}</p>
                        <p style={{ fontSize: '10px', color: '#444', fontFamily: 'JetBrains Mono, monospace' }}>{timeAgo(o.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  {activityOrders.length === 0 && !loadingActivity && (
                    <p style={{ fontSize: '12px', color: '#333', padding: '20px 14px', textAlign: 'center' }}>Немає даних</p>
                  )}
                </div>
              </div>
            </div>

            {/* System Health */}
            <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap style={{ width: '12px', height: '12px', color: '#444' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Стан системи</span>
                {loadingHealth && <Loader2 style={{ width: '11px', height: '11px', color: '#444', marginLeft: 'auto' }} className="animate-spin" />}
              </div>
              {health ? (
                Object.entries(health).map(([name, s], i) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ fontSize: '13px', color: '#888', textTransform: 'capitalize' }}>{name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.ok ? '#22C55E' : '#EF4444' }} />
                      <span style={{ fontSize: '11px', color: s.ok ? '#22C55E' : '#EF4444', fontFamily: 'JetBrains Mono, monospace' }}>{s.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                [['MongoDB', true], ['Redis', true], ['NOWPayments', false], ['Resend', false], ['Stripe', false]].map(([name, ok], i) => (
                  <div key={String(name)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ fontSize: '13px', color: '#888' }}>{name}</span>
                    <div className="skeleton" style={{ height: '12px', width: '60px', borderRadius: '4px' }} />
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Quick Actions */}
          <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Швидкі дії</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }} className="md:grid-cols-4">
              {[
                { label: 'Тікети підтримки', href: '/support',              icon: MessageSquare },
                { label: 'Каталог',           href: '/catalog',              icon: Package },
                { label: 'API: Юзери',        href: '/api/v1/admin/users',   icon: Users,     external: true },
                { label: 'API: Статистика',   href: '/api/v1/admin/stats',   icon: TrendingUp, external: true },
              ].map((item, i) => (
                <a key={item.label} href={item.href} target={item.external ? '_blank' : undefined} rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 18px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none', fontSize: '13px', color: '#555', cursor: 'pointer', transition: 'color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#555'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}>
                  <item.icon style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                  {item.label}
                  {item.external && <span style={{ marginLeft: 'auto', color: '#333', fontSize: '11px' }}>↗</span>}
                </a>
              ))}
            </div>
          </div>

          {/* Expiring proxies */}
          <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock style={{ width: '12px', height: '12px', color: '#F59E0B' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Закінчуються незабаром</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                {[3, 7, 14].map(d => (
                  <button key={d} onClick={() => setExpiringDays(d)}
                    style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, color: expiringDays === d ? '#FFFFFF' : '#444', background: expiringDays === d ? 'rgba(245,158,11,0.15)' : 'transparent', transition: 'all 0.15s' }}>
                    {d}д
                  </button>
                ))}
                {loadingExpiring && <Loader2 style={{ width: '11px', height: '11px', color: '#444' }} className="animate-spin" />}
              </div>
            </div>
            {expiring.length === 0 && !loadingExpiring ? (
              <p style={{ fontSize: '12px', color: '#333', padding: '16px 18px' }}>Немає проксі що закінчуються за {expiringDays} днів</p>
            ) : (
              <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {expiring.map((p, i) => {
                  const daysLeft = Math.ceil((new Date(p.expiresAt).getTime() - Date.now()) / 86400000)
                  const user = p.userId as { username: string; email: string } | null
                  return (
                    <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 500, color: '#FFFFFF' }}>{user?.username ?? '—'} · <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#555' }}>{p.host}:{p.port}</span></p>
                        <p style={{ fontSize: '11px', color: '#444' }}>{p.protocol.toUpperCase()} · {user?.email}</p>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: daysLeft <= 2 ? '#EF4444' : '#F59E0B', background: daysLeft <= 2 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', padding: '3px 8px', borderRadius: '5px' }}>
                        {daysLeft}д
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── ANALYTICS ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-5">
          {/* Period selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#444', marginRight: '4px' }}>Період:</span>
            {[7, 14, 30, 90].map(d => (
              <button key={d} onClick={() => setAnalyticsDays(d)}
                style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, color: analyticsDays === d ? '#FFFFFF' : '#555', background: analyticsDays === d ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', transition: 'all 0.15s' }}>
                {d}д
              </button>
            ))}
            {loadingAnalytics && <Loader2 style={{ width: '13px', height: '13px', color: '#444', marginLeft: '8px' }} className="animate-spin" />}
          </div>

          {analytics && (
            <>
              {/* Revenue chart */}
              <div style={{ background: '#0A0A0A', borderRadius: '14px', padding: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', marginBottom: '4px' }}>Дохід (USD)</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '28px', color: '#FFFFFF', letterSpacing: '-0.03em', marginBottom: '16px' }}>
                  ${analytics.revenue.reduce((s, r) => s + r.amount, 0).toFixed(2)}
                </p>
                <BarChart data={analytics.revenue.map(r => ({ label: r.date.slice(5), value: r.amount }))} color="#22C55E" />
              </div>

              {/* Registrations chart */}
              <div style={{ background: '#0A0A0A', borderRadius: '14px', padding: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', marginBottom: '4px' }}>Нові реєстрації</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '28px', color: '#FFFFFF', letterSpacing: '-0.03em', marginBottom: '16px' }}>
                  {analytics.registrations.reduce((s, r) => s + r.count, 0)}
                </p>
                <BarChart data={analytics.registrations.map(r => ({ label: r.date.slice(5), value: r.count }))} color="#3B82F6" />
              </div>

              {/* Top spenders */}
              <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Топ юзери по витратах</span>
                </div>
                {analytics.topSpenders.map((u, i) => (
                  <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#333', width: '18px' }}>#{i + 1}</span>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>{u.username ?? '—'}</p>
                        <p style={{ fontSize: '11px', color: '#444' }}>{u.email} · {u.count} замовлень</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#22C55E', fontFamily: 'JetBrains Mono, monospace' }}>${u.total.toFixed(2)}</span>
                  </div>
                ))}
                {analytics.topSpenders.length === 0 && (
                  <p style={{ fontSize: '12px', color: '#333', padding: '20px 18px' }}>Немає даних</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── USERS ── */}
      {activeTab === 'users' && (
        <div style={{ display: 'grid', gap: '12px' }} className="lg:grid-cols-[1fr_340px]">
          <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search style={{ width: '13px', height: '13px', color: '#444', flexShrink: 0 }} />
              <input value={search} onChange={e => handleSearch(e.target.value)}
                placeholder="Email або нікнейм..."
                style={{ ...INPUT, flex: 1, height: '30px', padding: '0 8px', fontSize: '13px' }}
              />
              {loadingUsers && <Loader2 style={{ width: '13px', height: '13px', color: '#444' }} className="animate-spin" />}
              <span style={{ fontSize: '11px', color: '#444', flexShrink: 0 }}>{users.length} юзерів</span>
              <button onClick={exportCSV} title="Експорт CSV"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '28px', padding: '0 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: '#555', flexShrink: 0, transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFF' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#555' }}>
                CSV↓
              </button>
            </div>
            {/* Bulk actions bar */}
            {selectedIds.size > 0 && (
              <div style={{ padding: '8px 14px', background: 'rgba(59,130,246,0.08)', borderBottom: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#3B82F6' }}>{selectedIds.size} вибрано</span>
                <button onClick={() => setSelectedIds(new Set())} style={{ fontSize: '11px', color: '#444' }}>скасувати</button>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                  <button onClick={() => setBulkAction('notify')}
                    style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, background: 'rgba(255,255,255,0.07)', color: '#FFFFFF' }}>
                    Сповістити всіх
                  </button>
                  <button onClick={() => { setBulkAction('ban'); runBulkAction() }} disabled={bulkLoading}
                    style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                    {bulkLoading ? '...' : 'Заблокувати всіх'}
                  </button>
                </div>
              </div>
            )}
            {/* Bulk notify form */}
            {bulkAction === 'notify' && (
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <input value={bulkTitle} onChange={e => setBulkTitle(e.target.value)} placeholder="Заголовок"
                  style={{ ...INPUT, flex: 1, minWidth: '120px', height: '32px', padding: '0 10px', fontSize: '12px' }} />
                <input value={bulkBody} onChange={e => setBulkBody(e.target.value)} placeholder="Текст"
                  style={{ ...INPUT, flex: 2, minWidth: '160px', height: '32px', padding: '0 10px', fontSize: '12px' }} />
                <button disabled={bulkLoading || !bulkTitle || !bulkBody} onClick={runBulkAction}
                  style={{ height: '32px', padding: '0 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, background: '#FFFFFF', color: '#000', opacity: (!bulkTitle || !bulkBody) ? 0.4 : 1 }}>
                  {bulkLoading ? '...' : 'Надіслати'}
                </button>
                <button onClick={() => setBulkAction(null)} style={{ height: '32px', padding: '0 10px', borderRadius: '7px', fontSize: '12px', color: '#555', background: 'rgba(255,255,255,0.04)' }}>✕</button>
              </div>
            )}
            <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
              {users.length === 0 && !loadingUsers ? (
                <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                  <Users style={{ width: '20px', height: '20px', color: '#1A1A1A', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '13px', color: '#444' }}>Нічого не знайдено</p>
                </div>
              ) : users.map((u, i) => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: selected?._id === u._id ? 'rgba(255,255,255,0.04)' : selectedIds.has(u._id) ? 'rgba(59,130,246,0.06)' : 'transparent', transition: 'background 0.15s' }}>
                  <div onClick={e => { e.stopPropagation(); toggleSelect(u._id) }} style={{ padding: '11px 4px 11px 14px', cursor: 'pointer' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '3px', border: `1px solid ${selectedIds.has(u._id) ? '#3B82F6' : 'rgba(255,255,255,0.15)'}`, background: selectedIds.has(u._id) ? '#3B82F6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selectedIds.has(u._id) && <Check style={{ width: '9px', height: '9px', color: '#FFF' }} />}
                    </div>
                  </div>
                <button onClick={() => { setSelected(u); setShowRefund(false); setConfirmBan(false) }}
                  style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: 'transparent', transition: 'background 0.15s' }}
                  onMouseEnter={e => { if (selected?._id !== u._id) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: u.isBanned ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: u.isBanned ? '#EF4444' : '#CCCCCC', flexShrink: 0 }}>
                      {u.username?.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: u.isBanned ? '#EF4444' : '#FFFFFF', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {u.username}
                        {u.isBanned && <ShieldOff style={{ width: '10px', height: '10px' }} />}
                        {u.role === 'admin' && <span style={{ fontSize: '8px', background: 'rgba(239,68,68,0.12)', color: '#EF4444', padding: '1px 4px', borderRadius: '3px' }}>ADM</span>}
                        {u.oauthProviders?.map(p => <span key={p} style={{ fontSize: '8px', background: 'rgba(255,255,255,0.06)', color: '#888', padding: '1px 4px', borderRadius: '3px' }}>{p}</span>)}
                      </p>
                      <p style={{ fontSize: '11px', color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '11.5px', fontFamily: 'JetBrains Mono, monospace', color: '#CCCCCC' }}>${(u.balance ?? 0).toFixed(2)}</p>
                      <p style={{ fontSize: '10px', color: '#444' }}>{u.activeProxies} проксі</p>
                    </div>
                    <ChevronRight style={{ width: '12px', height: '12px', color: '#333' }} />
                  </div>
                </button>
                </div>
              ))}
            </div>
          </div>

          {selected ? (
            <div style={{ background: '#0A0A0A', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>{selected.username}</p>
                  <p style={{ fontSize: '11px', color: '#444', marginTop: '2px' }}>{selected.email}</p>
                  <p style={{ fontSize: '10px', color: '#333', marginTop: '3px', fontFamily: 'JetBrains Mono, monospace' }}>з {fmtDate(selected.createdAt)}</p>
                </div>
                <button onClick={() => { setSelected(null); setConfirmBan(false) }} style={{ color: '#444' }}>
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { label: 'Баланс', value: `$${(selected.balance ?? 0).toFixed(2)}` },
                  { label: 'Проксі', value: String(selected.activeProxies) },
                  { label: 'Статус', value: selected.isBanned ? 'Banned' : 'Active' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '9px 10px' }}>
                    <p style={{ fontSize: '9.5px', color: '#444', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: s.label === 'Статус' && selected.isBanned ? '#EF4444' : '#FFFFFF' }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

              <div style={{ display: 'flex', gap: '6px' }}>
                <button disabled={!!actionLoading || selected.activeProxies === 0} onClick={() => userAction(selected._id, 'deactivate_proxies')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', height: '36px', borderRadius: '8px', background: 'rgba(239,68,68,0.07)', color: '#EF4444', fontSize: '12px', fontWeight: 600, opacity: (!!actionLoading || selected.activeProxies === 0) ? 0.4 : 1 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.13)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.07)' }}>
                  {actionLoading === 'deactivate_proxies' ? <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" /> : <PowerOff style={{ width: '12px', height: '12px' }} />}
                  Вимкнути
                </button>
                <button disabled={!!actionLoading} onClick={() => userAction(selected._id, 'reactivate_proxies')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', height: '36px', borderRadius: '8px', background: 'rgba(34,197,94,0.07)', color: '#22C55E', fontSize: '12px', fontWeight: 600, opacity: !!actionLoading ? 0.4 : 1 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,197,94,0.13)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,197,94,0.07)' }}>
                  {actionLoading === 'reactivate_proxies' ? <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" /> : <Power style={{ width: '12px', height: '12px' }} />}
                  Активувати
                </button>
              </div>

              {!showRefund ? (
                <button onClick={() => setShowRefund(true)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#888', fontSize: '12.5px', fontWeight: 600, transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = '#888' }}>
                  <Wallet style={{ width: '12px', height: '12px' }} /> Повернути баланс
                </button>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px' }}>
                  <p style={{ fontSize: '11.5px', color: '#888', marginBottom: '8px' }}>Сума повернення (USD)</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', marginBottom: '8px' }}>
                    {['5', '10', '25', '50'].map(a => (
                      <button key={a} onClick={() => setRefundAmount(a)}
                        style={{ height: '32px', borderRadius: '7px', fontSize: '13px', fontWeight: 600, color: refundAmount === a ? '#FFFFFF' : '#555', background: refundAmount === a ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', transition: 'all 0.15s' }}>
                        ${a}
                      </button>
                    ))}
                  </div>
                  <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)}
                    style={{ ...INPUT, width: '100%', height: '34px', padding: '0 10px', marginBottom: '8px', fontSize: '13px' }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setShowRefund(false)} style={{ flex: 1, height: '34px', borderRadius: '7px', background: 'rgba(255,255,255,0.04)', color: '#555', fontSize: '12.5px' }}>Скасувати</button>
                    <button disabled={!!actionLoading} onClick={() => userAction(selected._id, 'refund', { amount: parseFloat(refundAmount) })}
                      style={{ flex: 2, height: '34px', borderRadius: '7px', background: '#FFFFFF', color: '#000', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', opacity: !!actionLoading ? 0.6 : 1 }}>
                      {actionLoading === 'refund' ? <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" /> : null}
                      Повернути ${refundAmount}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

              {selected.isBanned ? (
                <button disabled={!!actionLoading} onClick={() => userAction(selected._id, 'unban')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '36px', borderRadius: '8px', background: 'rgba(34,197,94,0.07)', color: '#22C55E', fontSize: '12.5px', fontWeight: 600, opacity: !!actionLoading ? 0.5 : 1 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,197,94,0.13)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,197,94,0.07)' }}>
                  {actionLoading === 'unban' ? <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" /> : <Power style={{ width: '12px', height: '12px' }} />}
                  Розблокувати акаунт
                </button>
              ) : !confirmBan ? (
                <button disabled={!!actionLoading || selected.role === 'admin'} onClick={() => setConfirmBan(true)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '36px', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', color: '#EF4444', fontSize: '12.5px', fontWeight: 600, opacity: (!!actionLoading || selected.role === 'admin') ? 0.35 : 1 }}
                  onMouseEnter={e => { if (!actionLoading && selected.role !== 'admin') (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)' }}>
                  <Ban style={{ width: '12px', height: '12px' }} />
                  {selected.role === 'admin' ? 'Не можна банити адміна' : 'Заблокувати акаунт'}
                </button>
              ) : (
                <div style={{ background: 'rgba(239,68,68,0.06)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <AlertTriangle style={{ width: '13px', height: '13px', color: '#EF4444' }} />
                    <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#EF4444' }}>Підтвердити блокування?</p>
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#888', marginBottom: '10px' }}>Акаунт {selected.username} буде заблоковано.</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setConfirmBan(false)} style={{ flex: 1, height: '32px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', color: '#555', fontSize: '12.5px' }}>Скасувати</button>
                    <button disabled={!!actionLoading} onClick={() => userAction(selected._id, 'ban')}
                      style={{ flex: 1, height: '32px', borderRadius: '7px', background: '#EF4444', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', opacity: !!actionLoading ? 0.6 : 1 }}>
                      {actionLoading === 'ban' ? <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" /> : null}
                      Заблокувати
                    </button>
                  </div>
                </div>
              )}

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

              {/* Extra actions — row 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[
                  { label: 'Тікети',     icon: MessageSquare, fn: () => openTickets(selected._id) },
                  { label: 'Таймлайн',   icon: Activity,      fn: () => openTimeline(selected._id) },
                  { label: 'Нотатки',    icon: Pencil,        fn: () => openNotes(selected._id) },
                  { label: 'Повідомити', icon: Bell,          fn: () => { setNotifyUserModal(true); setNotifyTitle(''); setNotifyBody('') } },
                  { label: 'Додати проксі', icon: MapPin,     fn: () => { setAddProxyModal(true); setSelectedCountry(null); setCountrySearch('') } },
                  { label: selected.role === 'admin' ? 'Зняти адміна' : 'Зробити адміном', icon: ShieldOff, fn: () => changeRole(selected.role === 'admin' ? 'user' : 'admin') },
                ].map(({ label, icon: Icon, fn }) => (
                  <button key={label} onClick={fn}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', height: '34px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#777', fontSize: '11.5px', fontWeight: 600, transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = '#777' }}>
                    <Icon style={{ width: '11px', height: '11px' }} /> {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background: '#0A0A0A', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
              <div style={{ textAlign: 'center' }}>
                <Users style={{ width: '20px', height: '20px', color: '#1A1A1A', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px', color: '#444' }}>Оберіть користувача</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px' }}>
                <Package style={{ width: '13px', height: '13px', color: '#444', flexShrink: 0 }} />
                <input value={prodSearch} onChange={e => setProdSearch(e.target.value)}
                  placeholder="Пошук продукту..."
                  style={{ ...INPUT, flex: 1, height: '30px', padding: '0 8px', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', padding: '2px', borderRadius: '7px' }}>
                {(['all', 'active', 'inactive'] as const).map(f => (
                  <button key={f} onClick={() => setProdFilter(f)}
                    style={{ padding: '4px 10px', borderRadius: '5px', fontSize: '11.5px', fontWeight: 500, color: prodFilter === f ? '#FFFFFF' : '#555', background: prodFilter === f ? 'rgba(255,255,255,0.09)' : 'transparent', transition: 'all 0.15s' }}>
                    {f === 'all' ? `Всі (${products.length})` : f === 'active' ? `Активні (${activeCount})` : `Вимкнені (${inactiveCount})`}
                  </button>
                ))}
              </div>
              {loadingProds && <Loader2 style={{ width: '13px', height: '13px', color: '#444' }} className="animate-spin" />}
              <button onClick={openCreate}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '30px', padding: '0 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, background: '#FFFFFF', color: '#000', flexShrink: 0 }}>
                <Plus style={{ width: '12px', height: '12px' }} /> Додати
              </button>
            </div>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {filteredProducts.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <Package style={{ width: '24px', height: '24px', color: '#222', margin: '0 auto 10px' }} />
                  <p style={{ fontSize: '13px', color: '#444' }}>Продукти не знайдено</p>
                  <button onClick={openCreate} style={{ marginTop: '12px', fontSize: '12px', color: '#888', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Створити перший</button>
                </div>
              ) : filteredProducts.map((p, i) => (
                <div key={p._id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', opacity: p.isActive ? 1 : 0.45, gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/flags/${p.countryCode.toLowerCase()}.png`} alt="" style={{ width: '20px', height: '14px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} onError={e => { e.currentTarget.style.display = 'none' }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>{p.name}</p>
                        {p.isFeatured && <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '1px 5px', borderRadius: '3px' }}>Featured</span>}
                      </div>
                      <p style={{ fontSize: '10.5px', color: '#444', marginTop: '2px' }}>
                        {p.type} · {p.countryName}{p.city ? ` · ${p.city}` : ''} · {p.plans?.length ?? 0} планів
                        {p.plans?.[0] && <span style={{ color: '#555' }}> · від ${p.plans[0].priceUsdt}</span>}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <button onClick={() => openEdit(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '28px', padding: '0 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 500, background: 'rgba(255,255,255,0.05)', color: '#AAAAAA', transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = '#AAAAAA' }}>
                      <Pencil style={{ width: '11px', height: '11px' }} /> Редагувати
                    </button>
                    <button disabled={togglingProd === p._id} onClick={() => toggleProduct(p._id, !p.isActive)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '28px', padding: '0 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 500, background: p.isActive ? 'rgba(239,68,68,0.07)' : 'rgba(34,197,94,0.07)', color: p.isActive ? '#EF4444' : '#22C55E', transition: 'all 0.15s' }}>
                      {togglingProd === p._id ? <Loader2 style={{ width: '11px', height: '11px' }} className="animate-spin" /> : p.isActive ? <EyeOff style={{ width: '11px', height: '11px' }} /> : <Eye style={{ width: '11px', height: '11px' }} />}
                      {p.isActive ? 'Вимкнути' : 'Увімкнути'}
                    </button>
                    <button disabled={deletingProd === p._id} onClick={() => deleteProduct(p._id)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(239,68,68,0.06)', color: '#EF4444', transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)' }}>
                      {deletingProd === p._id ? <Loader2 style={{ width: '11px', height: '11px' }} className="animate-spin" /> : <Trash2 style={{ width: '11px', height: '11px' }} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ORDERS ── */}
      {activeTab === 'orders' && (
        <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', padding: '2px', borderRadius: '7px', flexWrap: 'wrap' }}>
              {ORDER_STATUSES.map(s => (
                <button key={s} onClick={() => { setOrderStatus(s); setOrderPage(1); loadOrders(1, s) }}
                  style={{ padding: '4px 10px', borderRadius: '5px', fontSize: '11.5px', fontWeight: 500, color: orderStatus === s ? '#FFFFFF' : '#555', background: orderStatus === s ? 'rgba(255,255,255,0.09)' : 'transparent', transition: 'all 0.15s' }}>
                  {s === '' ? 'Всі' : s}
                </button>
              ))}
            </div>
            <span style={{ fontSize: '11px', color: '#444', marginLeft: 'auto' }}>{orderTotal} замовлень</span>
            {loadingOrders && <Loader2 style={{ width: '13px', height: '13px', color: '#444' }} className="animate-spin" />}
          </div>

          {/* Orders list */}
          <div>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 100px 80px', gap: '12px', padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Користувач', 'Статус', 'Метод', 'Сума', 'Дата'].map(h => (
                <span key={h} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>{h}</span>
              ))}
            </div>
            {orders.length === 0 && !loadingOrders ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <ShoppingCart style={{ width: '24px', height: '24px', color: '#222', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '13px', color: '#444' }}>Замовлень не знайдено</p>
              </div>
            ) : orders.map((o, i) => {
              const user = o.userId as { username: string; email: string } | null
              return (
                <div key={o._id}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 100px 80px', gap: '12px', padding: '12px 14px', alignItems: 'center', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username ?? '—'}</p>
                    <p style={{ fontSize: '11px', color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email ?? o._id.slice(-8)}</p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: STATUS_COLORS[o.status] ?? '#888', background: `${STATUS_COLORS[o.status] ?? '#888'}18`, padding: '3px 8px', borderRadius: '5px', width: 'fit-content' }}>{o.status}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CreditCard style={{ width: '11px', height: '11px', color: '#444' }} />
                    <span style={{ fontSize: '11px', color: '#888' }}>{o.paymentMethod ?? '—'}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>${parseFloat(String(o.totalUsdt)).toFixed(2)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock style={{ width: '10px', height: '10px', color: '#333' }} />
                    <span style={{ fontSize: '11px', color: '#444', fontFamily: 'JetBrains Mono, monospace' }}>{timeAgo(o.createdAt)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {orderPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button disabled={orderPage <= 1} onClick={() => { const p = orderPage - 1; setOrderPage(p); loadOrders(p, orderStatus) }}
                style={{ height: '30px', padding: '0 12px', borderRadius: '7px', fontSize: '12px', background: 'rgba(255,255,255,0.06)', color: orderPage <= 1 ? '#333' : '#888', transition: 'all 0.15s' }}>← Назад</button>
              <span style={{ fontSize: '12px', color: '#444', fontFamily: 'JetBrains Mono, monospace' }}>{orderPage} / {orderPages}</span>
              <button disabled={orderPage >= orderPages} onClick={() => { const p = orderPage + 1; setOrderPage(p); loadOrders(p, orderStatus) }}
                style={{ height: '30px', padding: '0 12px', borderRadius: '7px', fontSize: '12px', background: 'rgba(255,255,255,0.06)', color: orderPage >= orderPages ? '#333' : '#888', transition: 'all 0.15s' }}>Далі →</button>
            </div>
          )}
        </div>
      )}

      {/* ── PRODUCT MODAL ── */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: '4px' }}>Адмін</p>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '22px', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  {editingId ? 'Редагувати продукт' : 'Новий продукт'}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            <div className="space-y-5">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Назва</label>
                  <input value={form.name} onChange={e => setFormField('name', e.target.value)} placeholder="US Residential Elite"
                    style={{ ...INPUT, width: '100%', height: '40px', padding: '0 12px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Тип</label>
                  <select value={form.type} onChange={e => setFormField('type', e.target.value as AdminProduct['type'])}
                    style={{ ...INPUT, width: '100%', height: '40px', padding: '0 12px', boxSizing: 'border-box', appearance: 'none' }}>
                    {PROXY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Код країни</label>
                  <input value={form.countryCode} onChange={e => setFormField('countryCode', e.target.value.toUpperCase().slice(0, 2))} placeholder="US" maxLength={2}
                    style={{ ...INPUT, width: '100%', height: '40px', padding: '0 12px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Назва країни</label>
                  <input value={form.countryName} onChange={e => setFormField('countryName', e.target.value)} placeholder="United States"
                    style={{ ...INPUT, width: '100%', height: '40px', padding: '0 12px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Місто</label>
                  <input value={form.city ?? ''} onChange={e => setFormField('city', e.target.value)} placeholder="New York"
                    style={{ ...INPUT, width: '100%', height: '40px', padding: '0 12px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>ISP</label>
                  <input value={form.ispName ?? ''} onChange={e => setFormField('ispName', e.target.value)} placeholder="Verizon"
                    style={{ ...INPUT, width: '100%', height: '40px', padding: '0 12px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Швидкість (Mbps)</label>
                  <input type="number" value={form.speedMbps ?? ''} onChange={e => setFormField('speedMbps', parseFloat(e.target.value))} placeholder="100"
                    style={{ ...INPUT, width: '100%', height: '40px', padding: '0 12px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Uptime (%)</label>
                  <input type="number" value={form.uptimePercent ?? ''} onChange={e => setFormField('uptimePercent', parseFloat(e.target.value))} placeholder="99.9" min={0} max={100}
                    style={{ ...INPUT, width: '100%', height: '40px', padding: '0 12px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Опис</label>
                <textarea value={form.description ?? ''} onChange={e => setFormField('description', e.target.value)} placeholder="Короткий опис..." rows={2}
                  style={{ ...INPUT, width: '100%', padding: '10px 12px', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.5 }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Протоколи</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {PROTOCOLS.map(pr => {
                    const active = form.protocols.includes(pr)
                    return (
                      <button key={pr} onClick={() => setFormField('protocols', active ? form.protocols.filter(p => p !== pr) : [...form.protocols, pr])}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '32px', padding: '0 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, background: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', color: active ? '#FFFFFF' : '#555', border: active ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent', transition: 'all 0.15s' }}>
                        {active && <Check style={{ width: '10px', height: '10px' }} />}
                        {pr.toUpperCase()}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {([['isActive', 'Активний'], ['isFeatured', 'Featured']] as const).map(([k, label]) => (
                  <button key={k} onClick={() => setFormField(k, !form[k])}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, background: form[k] ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)', color: form[k] ? '#22C55E' : '#555', border: form[k] ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent', transition: 'all 0.15s' }}>
                    {form[k] && <Check style={{ width: '10px', height: '10px' }} />}
                    {label}
                  </button>
                ))}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', color: '#555', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Плани ({form.plans.length})</label>
                  <button onClick={addPlan} style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '26px', padding: '0 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: '#AAAAAA' }}>
                    <Plus style={{ width: '11px', height: '11px' }} /> Додати план
                  </button>
                </div>
                <div className="space-y-2">
                  {form.plans.map((plan, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 70px 80px 70px auto 28px', gap: '8px', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '9px', border: plan.isPopular ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent' }}>
                      <select value={plan.duration} onChange={e => setPlan(i, 'duration', e.target.value)} style={{ ...INPUT, height: '32px', padding: '0 8px', fontSize: '12px', appearance: 'none' }}>
                        {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <input type="number" value={plan.ipCount} onChange={e => setPlan(i, 'ipCount', parseInt(e.target.value))} placeholder="IP" min={1} style={{ ...INPUT, height: '32px', padding: '0 8px', fontSize: '12px' }} />
                      <input type="number" value={plan.priceUsdt} onChange={e => setPlan(i, 'priceUsdt', parseFloat(e.target.value))} placeholder="$" min={0} step={0.01} style={{ ...INPUT, height: '32px', padding: '0 8px', fontSize: '12px' }} />
                      <input type="number" value={plan.discount} onChange={e => setPlan(i, 'discount', parseInt(e.target.value))} placeholder="%" min={0} max={100} style={{ ...INPUT, height: '32px', padding: '0 8px', fontSize: '12px' }} />
                      <button onClick={() => setPlan(i, 'isPopular', !plan.isPopular)} style={{ height: '32px', padding: '0 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: plan.isPopular ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)', color: plan.isPopular ? '#F59E0B' : '#555', whiteSpace: 'nowrap', border: plan.isPopular ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent' }}>
                        {plan.isPopular ? '★ Popular' : 'Popular'}
                      </button>
                      <button onClick={() => removePlan(i)} disabled={form.plans.length <= 1} style={{ width: '28px', height: '32px', borderRadius: '6px', background: 'rgba(239,68,68,0.07)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: form.plans.length <= 1 ? 0.3 : 1 }}>
                        <Trash2 style={{ width: '11px', height: '11px' }} />
                      </button>
                    </div>
                  ))}
                  <p style={{ fontSize: '10px', color: '#333', marginTop: '4px' }}>Тривалість · IP · Ціна USDT · Знижка % · Popular</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => setModalOpen(false)} style={{ flex: 1, height: '42px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', color: '#555', fontSize: '13.5px', fontWeight: 600 }}>Скасувати</button>
                <button onClick={saveProduct} disabled={savingProd || !form.name || form.protocols.length === 0}
                  style={{ flex: 2, height: '42px', borderRadius: '10px', background: '#FFFFFF', color: '#000', fontSize: '13.5px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: savingProd || !form.name ? 0.6 : 1 }}>
                  {savingProd ? <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" /> : null}
                  {editingId ? 'Зберегти зміни' : 'Створити продукт'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSACTIONS ── */}
      {activeTab === 'transactions' && (
        <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', padding: '2px', borderRadius: '7px' }}>
              {(['', 'deposit', 'purchase', 'refund', 'referral_bonus'] as const).map(tp => (
                <button key={tp} onClick={() => { setTxTypeFilter(tp); setTxPage(1); loadTx(1, tp) }}
                  style={{ padding: '4px 10px', borderRadius: '5px', fontSize: '11.5px', fontWeight: 500, color: txTypeFilter === tp ? '#FFFFFF' : '#555', background: txTypeFilter === tp ? 'rgba(255,255,255,0.09)' : 'transparent', transition: 'all 0.15s' }}>
                  {tp === '' ? 'Всі' : TX_TYPE_LABELS[tp]}
                </button>
              ))}
            </div>
            <span style={{ fontSize: '11px', color: '#444', marginLeft: 'auto' }}>{txTotal} транзакцій</span>
            {loadingTx && <Loader2 style={{ width: '13px', height: '13px', color: '#444' }} className="animate-spin" />}
          </div>

          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 90px 90px 90px', gap: '12px', padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Користувач', 'Тип', 'Сума', 'Статус', 'Дата'].map(h => (
              <span key={h} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>{h}</span>
            ))}
          </div>

          {txList.length === 0 && !loadingTx ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <DollarSign style={{ width: '24px', height: '24px', color: '#222', margin: '0 auto 10px' }} />
              <p style={{ fontSize: '13px', color: '#444' }}>Транзакцій не знайдено</p>
            </div>
          ) : txList.map((tx, i) => {
            const user = tx.userId as { username: string; email: string } | null
            const typeColor = TX_TYPE_COLORS[tx.type] ?? '#888'
            const isDeposit = tx.type === 'deposit' || tx.type === 'referral_bonus'
            return (
              <div key={tx._id}
                style={{ display: 'grid', gridTemplateColumns: '1fr 110px 90px 90px 90px', gap: '12px', padding: '11px 14px', alignItems: 'center', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username ?? '—'}</p>
                  <p style={{ fontSize: '11px', color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description ?? user?.email ?? ''}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {isDeposit
                    ? <ArrowDownLeft style={{ width: '11px', height: '11px', color: typeColor, flexShrink: 0 }} />
                    : <ArrowUpRight style={{ width: '11px', height: '11px', color: typeColor, flexShrink: 0 }} />
                  }
                  <span style={{ fontSize: '11px', fontWeight: 600, color: typeColor }}>{TX_TYPE_LABELS[tx.type] ?? tx.type}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: isDeposit ? '#22C55E' : '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>
                  {isDeposit ? '+' : '−'}${parseFloat(String(tx.amountUsdt)).toFixed(2)}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: tx.status === 'confirmed' ? '#22C55E' : tx.status === 'failed' ? '#EF4444' : '#F59E0B', background: tx.status === 'confirmed' ? 'rgba(34,197,94,0.08)' : tx.status === 'failed' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', padding: '2px 7px', borderRadius: '4px', width: 'fit-content' }}>
                  {tx.status}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock style={{ width: '10px', height: '10px', color: '#333' }} />
                  <span style={{ fontSize: '10px', color: '#444', fontFamily: 'JetBrains Mono, monospace' }}>{timeAgo(tx.createdAt)}</span>
                </div>
              </div>
            )
          })}

          {/* Pagination */}
          {txPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button disabled={txPage <= 1} onClick={() => { const p = txPage - 1; setTxPage(p); loadTx(p, txTypeFilter) }}
                style={{ height: '30px', padding: '0 12px', borderRadius: '7px', fontSize: '12px', background: 'rgba(255,255,255,0.06)', color: txPage <= 1 ? '#333' : '#888' }}>← Назад</button>
              <span style={{ fontSize: '12px', color: '#444', fontFamily: 'JetBrains Mono, monospace' }}>{txPage} / {txPages}</span>
              <button disabled={txPage >= txPages} onClick={() => { const p = txPage + 1; setTxPage(p); loadTx(p, txTypeFilter) }}
                style={{ height: '30px', padding: '0 12px', borderRadius: '7px', fontSize: '12px', background: 'rgba(255,255,255,0.06)', color: txPage >= txPages ? '#333' : '#888' }}>Далі →</button>
            </div>
          )}
        </div>
      )}

      {/* ── SUPPORT TICKETS ── */}
      {activeTab === 'support' && (
        <div style={{ display: 'grid', gap: '12px' }} className="lg:grid-cols-[340px_1fr]">

          {/* Ticket list */}
          <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Filters */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', padding: '2px', borderRadius: '7px', flex: 1 }}>
                {(['', 'open', 'pending_human', 'ai_resolved', 'closed'] as const).map(s => (
                  <button key={s} onClick={() => { setSupportStatusFilter(s); setSupportPage(1); loadSupport(1, s) }}
                    style={{ flex: 1, padding: '4px 6px', borderRadius: '5px', fontSize: '10.5px', fontWeight: 500, color: supportStatusFilter === s ? '#FFFFFF' : '#444', background: supportStatusFilter === s ? 'rgba(255,255,255,0.09)' : 'transparent', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                    {s === '' ? 'Всі' : s === 'pending_human' ? '⚠ Чекає' : s === 'open' ? 'Відкр' : s === 'ai_resolved' ? 'AI' : 'Закр'}
                  </button>
                ))}
              </div>
              {loadingSupport && <Loader2 style={{ width: '11px', height: '11px', color: '#444' }} className="animate-spin" />}
            </div>
            <div style={{ fontSize: '10px', color: '#333', padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{supportTotal} тікетів</div>

            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '600px' }}>
              {supportTickets.length === 0 && !loadingSupport ? (
                <p style={{ fontSize: '13px', color: '#333', padding: '32px', textAlign: 'center' }}>Тікетів немає</p>
              ) : supportTickets.map((tk, i) => {
                const user = tk.userId as { username: string; email: string } | null
                const statusColor: Record<string, string> = { open: '#22C55E', pending_human: '#F59E0B', ai_resolved: '#888', closed: '#444' }
                const lastMsg = tk.messages[tk.messages.length - 1]
                const isOpen = openedTicket === tk._id
                return (
                  <button key={tk._id} onClick={() => setOpenedTicket(isOpen ? null : tk._id)}
                    style={{ width: '100%', textAlign: 'left', padding: '12px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent', borderLeft: `2px solid ${isOpen ? '#FFFFFF' : 'transparent'}`, transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>{user?.username ?? '—'}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: statusColor[tk.status] ?? '#888', background: `${statusColor[tk.status] ?? '#888'}18`, padding: '2px 6px', borderRadius: '3px' }}>{tk.status}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#555', marginBottom: '3px' }}>{user?.email} · {({proxy_not_working:'Проксі не працює',slow_speed:'Повільна швидкість',wrong_geo:'Геолокація',payment_issue:'Оплата',refund_request:'Повернення',other:'Інше'} as Record<string,string>)[tk.category] ?? tk.category}</p>
                    {lastMsg && <p style={{ fontSize: '11px', color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastMsg.content.slice(0, 60)}</p>}
                    <p style={{ fontSize: '10px', color: '#333', marginTop: '3px', fontFamily: 'JetBrains Mono, monospace' }}>{timeAgo(tk.updatedAt)}</p>
                  </button>
                )
              })}
            </div>

            {supportPages > 1 && (
              <div style={{ display: 'flex', gap: '6px', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', justifyContent: 'center' }}>
                <button disabled={supportPage <= 1} onClick={() => { const p = supportPage - 1; setSupportPage(p); loadSupport(p, supportStatusFilter) }}
                  style={{ height: '28px', padding: '0 10px', borderRadius: '6px', fontSize: '11px', background: 'rgba(255,255,255,0.06)', color: supportPage <= 1 ? '#333' : '#888' }}>←</button>
                <span style={{ fontSize: '11px', color: '#444', padding: '0 6px', lineHeight: '28px' }}>{supportPage}/{supportPages}</span>
                <button disabled={supportPage >= supportPages} onClick={() => { const p = supportPage + 1; setSupportPage(p); loadSupport(p, supportStatusFilter) }}
                  style={{ height: '28px', padding: '0 10px', borderRadius: '6px', fontSize: '11px', background: 'rgba(255,255,255,0.06)', color: supportPage >= supportPages ? '#333' : '#888' }}>→</button>
              </div>
            )}
          </div>

          {/* Ticket chat view */}
          <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {!openedTicket ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <div style={{ textAlign: 'center' }}>
                  <MessageSquare style={{ width: '24px', height: '24px', color: '#1A1A1A', margin: '0 auto 10px' }} />
                  <p style={{ fontSize: '13px', color: '#444' }}>Оберіть тікет зліва</p>
                </div>
              </div>
            ) : (() => {
              const tk = supportTickets.find(t => t._id === openedTicket)
              if (!tk) return null
              const user = tk.userId as { username: string; email: string } | null
              const statusColor: Record<string, string> = { open: '#22C55E', pending_human: '#F59E0B', ai_resolved: '#888', closed: '#444' }
              return (
                <>
                  {/* Header */}
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{user?.username} · {user?.email}</p>
                      <p style={{ fontSize: '11px', color: '#444' }}>({({proxy_not_working:'Проксі не працює',slow_speed:'Повільна швидкість',wrong_geo:'Геолокація',payment_issue:'Оплата',refund_request:'Повернення',other:'Інше'} as Record<string,string>)[tk.category] ?? tk.category}) · відкрито {fmtDate(tk.createdAt)}</p>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: statusColor[tk.status] ?? '#888' }}>{tk.status}</span>
                    {tk.status !== 'closed' && (
                      <button disabled={closingTicket === tk._id}
                        onClick={async () => {
                          if (!confirm('Закрити цей тікет?')) return
                          setClosingTicket(tk._id)
                          try {
                            const res = await fetch(`/api/v1/support/tickets/${tk._id}`, {
                              method: 'POST', headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'close' }),
                            })
                            const data = await res.json()
                            if (data.success) {
                              toast.success('Тікет закрито')
                              loadSupport(supportPage, supportStatusFilter)
                              loadStats()
                            } else toast.error(data.error)
                          } finally { setClosingTicket(null) }
                        }}
                        style={{ width: '30px', height: '30px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(34,197,94,0.08)', color: '#22C55E', flexShrink: 0, opacity: closingTicket === tk._id ? 0.6 : 1 }}>
                        {closingTicket === tk._id ? <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" /> : <Check style={{ width: '12px', height: '12px' }} />}
                      </button>
                    )}
                    <button disabled={deletingTicket === tk._id}
                      onClick={async () => {
                        if (!confirm('Видалити цей тікет назавжди?')) return
                        setDeletingTicket(tk._id)
                        try {
                          const res = await fetch(`/api/v1/admin/support/${tk._id}`, { method: 'DELETE' })
                          const data = await res.json()
                          if (data.success) {
                            toast.success('Тікет видалено')
                            setSupportTickets(prev => prev.filter(t => t._id !== tk._id))
                            setSupportTotal(prev => Math.max(0, prev - 1))
                            setOpenedTicket(null)
                            loadStats()
                          } else toast.error(data.error)
                        } finally { setDeletingTicket(null) }
                      }}
                      style={{ width: '30px', height: '30px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.08)', color: '#EF4444', flexShrink: 0, opacity: deletingTicket === tk._id ? 0.6 : 1 }}>
                      {deletingTicket === tk._id ? <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" /> : <Trash2 style={{ width: '12px', height: '12px' }} />}
                    </button>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '460px' }}>
                    {tk.messages.map((msg, i) => {
                      const isUser = msg.role === 'user'
                      const isAdmin = msg.role === 'admin'
                      return (
                        <div key={i} style={{ display: 'flex', gap: '8px', flexDirection: isUser ? 'row-reverse' : 'row' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: isAdmin ? '#EF4444' : isUser ? 'rgba(255,255,255,0.1)' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {isAdmin ? <ShieldOff style={{ width: '12px', height: '12px', color: '#FFF' }} /> : isUser ? <UserIcon style={{ width: '12px', height: '12px', color: '#CCC' }} /> : <Bot style={{ width: '12px', height: '12px', color: '#000' }} />}
                          </div>
                          <div style={{ maxWidth: '78%' }}>
                            <div style={{ padding: '9px 13px', borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px', background: isAdmin ? 'rgba(239,68,68,0.1)' : isUser ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)', fontSize: '13px', color: '#CCCCCC', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                              {isAdmin && <p style={{ fontSize: '9px', color: '#EF4444', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>Адмін</p>}
                              {msg.content}
                            </div>
                            {msg.createdAt && <p style={{ fontSize: '10px', color: '#333', marginTop: '3px', textAlign: isUser ? 'right' : 'left', fontFamily: 'JetBrains Mono, monospace' }}>{new Date(msg.createdAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Reply box + actions */}
                  {tk.status !== 'closed' && (() => {
                    const tkId = tk._id
                    const uid = (tk.userId as unknown as { _id: string } | null)?._id
                    async function sendReply() {
                      if (!replyText.trim()) return
                      setSendingReply(true)
                      try {
                        const res = await fetch(`/api/v1/support/tickets/${tkId}`, {
                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ message: replyText, role: 'admin' }),
                        })
                        const data = await res.json()
                        if (data.success) {
                          setReplyText(''); setTicketAction(null)
                          loadSupport(supportPage, supportStatusFilter)
                          setOpenedTicket(null); setTimeout(() => setOpenedTicket(tkId), 50)
                        } else toast.error(data.error)
                      } finally { setSendingReply(false) }
                    }
                    return (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {/* Textarea row */}
                        <div style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                          <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                            placeholder="Відповідь адміна... (Ctrl+Enter)" rows={2}
                            style={{ ...INPUT, flex: 1, padding: '8px 12px', resize: 'none', lineHeight: 1.4, fontSize: '13px' }}
                            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); sendReply() } }} />
                          <button disabled={sendingReply || !replyText.trim()} onClick={sendReply}
                            style={{ width: '40px', height: '40px', borderRadius: '9px', background: replyText.trim() ? '#FFFFFF' : 'rgba(255,255,255,0.06)', color: replyText.trim() ? '#000' : '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', transition: 'all 0.15s', opacity: sendingReply ? 0.6 : 1 }}>
                            {sendingReply ? <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" /> : <Send style={{ width: '14px', height: '14px' }} />}
                          </button>
                        </div>

                        {/* Action buttons row */}
                        <div style={{ padding: '0 16px 10px', display: 'flex', gap: '6px' }}>
                          {[
                            { label: 'Ордери', key: 'orders' as const },
                            { label: 'Повернення', key: 'refund' as const },
                            { label: 'Замінити проксі', key: 'proxy' as const },
                            { label: 'Заблокувати', key: 'ban' as const },
                          ].map(({ label, key }) => (
                            <button key={key}
                              onClick={async () => {
                                if (ticketAction === key) { setTicketAction(null); return }
                                if (key === 'orders') {
                                  setTicketAction('orders'); setLoadingTicketOrders(true); setTicketOrders([])
                                  const res = await fetch(`/api/v1/admin/orders?userId=${uid}&limit=10`)
                                  const data = await res.json()
                                  setTicketOrders(data.data?.items ?? [])
                                  setLoadingTicketOrders(false)
                                } else if (key === 'proxy') {
                                  setTicketAction('proxy'); setLoadingTicketProxies(true); setTicketProxies([])
                                  const res = await fetch(`/api/v1/admin/users/${uid}/proxies`)
                                  const data = await res.json()
                                  setTicketProxies(data.data?.items ?? [])
                                  setLoadingTicketProxies(false)
                                } else {
                                  setTicketAction(key); if (key === 'refund') setTicketRefundAmt('10')
                                }
                              }}
                              style={{ height: '28px', padding: '0 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 500, background: ticketAction === key ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)', color: ticketAction === key ? '#FFFFFF' : '#666', border: 'none', transition: 'all 0.15s', cursor: 'pointer' }}
                              onMouseEnter={e => { if (ticketAction !== key) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#CCCCCC' } }}
                              onMouseLeave={e => { if (ticketAction !== key) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = '#666' } }}>
                              {label}
                            </button>
                          ))}
                          {ticketActionLoading && <Loader2 style={{ width: '12px', height: '12px', color: '#444' }} className="animate-spin" />}
                        </div>

                        {/* Expanded action panels */}
                        {ticketAction === 'orders' && (
                          <div style={{ margin: '0 16px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#AAAAAA', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Ордери юзера</span>
                              <button onClick={() => setTicketAction(null)} style={{ color: '#333' }}><X style={{ width: '12px', height: '12px' }} /></button>
                            </div>
                            {loadingTicketOrders ? (
                              <div style={{ padding: '14px', display: 'flex', justifyContent: 'center' }}><Loader2 style={{ width: '14px', height: '14px', color: '#444' }} className="animate-spin" /></div>
                            ) : ticketOrders.length === 0 ? (
                              <p style={{ fontSize: '12px', color: '#444', padding: '14px' }}>Ордерів немає</p>
                            ) : ticketOrders.map((o, i) => (
                              <div key={o._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <div>
                                  <span style={{ fontSize: '11px', fontWeight: 600, color: STATUS_COLORS[o.status] ?? '#888', padding: '1px 6px', borderRadius: '4px', background: `${STATUS_COLORS[o.status] ?? '#888'}15` }}>{o.status}</span>
                                  <span style={{ fontSize: '11px', color: '#555', marginLeft: '8px' }}>{o.paymentMethod} · {fmtDate(o.createdAt)}</span>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>${parseFloat(String(o.totalUsdt)).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {ticketAction === 'refund' && (
                          <div style={{ margin: '0 16px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#AAAAAA', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Повернення коштів</span>
                              <button onClick={() => setTicketAction(null)} style={{ color: '#333' }}><X style={{ width: '12px', height: '12px' }} /></button>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                              {['5', '10', '25', '50'].map(a => (
                                <button key={a} onClick={() => setTicketRefundAmt(a)}
                                  style={{ height: '30px', padding: '0 12px', borderRadius: '7px', fontSize: '12.5px', fontWeight: 600, color: ticketRefundAmt === a ? '#FFFFFF' : '#555', background: ticketRefundAmt === a ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)', transition: 'all 0.15s' }}>
                                  ${a}
                                </button>
                              ))}
                              <input type="number" value={ticketRefundAmt} onChange={e => setTicketRefundAmt(e.target.value)}
                                style={{ ...INPUT, width: '60px', height: '30px', padding: '0 8px', fontSize: '12px', textAlign: 'center' }} />
                              <button disabled={ticketActionLoading}
                                onClick={async () => {
                                  if (!uid) return
                                  setTicketActionLoading(true)
                                  try {
                                    const res = await fetch(`/api/v1/admin/users/${uid}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'refund', amount: parseFloat(ticketRefundAmt) }) })
                                    const data = await res.json()
                                    if (data.success) { toast.success(`Повернено $${ticketRefundAmt}`); setTicketAction(null) }
                                    else toast.error(data.error)
                                  } finally { setTicketActionLoading(false) }
                                }}
                                style={{ height: '30px', padding: '0 16px', borderRadius: '7px', background: '#FFFFFF', color: '#000', fontSize: '12.5px', fontWeight: 700, opacity: ticketActionLoading ? 0.6 : 1 }}>
                                Повернути ${ticketRefundAmt}
                              </button>
                            </div>
                          </div>
                        )}

                        {ticketAction === 'ban' && (
                          <div style={{ margin: '0 16px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AlertTriangle style={{ width: '12px', height: '12px', color: '#888' }} />
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#AAAAAA', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Заблокувати {(tk.userId as { username: string } | null)?.username}?</span>
                              </div>
                              <button onClick={() => setTicketAction(null)} style={{ color: '#333' }}><X style={{ width: '12px', height: '12px' }} /></button>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => setTicketAction(null)} style={{ flex: 1, height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#555', fontSize: '12.5px', fontWeight: 500 }}>Скасувати</button>
                              <button disabled={ticketActionLoading}
                                onClick={async () => {
                                  if (!uid) return
                                  setTicketActionLoading(true)
                                  try {
                                    const res = await fetch(`/api/v1/admin/users/${uid}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'ban' }) })
                                    const data = await res.json()
                                    if (data.success) { toast.success('Акаунт заблоковано'); setTicketAction(null) }
                                    else toast.error(data.error)
                                  } finally { setTicketActionLoading(false) }
                                }}
                                style={{ flex: 1, height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 600, opacity: ticketActionLoading ? 0.6 : 1 }}>
                                Заблокувати
                              </button>
                            </div>
                          </div>
                        )}

                        {ticketAction === 'proxy' && (
                          <div style={{ margin: '0 16px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#AAAAAA', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Активні проксі юзера</span>
                              <button onClick={() => setTicketAction(null)} style={{ color: '#333' }}><X style={{ width: '12px', height: '12px' }} /></button>
                            </div>
                            {loadingTicketProxies ? (
                              <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}><Loader2 style={{ width: '14px', height: '14px', color: '#444' }} className="animate-spin" /></div>
                            ) : ticketProxies.length === 0 ? (
                              <p style={{ fontSize: '12px', color: '#444', padding: '14px' }}>Активних проксі немає</p>
                            ) : ticketProxies.map((p, i) => {
                              const daysLeft = Math.ceil((new Date(p.expiresAt).getTime() - Date.now()) / 86400000)
                              return (
                                <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                  <div>
                                    <p style={{ fontSize: '12.5px', fontWeight: 500, color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>{p.host}:{p.port}</p>
                                    <p style={{ fontSize: '11px', color: '#444', marginTop: '2px' }}>
                                      {p.protocol.toUpperCase()}
                                      {p.countryName && ` · ${p.countryName}`}
                                      {' · '}{daysLeft}д залишилось
                                      {' · '}замін: {p.replacedCount ?? 0}/3
                                    </p>
                                  </div>
                                  <div style={{ display: 'flex', gap: '5px' }}>
                                    <button
                                      disabled={replacingProxy === p._id || (p.replacedCount ?? 0) >= 3}
                                      onClick={async () => {
                                        setReplacingProxy(p._id)
                                        try {
                                          const res = await fetch(`/api/v1/admin/proxies/${p._id}`, { method: 'POST' })
                                          const data = await res.json()
                                          if (data.success) {
                                            toast.success(`Замінено → ${data.data.host}:${data.data.port}`)
                                            setTicketProxies(prev => prev.map(px => px._id === p._id ? { ...px, host: data.data.host, port: data.data.port, replacedCount: (px.replacedCount ?? 0) + 1 } : px))
                                          } else toast.error(data.error)
                                        } finally { setReplacingProxy(null) }
                                      }}
                                      style={{ height: '28px', padding: '0 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, background: (p.replacedCount ?? 0) >= 3 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)', color: (p.replacedCount ?? 0) >= 3 ? '#333' : '#CCCCCC', transition: 'all 0.15s', opacity: replacingProxy === p._id ? 0.6 : 1 }}
                                      onMouseEnter={e => { if ((p.replacedCount ?? 0) < 3) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)' }}
                                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = (p.replacedCount ?? 0) >= 3 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)' }}>
                                      {replacingProxy === p._id ? <Loader2 style={{ width: '11px', height: '11px' }} className="animate-spin" /> : (p.replacedCount ?? 0) >= 3 ? 'Ліміт' : 'Замінити'}
                                    </button>
                                    <button
                                      onClick={async () => {
                                        await fetch(`/api/v1/admin/proxies/${p._id}`, { method: 'DELETE' })
                                        toast.success('Деактивовано')
                                        setTicketProxies(prev => prev.filter(px => px._id !== p._id))
                                      }}
                                      style={{ height: '28px', padding: '0 10px', borderRadius: '7px', fontSize: '12px', fontWeight: 500, background: 'rgba(255,255,255,0.04)', color: '#555', transition: 'all 0.15s' }}
                                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#CCCCCC' }}
                                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#555' }}>
                                      Вимкнути
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* ── AUDIT LOG ── */}
      {activeTab === 'audit' && (
        <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity style={{ width: '13px', height: '13px', color: '#444' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Журнал дій адміна</span>
            {loadingAudit && <Loader2 style={{ width: '11px', height: '11px', color: '#444', marginLeft: 'auto' }} className="animate-spin" />}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 80px', gap: '10px', padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {['Адмін', 'Дія', 'Ціль', 'Коли'].map(h => (
              <span key={h} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#333' }}>{h}</span>
            ))}
          </div>
          {auditLog.length === 0 && !loadingAudit ? (
            <p style={{ fontSize: '12px', color: '#333', padding: '32px', textAlign: 'center' }}>Журнал порожній</p>
          ) : auditLog.map((entry, i) => (
            <div key={entry._id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 80px', gap: '10px', padding: '10px 14px', alignItems: 'center', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.03)' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#CCCCCC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.adminUsername}</span>
              <div>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>{entry.action}</span>
                {entry.details && Object.keys(entry.details).length > 0 && (
                  <span style={{ fontSize: '10px', color: '#444', marginLeft: '8px' }}>
                    {Object.entries(entry.details).map(([k,v]) => `${k}:${v}`).join(' ')}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '11px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.targetName ?? '—'}</span>
              <span style={{ fontSize: '10px', color: '#444', fontFamily: 'JetBrains Mono, monospace' }}>{timeAgo(entry.createdAt)}</span>
            </div>
          ))}
          {auditPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button disabled={auditPage <= 1} onClick={() => { const p = auditPage - 1; setAuditPage(p); loadAudit(p) }}
                style={{ height: '28px', padding: '0 10px', borderRadius: '6px', fontSize: '11px', background: 'rgba(255,255,255,0.06)', color: auditPage <= 1 ? '#333' : '#888' }}>← Назад</button>
              <span style={{ fontSize: '11px', color: '#444' }}>{auditPage} / {auditPages}</span>
              <button disabled={auditPage >= auditPages} onClick={() => { const p = auditPage + 1; setAuditPage(p); loadAudit(p) }}
                style={{ height: '28px', padding: '0 10px', borderRadius: '6px', fontSize: '11px', background: 'rgba(255,255,255,0.06)', color: auditPage >= auditPages ? '#333' : '#888' }}>Далі →</button>
            </div>
          )}
        </div>
      )}

      {/* ── NOTIFY ── */}
      {activeTab === 'notify' && (
        <div style={{ maxWidth: '520px' }} className="space-y-4">
          <div style={{ background: '#0A0A0A', borderRadius: '14px', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '16px' }}>
              <Bell style={{ width: '13px', height: '13px', color: '#444' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555' }}>Broadcast</span>
            </div>

            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '7px' }}>Одержувачі</label>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '14px' }}>
              {(['all', 'active'] as const).map(v => (
                <button key={v} onClick={() => setNotifType(v)}
                  style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12.5px', fontWeight: 500, color: notifType === v ? '#FFFFFF' : '#555', background: notifType === v ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', transition: 'all 0.15s' }}>
                  {v === 'all' ? 'Всі' : 'З активними проксі'}
                </button>
              ))}
            </div>

            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px' }}>Заголовок</label>
            <input value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="Важливе оновлення"
              style={{ ...INPUT, width: '100%', height: '40px', padding: '0 12px', marginBottom: '10px' }}
              onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.12)')}
              onBlur={e => (e.currentTarget.style.boxShadow = 'none')} />

            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px' }}>Повідомлення</label>
            <textarea value={notifBody} onChange={e => setNotifBody(e.target.value)} placeholder="Текст..." rows={3}
              style={{ ...INPUT, width: '100%', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5, marginBottom: '14px' }}
              onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.12)')}
              onBlur={e => (e.currentTarget.style.boxShadow = 'none')} />

            <button onClick={sendBroadcast} disabled={sending || !notifTitle || !notifBody}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', height: '40px', padding: '0 18px', borderRadius: '9px', background: '#FFFFFF', color: '#000', fontSize: '13px', fontWeight: 600, opacity: (sending || !notifTitle || !notifBody) ? 0.4 : 1 }}
              onMouseEnter={e => { if (!sending && notifTitle && notifBody) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = (sending || !notifTitle || !notifBody) ? '0.4' : '1'}>
              {sending ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" /> : <Send style={{ width: '13px', height: '13px' }} />}
              Надіслати
            </button>
          </div>

          <div style={{ background: '#0A0A0A', borderRadius: '14px', padding: '18px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', marginBottom: '10px' }}>Шаблони</p>
            {[
              { title: 'Технічне обслуговування', body: 'Планове ТО серверів. Можливі короткочасні збої 03:00–04:00 UTC.' },
              { title: 'Новий тип проксі',        body: 'ISP проксі — максимальна довіра + швидкість DC. Дивись в каталозі.' },
              { title: 'Акція -20%',              body: 'Знижка 20% на всі плани при оплаті крипто. Промокод: CRYPTO20' },
            ].map((t, i) => (
              <button key={i} onClick={() => { setNotifTitle(t.title); setNotifBody(t.body) }}
                style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', marginBottom: '5px', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
                <p style={{ fontSize: '12.5px', fontWeight: 500, color: '#CCCCCC', marginBottom: '2px' }}>{t.title}</p>
                <p style={{ fontSize: '11px', color: '#444' }}>{t.body.slice(0, 65)}...</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── TIMELINE MODAL ── */}
      {timelineModal && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setTimelineModal(false) }}>
          <div style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <p style={{ fontSize: '11px', color: '#444', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Таймлайн</p>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#FFFFFF', letterSpacing: '-0.02em' }}>{selected.username}</h3>
              </div>
              <button onClick={() => setTimelineModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
            <div style={{ overflowY: 'auto', padding: '16px 22px', flex: 1 }}>
              {loadingTimeline ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}><Loader2 style={{ width: '18px', height: '18px', color: '#444' }} className="animate-spin" /></div>
              ) : timeline.map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: i < timeline.length - 1 ? '16px' : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ev.color, marginTop: '4px' }} />
                    {i < timeline.length - 1 && <div style={{ width: '1px', flex: 1, background: 'rgba(255,255,255,0.06)', marginTop: '4px' }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>{ev.label}</p>
                      {ev.amount !== undefined && (
                        <span style={{ fontSize: '12px', fontWeight: 700, color: ev.type === 'deposit' || ev.type === 'referral_bonus' ? '#22C55E' : '#CCCCCC', fontFamily: 'JetBrains Mono, monospace' }}>
                          ${ev.amount.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {ev.sub && <p style={{ fontSize: '11px', color: '#444', marginTop: '2px' }}>{ev.sub}</p>}
                    <p style={{ fontSize: '10px', color: '#333', marginTop: '3px', fontFamily: 'JetBrains Mono, monospace' }}>{timeAgo(ev.date)}</p>
                  </div>
                </div>
              ))}
              {timeline.length === 0 && !loadingTimeline && (
                <p style={{ fontSize: '13px', color: '#444', textAlign: 'center', padding: '32px' }}>Немає даних</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── NOTES MODAL ── */}
      {notesModal && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setNotesModal(false) }}>
          <div style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <p style={{ fontSize: '11px', color: '#444', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Нотатки</p>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#FFFFFF', letterSpacing: '-0.02em' }}>{selected.username}</h3>
              </div>
              <button onClick={() => setNotesModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
            {/* Add note */}
            <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px', flexShrink: 0 }}>
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Нова нотатка..." rows={2}
                style={{ ...INPUT, flex: 1, padding: '8px 12px', resize: 'none', lineHeight: 1.4, fontSize: '13px' }} />
              <button onClick={saveNote} disabled={savingNote || !newNote.trim()}
                style={{ width: '36px', height: '36px', borderRadius: '8px', background: newNote.trim() ? '#FFFFFF' : 'rgba(255,255,255,0.06)', color: newNote.trim() ? '#000' : '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', transition: 'all 0.15s' }}>
                {savingNote ? <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" /> : <Plus style={{ width: '12px', height: '12px' }} />}
              </button>
            </div>
            {/* Notes list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loadingNotes ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}><Loader2 style={{ width: '18px', height: '18px', color: '#444' }} className="animate-spin" /></div>
              ) : notes.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#333', textAlign: 'center', padding: '32px' }}>Нотаток немає</p>
              ) : notes.map((note, i) => (
                <div key={note._id} style={{ padding: '12px 22px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', color: '#CCCCCC', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{note.content}</p>
                    <p style={{ fontSize: '10px', color: '#333', marginTop: '5px' }}>
                      {(note.adminId as { username: string } | null)?.username ?? 'admin'} · {timeAgo(note.createdAt)}
                    </p>
                  </div>
                  <button onClick={() => deleteNote(note._id)} style={{ color: '#333', flexShrink: 0, padding: '2px' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
                    <Trash2 style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INDIVIDUAL NOTIFY MODAL ── */}
      {notifyUserModal && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setNotifyUserModal(false) }}>
          <div style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#444', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Повідомлення</p>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#FFFFFF', letterSpacing: '-0.02em' }}>{selected.username}</h3>
              </div>
              <button onClick={() => setNotifyUserModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
            <div className="space-y-3">
              <input value={notifyTitle} onChange={e => setNotifyTitle(e.target.value)} placeholder="Заголовок"
                style={{ ...INPUT, width: '100%', height: '40px', padding: '0 12px', boxSizing: 'border-box' }} />
              <textarea value={notifyBody} onChange={e => setNotifyBody(e.target.value)} placeholder="Текст повідомлення..." rows={3}
                style={{ ...INPUT, width: '100%', padding: '10px 12px', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.5 }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setNotifyUserModal(false)} style={{ flex: 1, height: '40px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', color: '#555', fontSize: '13px', fontWeight: 600 }}>Скасувати</button>
                <button onClick={sendNotifyUser} disabled={sendingNotify || !notifyTitle || !notifyBody}
                  style={{ flex: 2, height: '40px', borderRadius: '9px', background: '#FFFFFF', color: '#000', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: (!notifyTitle || !notifyBody) ? 0.4 : 1 }}>
                  {sendingNotify ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" /> : <Send style={{ width: '13px', height: '13px' }} />}
                  Надіслати
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TICKETS MODAL ── */}
      {ticketsModal && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setTicketsModal(false) }}>
          <div style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', width: '100%', maxWidth: '740px', maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <p style={{ fontSize: '11px', color: '#444', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Тікети користувача</p>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#FFFFFF', letterSpacing: '-0.02em' }}>{selected.username}</h3>
              </div>
              <button onClick={() => setTicketsModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            {loadingTickets ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <Loader2 style={{ width: '20px', height: '20px', color: '#444' }} className="animate-spin" />
              </div>
            ) : userTickets.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <p style={{ fontSize: '13px', color: '#444' }}>Тікетів немає</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', flex: 1, overflow: 'hidden' }}>
                {/* Ticket list */}
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto' }}>
                  {userTickets.map((tk, i) => (
                    <button key={tk._id} onClick={() => setActiveTicketIdx(i)}
                      style={{ width: '100%', padding: '12px 14px', textAlign: 'left', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: activeTicketIdx === i ? 'rgba(255,255,255,0.06)' : 'transparent', borderLeft: `2px solid ${activeTicketIdx === i ? '#FFFFFF' : 'transparent'}`, transition: 'all 0.15s' }}>
                      <p style={{ fontSize: '12px', fontWeight: 500, color: '#FFFFFF', marginBottom: '3px' }}>{TICKET_CATEGORIES[tk.category] ?? tk.category}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: TICKET_STATUS_COLOR[tk.status] ?? '#888', background: `${TICKET_STATUS_COLOR[tk.status] ?? '#888'}18`, padding: '1px 5px', borderRadius: '3px' }}>{tk.status}</span>
                        <span style={{ fontSize: '10px', color: '#333' }}>{new Date(tk.createdAt).toLocaleDateString('uk-UA')}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Chat */}
                <div style={{ overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(userTickets[activeTicketIdx]?.messages ?? []).map((msg, i) => {
                    const isBot = msg.role !== 'user'
                    return (
                      <div key={i} style={{ display: 'flex', gap: '8px', flexDirection: isBot ? 'row' : 'row-reverse' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isBot ? '#FFFFFF' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isBot ? <Bot style={{ width: '12px', height: '12px', color: '#000' }} /> : <UserIcon style={{ width: '12px', height: '12px', color: '#CCC' }} />}
                        </div>
                        <div style={{ maxWidth: '80%' }}>
                          <div style={{ padding: '9px 13px', borderRadius: isBot ? '4px 10px 10px 10px' : '10px 4px 10px 10px', background: isBot ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)', fontSize: '13px', color: '#CCCCCC', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                            {msg.content}
                          </div>
                          {msg.createdAt && (
                            <p style={{ fontSize: '10px', color: '#333', marginTop: '3px', textAlign: isBot ? 'left' : 'right' }}>
                              {new Date(msg.createdAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ADD PROXY MODAL ── */}
      {addProxyModal && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setAddProxyModal(false) }}>
          <div style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', width: '100%', maxWidth: '580px', maxHeight: '88vh', overflowY: 'auto', padding: '24px' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#444', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Додати проксі для</p>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#FFFFFF', letterSpacing: '-0.02em' }}>{selected.username}</h3>
              </div>
              <button onClick={() => setAddProxyModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            <div className="space-y-5">

              {/* Country picker */}
              <div>
                <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Країна {selectedCountry && (
                    <span style={{ color: '#FFFFFF', marginLeft: '6px' }}>
                      — {selectedCountry.name} ({selectedCountry.code.toUpperCase()})
                    </span>
                  )}
                </label>

                {/* Selected country preview */}
                {selectedCountry && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: '9px', marginBottom: '10px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/flags/${selectedCountry.code}.png`} alt="" style={{ width: '28px', height: '20px', objectFit: 'cover', borderRadius: '3px' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{selectedCountry.name}</span>
                    <span style={{ fontSize: '12px', color: '#555', fontFamily: 'JetBrains Mono, monospace' }}>{selectedCountry.code.toUpperCase()}</span>
                    <button onClick={() => setSelectedCountry(null)} style={{ marginLeft: 'auto', color: '#444', fontSize: '11px' }}>змінити</button>
                  </div>
                )}

                {/* Search */}
                <input
                  value={countrySearch}
                  onChange={e => setCountrySearch(e.target.value)}
                  placeholder="Пошук країни..."
                  style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', outline: 'none', color: '#FFFFFF', fontSize: '13px', padding: '0 12px', marginBottom: '8px', boxSizing: 'border-box' }}
                  onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.12)')}
                  onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
                />

                {/* Flag grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', maxHeight: '220px', overflowY: 'auto', padding: '2px' }}>
                  {COUNTRIES.filter(c =>
                    !countrySearch || c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch.toLowerCase())
                  ).map(c => (
                    <button key={c.code} onClick={() => { setSelectedCountry(c); setCountrySearch('') }}
                      title={c.name}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 4px', borderRadius: '8px', background: selectedCountry?.code === c.code ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.03)', border: selectedCountry?.code === c.code ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent', transition: 'all 0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => { if (selectedCountry?.code !== c.code) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)' }}
                      onMouseLeave={e => { if (selectedCountry?.code !== c.code) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/flags/${c.code}.png`} alt={c.name} style={{ width: '28px', height: '20px', objectFit: 'cover', borderRadius: '2px' }} />
                      <span style={{ fontSize: '9px', color: '#888', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Protocol */}
              <div>
                <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Протокол</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {PROTOCOLS.map(pr => (
                    <button key={pr} onClick={() => setProxyProtocol(pr)}
                      style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, color: proxyProtocol === pr ? '#FFFFFF' : '#555', background: proxyProtocol === pr ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: proxyProtocol === pr ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent', transition: 'all 0.15s' }}>
                      {pr.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Термін дії</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {DURATIONS.map(d => (
                    <button key={d} onClick={() => setProxyDuration(d)}
                      style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, color: proxyDuration === d ? '#FFFFFF' : '#555', background: proxyDuration === d ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: proxyDuration === d ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent', transition: 'all 0.15s' }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* IP count */}
              <div>
                <label style={{ fontSize: '11px', color: '#555', display: 'block', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Кількість IP</label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {[1, 5, 10, 25, 50].map(n => (
                    <button key={n} onClick={() => setProxyIpCount(n)}
                      style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, color: proxyIpCount === n ? '#FFFFFF' : '#555', background: proxyIpCount === n ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: proxyIpCount === n ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent', transition: 'all 0.15s' }}>
                      {n}
                    </button>
                  ))}
                  <input type="number" value={proxyIpCount} min={1} max={100}
                    onChange={e => setProxyIpCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    style={{ width: '64px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', outline: 'none', color: '#FFFFFF', fontSize: '13px', padding: '0 10px', textAlign: 'center' }} />
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => setAddProxyModal(false)} style={{ flex: 1, height: '42px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', color: '#555', fontSize: '13.5px', fontWeight: 600 }}>Скасувати</button>
                <button onClick={submitAddProxy} disabled={addingProxy || !selectedCountry}
                  style={{ flex: 2, height: '42px', borderRadius: '10px', background: selectedCountry ? '#FFFFFF' : 'rgba(255,255,255,0.1)', color: selectedCountry ? '#000' : '#333', fontSize: '13.5px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: addingProxy ? 0.6 : 1, transition: 'all 0.2s' }}>
                  {addingProxy ? <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" /> : <Plus style={{ width: '14px', height: '14px' }} />}
                  {selectedCountry ? `Додати ${proxyIpCount} IP · ${selectedCountry.code.toUpperCase()} · ${proxyDuration}` : 'Обери країну'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
