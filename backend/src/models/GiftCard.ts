import mongoose, { Document, Schema } from 'mongoose';

export interface IGiftCard extends Document {
  code: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  purchasedBy?: mongoose.Types.ObjectId;
  recipientEmail?: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const giftCardSchema = new Schema<IGiftCard>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    initialBalance: { type: Number, required: true, min: 0 },
    currentBalance: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    purchasedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    recipientEmail: { type: String },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export const GiftCard = mongoose.model<IGiftCard>('GiftCard', giftCardSchema);
