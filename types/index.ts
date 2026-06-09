import { Types } from 'mongoose'

export type UserRole = 'user' | 'reseller' | 'admin'
export type ProxyType = 'residential' | 'datacenter' | 'mobile' | 'isp'
export type ProxyProtocol = 'http' | 'https' | 'socks5'
export type ProxyStatus = 'active' | 'expired' | 'suspended' | 'replacing'
export type PlanDuration = '1d' | '7d' | '30d' | '90d' | '180d' | '1y'
export type OrderStatus = 'pending' | 'awaiting_payment' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded'
export type PaymentMethod = 'btc' | 'eth' | 'usdt_trc20' | 'usdt_erc20' | 'ton' | 'ltc' | 'balance'
export type TicketCategory = 'proxy_not_working' | 'slow_speed' | 'wrong_geo' | 'payment_issue' | 'refund_request' | 'other'
export type TicketStatus = 'open' | 'ai_resolved' | 'pending_human' | 'closed'
export type TicketActionType = 'proxy_replaced' | 'refund_to_balance' | 'partial_refund' | 'subscription_extended' | 'escalated'
export type TransactionType = 'deposit' | 'purchase' | 'refund' | 'referral_bonus'
export type TransactionStatus = 'pending' | 'confirmed' | 'failed'

export interface IUser {
  _id: Types.ObjectId
  email: string
  passwordHash?: string
  username: string
  avatarUrl?: string
  role: UserRole
  balance: number
  telegramId?: string
  referralCode: string
  referredBy?: Types.ObjectId
  emailVerified: boolean
  oauthProviders?: string[]
  twoFactorSecret?: string
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IPricingPlan {
  _id: Types.ObjectId
  duration: PlanDuration
  ipCount: number
  priceUsdt: number
  discount: number
  isPopular: boolean
}

export interface IProxyProduct {
  _id: Types.ObjectId
  name: string
  description?: string
  type: ProxyType
  protocols: ProxyProtocol[]
  countryCode: string
  countryName: string
  city?: string
  ispName?: string
  speedMbps?: number
  uptimePercent?: number
  stock: number
  isActive: boolean
  isFeatured: boolean
  tags: string[]
  plans: IPricingPlan[]
  createdAt: Date
  updatedAt: Date
}

export interface IUserProxy {
  _id: Types.ObjectId
  userId: Types.ObjectId
  productId: Types.ObjectId | IProxyProduct
  orderId: Types.ObjectId
  status: ProxyStatus
  host: string
  port: number
  username: string
  password?: string
  protocol: ProxyProtocol
  expiresAt: Date
  autoRenew: boolean
  bandwidthUsed: number
  replacedCount: number
  lastCheckedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IOrderItem {
  _id: Types.ObjectId
  planId: Types.ObjectId
  productId: Types.ObjectId
  quantity: number
  priceUsdt: number
  ipCount: number
}

export interface IOrder {
  _id: Types.ObjectId
  userId: Types.ObjectId
  status: OrderStatus
  totalUsdt: number
  discountUsdt: number
  promoCode?: string
  paymentMethod?: PaymentMethod
  paymentTxHash?: string
  paymentAddress?: string
  paymentId?: string
  paidAt?: Date
  expiresAt?: Date
  items: IOrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface ITransaction {
  _id: Types.ObjectId
  userId: Types.ObjectId
  orderId?: Types.ObjectId
  type: TransactionType
  amount: number
  currency: string
  amountUsdt: number
  status: TransactionStatus
  txHash?: string
  network?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface ITicketMessage {
  _id: Types.ObjectId
  role: 'user' | 'assistant' | 'admin'
  content: string
  quickReplies?: string[]
  createdAt: Date
}

export interface ITicketAction {
  _id: Types.ObjectId
  type: TicketActionType
  executedBy: string
  meta?: Record<string, unknown>
  createdAt: Date
}

export interface ISupportTicket {
  _id: Types.ObjectId
  userId: Types.ObjectId | IUser
  proxyId?: Types.ObjectId | IUserProxy
  category: TicketCategory
  status: TicketStatus
  resolvedBy?: string
  messages: ITicketMessage[]
  actions: ITicketAction[]
  createdAt: Date
  updatedAt: Date
}

export interface IApiKey {
  _id: Types.ObjectId
  userId: Types.ObjectId
  name: string
  keyHash: string
  permissions: string[]
  lastUsedAt?: Date
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface INotification {
  _id: Types.ObjectId
  userId: Types.ObjectId
  type: string
  title: string
  body: string
  isRead: boolean
  meta?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Auth types
export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

// NOWPayments types
export interface NOWPaymentsPayment {
  payment_id: string
  payment_status: string
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  pay_currency: string
  order_id: string
  order_description: string
  ipn_callback_url: string
  created_at: string
  updated_at: string
  purchase_id: string
  expiration_estimate_date: string
}

// Support action types
export type AIAction = 'REPLACE_PROXY' | 'REFUND_TO_BALANCE' | 'EXTEND_SUBSCRIPTION' | 'ESCALATE' | null

export interface AIResponse {
  message: string
  action: AIAction
  quickReplies?: string[]
  actionMeta?: {
    proxyId?: string
    refundAmount?: number
    refundPercent?: number
    extendDays?: number
    reason?: string
  }
}
