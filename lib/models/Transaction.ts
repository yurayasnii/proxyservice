import mongoose, { Schema, Document, Model } from 'mongoose'
import type { ITransaction, TransactionType, TransactionStatus } from '@/types'

export interface TransactionDocument extends Omit<ITransaction, '_id' | 'amount' | 'amountUsdt'>, Document {
  amount: mongoose.Types.Decimal128
  amountUsdt: mongoose.Types.Decimal128
}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    type: {
      type: String,
      enum: ['deposit', 'purchase', 'refund', 'referral_bonus'] as TransactionType[],
      required: true,
    },
    amount: { type: mongoose.Schema.Types.Decimal128, required: true },
    currency: { type: String, required: true },
    amountUsdt: { type: mongoose.Schema.Types.Decimal128, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'] as TransactionStatus[],
      default: 'pending',
    },
    txHash: { type: String },
    network: { type: String },
    description: { type: String },
  },
  { timestamps: true }
)

TransactionSchema.index({ userId: 1, createdAt: -1 })
TransactionSchema.index({ status: 1 })

TransactionSchema.methods.toJSON = function () {
  const obj = this.toObject()
  if (obj.amount) obj.amount = parseFloat(obj.amount.toString())
  if (obj.amountUsdt) obj.amountUsdt = parseFloat(obj.amountUsdt.toString())
  return obj
}

const Transaction: Model<TransactionDocument> =
  mongoose.models.Transaction ?? mongoose.model<TransactionDocument>('Transaction', TransactionSchema)

export default Transaction
