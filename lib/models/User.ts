import mongoose, { Schema, Document, Model } from 'mongoose'
import type { IUser, UserRole } from '@/types'

export interface UserDocument extends Omit<IUser, '_id' | 'balance'>, Document {
  balance: mongoose.Types.Decimal128
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    username: { type: String, required: true, unique: true, trim: true },
    avatarUrl: { type: String },
    role: { type: String, enum: ['user', 'reseller', 'admin'] as UserRole[], default: 'user' },
    balance: { type: mongoose.Schema.Types.Decimal128, default: mongoose.Types.Decimal128.fromString('0') },
    telegramId: { type: String, sparse: true, unique: true },
    referralCode: { type: String, unique: true, required: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    emailVerified: { type: Boolean, default: false },
    oauthProviders: { type: [String], default: [] },
    twoFactorSecret: { type: String, select: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
)

UserSchema.index({ deletedAt: 1 })

UserSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.passwordHash
  delete obj.twoFactorSecret
  if (obj.balance) {
    obj.balance = parseFloat(obj.balance.toString())
  }
  return obj
}

const User: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>('User', UserSchema)

export default User
