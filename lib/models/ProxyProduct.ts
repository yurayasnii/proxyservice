import mongoose, { Schema, Document, Model } from 'mongoose'
import type { IProxyProduct, IPricingPlan, ProxyType, ProxyProtocol, PlanDuration } from '@/types'

export interface PricingPlanDocument extends Omit<IPricingPlan, '_id' | 'priceUsdt'>, Document {
  priceUsdt: mongoose.Types.Decimal128
}

export interface ProxyProductDocument extends Omit<IProxyProduct, '_id' | 'plans'>, Document {
  plans: PricingPlanDocument[]
}

const PricingPlanSchema = new Schema<PricingPlanDocument>({
  duration: {
    type: String,
    enum: ['1d', '7d', '30d', '90d', '180d', '1y'] as PlanDuration[],
    required: true,
  },
  ipCount: { type: Number, required: true, min: 1 },
  priceUsdt: { type: mongoose.Schema.Types.Decimal128, required: true },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  isPopular: { type: Boolean, default: false },
})

const ProxyProductSchema = new Schema<ProxyProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['residential', 'datacenter', 'mobile', 'isp'] as ProxyType[],
      required: true,
    },
    protocols: [{ type: String, enum: ['http', 'https', 'socks5'] as ProxyProtocol[] }],
    countryCode: { type: String, required: true, uppercase: true, maxlength: 2 },
    countryName: { type: String, required: true },
    city: { type: String },
    ispName: { type: String },
    speedMbps: { type: Number },
    uptimePercent: { type: Number, min: 0, max: 100 },
    stock: { type: Number, default: -1 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    tags: [String],
    plans: [PricingPlanSchema],
  },
  { timestamps: true }
)

ProxyProductSchema.index({ type: 1, countryCode: 1, isActive: 1 })
ProxyProductSchema.index({ isFeatured: 1, isActive: 1 })

ProxyProductSchema.methods.toJSON = function () {
  const obj = this.toObject()
  if (obj.plans) {
    obj.plans = obj.plans.map((plan: PricingPlanDocument & { priceUsdt: mongoose.Types.Decimal128 }) => ({
      ...plan,
      priceUsdt: parseFloat(plan.priceUsdt.toString()),
    }))
  }
  return obj
}

const ProxyProduct: Model<ProxyProductDocument> =
  mongoose.models.ProxyProduct ??
  mongoose.model<ProxyProductDocument>('ProxyProduct', ProxyProductSchema)

export default ProxyProduct
