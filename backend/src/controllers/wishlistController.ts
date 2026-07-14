import { Response } from 'express';
import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { NotFoundError } from '../utils/AppError.js';

const getOrCreateWishlist = async (userId: string) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate('products');
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
    wishlist = await Wishlist.findById(wishlist._id).populate('products');
  }
  return wishlist!;
};

export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const wishlist = await getOrCreateWishlist(req.user!._id.toString());
  res.json({ success: true, wishlist });
});

export const addToWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.productId);
  if (!product) throw new NotFoundError('Product not found');

  const wishlist = await getOrCreateWishlist(req.user!._id.toString());
  if (!wishlist.products.some((p) => p._id.toString() === req.params.productId)) {
    wishlist.products.push(product._id);
    await wishlist.save();
  }

  const updated = await Wishlist.findById(wishlist._id).populate('products');
  res.json({ success: true, wishlist: updated });
});

export const removeFromWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const wishlist = await getOrCreateWishlist(req.user!._id.toString());
  wishlist.products = wishlist.products.filter((p) => p._id.toString() !== req.params.productId);
  await wishlist.save();

  const updated = await Wishlist.findById(wishlist._id).populate('products');
  res.json({ success: true, wishlist: updated });
});
