import mongoose, { Schema, Document, Model } from 'mongoose'
import type { ISupportTicket, TicketCategory, TicketStatus, TicketActionType } from '@/types'

export interface SupportTicketDocument extends Omit<ISupportTicket, '_id'>, Document {}

const TicketMessageSchema = new Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'admin'], required: true },
    content: { type: String, required: true },
    quickReplies: { type: [String], default: undefined },
  },
  { timestamps: true }
)

const TicketActionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['proxy_replaced', 'refund_to_balance', 'partial_refund', 'subscription_extended', 'escalated'] as TicketActionType[],
      required: true,
    },
    executedBy: { type: String, required: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
)

const SupportTicketSchema = new Schema<SupportTicketDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    proxyId: { type: Schema.Types.ObjectId, ref: 'UserProxy' },
    category: {
      type: String,
      enum: ['proxy_not_working', 'slow_speed', 'wrong_geo', 'payment_issue', 'refund_request', 'other'] as TicketCategory[],
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'ai_resolved', 'pending_human', 'closed'] as TicketStatus[],
      default: 'open',
    },
    resolvedBy: { type: String },
    messages: [TicketMessageSchema],
    actions: [TicketActionSchema],
  },
  { timestamps: true }
)

SupportTicketSchema.index({ userId: 1, status: 1 })
SupportTicketSchema.index({ status: 1, createdAt: -1 })

const SupportTicket: Model<SupportTicketDocument> =
  mongoose.models.SupportTicket ??
  mongoose.model<SupportTicketDocument>('SupportTicket', SupportTicketSchema)

export default SupportTicket
