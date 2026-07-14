import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  buttonText?: string;
  position: 'hero' | 'sidebar' | 'footer';
  isActive: boolean;
  order: number;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    link: { type: String },
    buttonText: { type: String },
    position: { type: String, enum: ['hero', 'sidebar', 'footer'], default: 'hero' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    startsAt: { type: Date },
    endsAt: { type: Date },
  },
  { timestamps: true }
);

export const Banner = mongoose.model<IBanner>('Banner', bannerSchema);
