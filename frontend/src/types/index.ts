export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'admin' | 'moderator';
  avatar?: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  preferredLanguage: string;
  preferredCurrency: string;
  loyaltyPoints: number;
  addresses?: Address[];
  recentlyViewed?: Product[];
}

export interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  images: string[];
  video?: string;
  category: Category;
  brand?: Brand;
  tags: string[];
  specifications?: Record<string, string>;
  stock: number;
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSaleEndsAt?: string;
  averageRating: number;
  reviewCount: number;
  soldCount: number;
}

export interface Review {
  _id: string;
  user: { firstName: string; lastName: string; avatar?: string };
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  coupon?: Coupon;
}

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: { name: string; image: string; price: number; quantity: number }[];
  shippingAddress: Address;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  tracking: { status: string; message: string; timestamp: string }[];
  trackingNumber?: string;
  invoiceUrl?: string;
  createdAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  buttonText?: string;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  [key: string]: T | boolean | string | undefined;
}
