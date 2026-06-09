import mongoose, { Schema, Document, Model } from 'mongoose'
import type { INotification } from '@/types'

export interface NotificationDocument extends Omit<INotification, '_id'>, Document {}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
)

NotificationSchema.index({ userId: 1, isRead: 1 })
NotificationSchema.index({ createdAt: -1 })

const Notification: Model<NotificationDocument> =
  mongoose.models.Notification ??
  mongoose.model<NotificationDocument>('Notification', NotificationSchema)

export default Notification
