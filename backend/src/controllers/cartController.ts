import { Response } from 'express';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { NotFoundError, ValidationError } from '../utils/AppError.js';
import { calculateCouponDiscount } from '../services/commerceService.js';

const getOrCreateCart = async (userId: string) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product coupon');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findById(cart._id).populate('items.product coupon');
  }
  return cart!;
};

export const getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await getOrCreateCart(req.user!._id.toString());
  res.json({ success: true, cart });
});

export const addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new NotFoundError('Product not found');
  if (product.stock < quantity) throw new ValidationError('Insufficient stock');

  const cart = await getOrCreateCart(req.user!._id.toString());
  const existing = cart.items.find((i) => i.product._id.toString() === productId);

  if (existing) {
    existing.quantity += quantity;
    existing.price = product.price;
  } else {
    cart.items.push({ product: product._id, quantity, price: product.price });
  }

  await cart.save();
  const updated = await Cart.findById(cart._id).populate('items.product coupon');
  res.json({ success: true, cart: updated });
});

export const updateCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await getOrCreateCart(req.user!._id.toString());
  const item = cart.items.find((i) => i.product._id.toString() === req.params.productId);
  if (!item) throw new NotFoundError('Item not in cart');

  const product = await Product.findById(req.params.productId);
  if (product!.stock < req.body.quantity) throw new ValidationError('Insufficient stock');

  item.quantity = req.body.quantity;
  await cart.save();

  const updated = await Cart.findById(cart._id).populate('items.product coupon');
  res.json({ success: true, cart: updated });
});

export const removeFromCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await getOrCreateCart(req.user!._id.toString());
  cart.items = cart.items.filter((i) => i.product._id.toString() !== req.params.productId);
  await cart.save();

  const updated = await Cart.findById(cart._id).populate('items.product coupon');
  res.json({ success: true, cart: updated });
});

export const clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Cart.findOneAndUpdate({ user: req.user!._id }, { items: [], coupon: undefined });
  res.json({ success: true, message: 'Cart cleared' });
});

export const applyCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const coupon = await Coupon.findOne({
    code: req.body.code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() },
  });

  if (!coupon) throw new ValidationError('Invalid or expired coupon');
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new ValidationError('Coupon usage limit reached');
  }

  const cart = await getOrCreateCart(req.user!._id.toString());
  cart.coupon = coupon._id;
  await cart.save();

  const updated = await Cart.findById(cart._id).populate('items.product coupon');
  const subtotal = updated!.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = calculateCouponDiscount(coupon, subtotal);

  res.json({ success: true, cart: updated, discount });
});

export const removeCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await getOrCreateCart(req.user!._id.toString());
  cart.coupon = undefined;
  await cart.save();
  res.json({ success: true, message: 'Coupon removed' });
});
