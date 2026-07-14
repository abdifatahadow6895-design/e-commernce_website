import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

export const getProductRecommendations = async (userId?: string, productId?: string, limit = 8) => {
  if (productId) {
    const product = await Product.findById(productId);
    if (product) {
      return Product.find({
        _id: { $ne: productId },
        category: product.category,
        isActive: true,
      })
        .sort({ averageRating: -1, soldCount: -1 })
        .limit(limit)
        .populate('category brand');
    }
  }

  if (userId) {
    const recentOrders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.product');

    const categoryIds = new Set<string>();
    for (const order of recentOrders) {
      for (const item of order.items) {
        const prod = await Product.findById(item.product);
        if (prod) categoryIds.add(prod.category.toString());
      }
    }

    if (categoryIds.size > 0) {
      return Product.find({
        category: { $in: Array.from(categoryIds) },
        isActive: true,
      })
        .sort({ averageRating: -1, soldCount: -1 })
        .limit(limit)
        .populate('category brand');
    }
  }

  return Product.find({ isActive: true, isFeatured: true })
    .sort({ soldCount: -1 })
    .limit(limit)
    .populate('category brand');
};

export const getRelatedProducts = async (productId: string, limit = 4) => {
  const product = await Product.findById(productId);
  if (!product) return [];

  return Product.find({
    _id: { $ne: productId },
    category: product.category,
    isActive: true,
  })
    .sort({ averageRating: -1 })
    .limit(limit)
    .populate('category brand');
};

export const calculateCouponDiscount = (
  coupon: { type: string; value: number; maxDiscount?: number },
  subtotal: number
): number => {
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.type === 'fixed') {
    discount = Math.min(coupon.value, subtotal);
  }
  return Math.round(discount * 100) / 100;
};

export const generateOrderNumber = (): string => {
  const date = new Date();
  const prefix = `NX${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${random}`;
};
