import api from './api';
import type { User, Product, Cart, Order, Category, Brand, Banner, Review, Notification, Pagination } from '@/types';

export const authApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string; twoFactorCode?: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get<{ user: User }>('/auth/me'),
  updateProfile: (data: Partial<User>) => api.put('/auth/profile', data),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  setup2FA: () => api.post('/auth/2fa/setup'),
  enable2FA: (code: string) => api.post('/auth/2fa/enable', { code }),
  disable2FA: (password: string) => api.post('/auth/2fa/disable', { password }),
  addAddress: (data: object) => api.post('/auth/addresses', data),
  updateAddress: (id: string, data: object) => api.put(`/auth/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/auth/addresses/${id}`),
};

export const productApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<{ products: Product[]; pagination: Pagination }>('/products', { params }),
  getBySlug: (slug: string) =>
    api.get<{ product: Product; related: Product[]; recommendations: Product[] }>(`/products/${slug}`),
  search: (q: string) => api.get<{ products: Product[] }>('/products/search', { params: { q } }),
  getRecommendations: () => api.get<{ products: Product[] }>('/products/recommendations'),
  getFlashSales: () => api.get<{ products: Product[] }>('/products/flash-sales'),
  compare: (ids: string[]) => api.get<{ products: Product[] }>('/products/compare', { params: { ids: ids.join(',') } }),
  getRecentlyViewed: () => api.get<{ products: Product[] }>('/products/recently-viewed'),
};

export const cartApi = {
  get: () => api.get<{ cart: Cart }>('/cart'),
  addItem: (productId: string, quantity = 1) => api.post('/cart/items', { productId, quantity }),
  updateItem: (productId: string, quantity: number) => api.put(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId: string) => api.delete(`/cart/items/${productId}`),
  clear: () => api.delete('/cart'),
  applyCoupon: (code: string) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
};

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (productId: string) => api.post(`/wishlist/${productId}`),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
};

export const orderApi = {
  create: (data: object) => api.post<{ order: Order; payment: object }>('/orders', data),
  getAll: (params?: Record<string, number>) => api.get<{ orders: Order[]; pagination: Pagination }>('/orders', { params }),
  getById: (id: string) => api.get<{ order: Order }>(`/orders/${id}`),
  track: (orderNumber: string) => api.get(`/orders/track/${orderNumber}`),
  createReview: (data: object) => api.post('/orders/reviews', data),
  getReviews: (productId: string) => api.get<{ reviews: Review[]; pagination: Pagination }>(`/orders/reviews/${productId}`),
};

export const miscApi = {
  getCategories: () => api.get<{ categories: Category[] }>('/categories'),
  getBrands: () => api.get<{ brands: Brand[] }>('/brands'),
  getBanners: (position?: string) => api.get<{ banners: Banner[] }>('/banners', { params: { position } }),
  validateCoupon: (code: string) => api.post('/coupons/validate', { code }),
  submitContact: (data: { name: string; email: string; subject: string; message: string }) => api.post('/contact', data),
  getNotifications: () => api.get<{ notifications: Notification[] }>('/notifications'),
  markNotificationRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/notifications/read-all'),
};

export const paymentApi = {
  getConfig: () => api.get<{ publishableKey: string; configured: boolean }>('/payments/stripe/config'),
  createIntent: (orderNumber: string) => api.post<{ clientSecret: string; id: string }>('/payments/stripe/intent', { orderNumber }),
  confirm: (orderNumber: string) => api.post('/payments/stripe/confirm', { orderNumber }),
  initiateMpesa: (orderNumber: string, phone: string) => api.post('/payments/mpesa/initiate', { orderNumber, phone }),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getProducts: (params?: Record<string, string | number>) => api.get('/admin/products', { params }),
  createProduct: (data: object) => api.post('/admin/products', data),
  updateProduct: (id: string, data: object) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  getOrders: (params?: Record<string, string | number>) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id: string, data: object) => api.put(`/admin/orders/${id}/status`, data),
  exportOrders: () => api.get('/admin/orders/export', { params: { format: 'csv' }, responseType: 'blob' }),
  getUsers: () => api.get('/admin/users'),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data: object) => api.post('/admin/categories', data),
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data: object) => api.post('/admin/coupons', data),
  getReviews: () => api.get('/admin/reviews'),
  approveReview: (id: string) => api.put(`/admin/reviews/${id}/approve`),
  getBanners: () => api.get('/admin/banners'),
  createBanner: (data: object) => api.post('/admin/banners', data),
};
