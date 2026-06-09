import mongoose, { Schema, Document, Model } from 'mongoose'
import type { IApiKey } from '@/types'

export interface ApiKeyDocument extends Omit<IApiKey, '_id'>, Document {}

const ApiKeySchema = new Schema<ApiKeyDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    keyHash: { type: String, unique: true, required: true },
    permissions: [String],
    lastUsedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
)

ApiKeySchema.index({ userId: 1, deletedAt: 1 })

const ApiKey: Model<ApiKeyDocument> =
  mongoose.models.ApiKey ?? mongoose.model<ApiKeyDocument>('ApiKey', ApiKeySchema)

export default ApiKey
