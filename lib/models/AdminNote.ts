import mongoose, { Schema, Document, Model } from 'mongoose'

export interface AdminNoteDocument extends Document {
  userId: mongoose.Types.ObjectId
  adminId: mongoose.Types.ObjectId
  content: string
  createdAt: Date
  updatedAt: Date
}

const AdminNoteSchema = new Schema<AdminNoteDocument>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
)

AdminNoteSchema.index({ userId: 1, createdAt: -1 })

const AdminNote: Model<AdminNoteDocument> =
  mongoose.models.AdminNote ?? mongoose.model<AdminNoteDocument>('AdminNote', AdminNoteSchema)

export default AdminNote
