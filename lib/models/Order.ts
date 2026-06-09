import mongoose, { Schema, Document, Model } from 'mongoose'
import type { IOrder, IOrderItem, OrderStatus, PaymentMethod } from '@/types'

export interface OrderItemDocument extends Omit<IOrderItem, '_id' | 'priceUsdt'> {
  _id: mongoose.Types.ObjectId
  priceUsdt: mongoose.Types.Decimal128
}

export interface OrderDocument extends Omit<IOrder, '_id' | 'totalUsdt' | 'discountUsdt' | 'items'>, Document {
  totalUsdt: mongoose.Types.Decimal128
  discountUsdt: mongoose.Types.Decimal128
  items: OrderItemDocument[]
}

const OrderItemSchema = new Schema({
  planId: { type: Schema.Types.ObjectId },
  productId: { type: Schema.Types.ObjectId, ref: 'ProxyProduct' },
  quantity: { type: Number, min: 1 },
  priceUsdt: { type: mongoose.Schema.Types.Decimal128 },
  ipCount: { type: Number },
})

const OrderSchema = new Schema<OrderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'awaiting_payment', 'paid', 'processing', 'completed', 'cancelled', 'refunded'] as OrderStatus[],
      default: 'pending',
    },
    totalUsdt: { type: mongoose.Schema.Types.Decimal128, required: true },
    discountUsdt: { type: mongoose.Schema.Types.Decimal128, default: mongoose.Types.Decimal128.fromString('0') },
    promoCode: { type: String },
    paymentMethod: {
      type: String,
      enum: ['btc', 'eth', 'usdt_trc20', 'usdt_erc20', 'ton', 'ltc', 'balance'] as PaymentMethod[],
    },
    paymentTxHash: { type: String },
    paymentAddress: { type: String },
    paymentId: { type: String },
    paidAt: { type: Date },
    expiresAt: { type: Date },
    items: [OrderItemSchema],
  },
  { timestamps: true }
)

OrderSchema.index({ userId: 1, status: 1 })
OrderSchema.index({ paymentId: 1 })
OrderSchema.index({ expiresAt: 1, status: 1 })

OrderSchema.methods.toJSON = function () {
  const obj = this.toObject()
  if (obj.totalUsdt) obj.totalUsdt = parseFloat(obj.totalUsdt.toString())
  if (obj.discountUsdt) obj.discountUsdt = parseFloat(obj.discountUsdt.toString())
  if (obj.items) {
    obj.items = obj.items.map((item: { priceUsdt: mongoose.Types.Decimal128 }) => ({
      ...item,
      priceUsdt: item.priceUsdt ? parseFloat(item.priceUsdt.toString()) : 0,
    }))
  }
  return obj
}

const Order: Model<OrderDocument> =
  mongoose.models.Order ?? mongoose.model<OrderDocument>('Order', OrderSchema)

export default Order
