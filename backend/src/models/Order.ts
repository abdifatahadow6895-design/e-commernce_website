import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IOrderTracking {
  status: string;
  message: string;
  timestamp: Date;
  location?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  billingAddress?: IShippingAddress;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  coupon?: mongoose.Types.ObjectId;
  couponCode?: string;
  paymentMethod: 'stripe' | 'paypal' | 'mpesa' | 'cod' | 'google_pay' | 'apple_pay';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  tracking: IOrderTracking[];
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  notes?: string;
  invoiceUrl?: string;
  loyaltyPointsEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sku: { type: String },
});

const trackingSchema = new Schema<IOrderTracking>({
  status: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  location: { type: String },
});

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    billingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode: { type: String },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'mpesa', 'cod', 'google_pay', 'apple_pay'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    tracking: [trackingSchema],
    trackingNumber: { type: String },
    carrier: { type: String },
    estimatedDelivery: { type: Date },
    notes: { type: String },
    invoiceUrl: { type: String },
    loyaltyPointsEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
