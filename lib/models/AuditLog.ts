import mongoose, { Schema, Document, Model } from 'mongoose'

export interface AuditLogDocument extends Document {
  adminId: mongoose.Types.ObjectId
  adminUsername: string
  action: string
  targetId?: mongoose.Types.ObjectId
  targetType?: string
  targetName?: string
  details?: Record<string, unknown>
  createdAt: Date
}

const AuditLogSchema = new Schema<AuditLogDocument>(
  {
    adminId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    adminUsername: { type: String, required: true },
    action:        { type: String, required: true },
    targetId:      { type: Schema.Types.ObjectId },
    targetType:    { type: String },
    targetName:    { type: String },
    details:       { type: Schema.Types.Mixed },
  },
  { timestamps: true, capped: { size: 10 * 1024 * 1024, max: 10000 } }
)

AuditLogSchema.index({ createdAt: -1 })
AuditLogSchema.index({ adminId: 1 })

const AuditLog: Model<AuditLogDocument> =
  mongoose.models.AuditLog ?? mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema)

export default AuditLog
