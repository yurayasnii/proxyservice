import mongoose, { Schema, Document, Model } from 'mongoose'
import type { IUserProxy, ProxyStatus, ProxyProtocol } from '@/types'

export interface UserProxyDocument extends Omit<IUserProxy, '_id'>, Document {}

const UserProxySchema = new Schema<UserProxyDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'ProxyProduct', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended', 'replacing'] as ProxyStatus[],
      default: 'active',
    },
    host: { type: String, required: true },
    port: { type: Number, required: true, min: 1, max: 65535 },
    username: { type: String, required: true },
    password: { type: String, required: true, select: false },
    protocol: {
      type: String,
      enum: ['http', 'https', 'socks5'] as ProxyProtocol[],
      default: 'http',
    },
    expiresAt: { type: Date, required: true },
    autoRenew: { type: Boolean, default: false },
    bandwidthUsed: { type: Number, default: 0 },
    replacedCount: { type: Number, default: 0, max: 3 },
    lastCheckedAt: { type: Date },
  },
  { timestamps: true }
)

UserProxySchema.index({ userId: 1, status: 1 })
UserProxySchema.index({ expiresAt: 1 })
UserProxySchema.index({ userId: 1, expiresAt: 1 })

const UserProxy: Model<UserProxyDocument> =
  mongoose.models.UserProxy ?? mongoose.model<UserProxyDocument>('UserProxy', UserProxySchema)

export default UserProxy
