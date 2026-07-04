import { Response } from 'express';
import { Product } from '../models/Product.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { NotFoundError } from '../utils/AppError.js';
import { getRelatedProducts, getProductRecommendations } from '../services/commerceService.js';
import { User } from '../models/User.js';

export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    page = 1,
    limit = 12,
    sort = 'createdAt',
    order = 'desc',
    category,
    brand,
    minPrice,
    maxPrice,
    search,
    featured,
    flashSale,
    minRating,
    tags,
  } = req.query;

  const filter: Record<string, unknown> = { isActive: true };

  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (featured === 'true') filter.isFeatured = true;
  if (flashSale === 'true') filter.isFlashSale = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) (filter.price as Record<string, number>).$gte = Number(minPrice);
    if (maxPrice) (filter.price as Record<string, number>).$lte = Number(maxPrice);
  }
  if (minRating) filter.averageRating = { $gte: Number(minRating) };
  if (tags) filter.tags = { $in: (tags as string).split(',') };
  if (search) filter.$text = { $search: search as string };

  const sortObj: Record<string, 1 | -1> = { [sort as string]: order === 'asc' ? 1 : -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category brand')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
    'category brand'
  );

  if (!product) throw new NotFoundError('Product not found');

  product.viewCount += 1;
  await product.save();

  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { recentlyViewed: product._id },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { recentlyViewed: { $each: [product._id], $slice: -20 } },
    });
  }

  const [related, recommendations] = await Promise.all([
    getRelatedProducts(product._id.toString()),
    getProductRecommendations(req.user?._id.toString(), product._id.toString()),
  ]);

  res.json({ success: true, product, related, recommendations });
});

export const searchProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { q, limit = 10 } = req.query;
  if (!q) return res.json({ success: true, products: [] });

  const products = await Product.find(
    { $text: { $search: q as string }, isActive: true },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(Number(limit))
    .populate('category brand');

  res.json({ success: true, products });
});

export const compareProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const ids = (req.query.ids as string).split(',');
  const products = await Product.find({ _id: { $in: ids }, isActive: true }).populate('category brand');
  res.json({ success: true, products });
});

export const getRecommendations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const recommendations = await getProductRecommendations(req.user?._id.toString());
  res.json({ success: true, products: recommendations });
});

export const getRecentlyViewed = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id).populate({
    path: 'recentlyViewed',
    populate: { path: 'category brand' },
  });
  res.json({ success: true, products: user!.recentlyViewed.reverse() });
});

export const getFlashSales = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const products = await Product.find({
    isFlashSale: true,
    isActive: true,
    flashSaleEndsAt: { $gt: new Date() },
  })
    .populate('category brand')
    .sort({ flashSaleEndsAt: 1 });

  res.json({ success: true, products });
});
