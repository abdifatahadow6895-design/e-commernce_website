import { Response } from 'express';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { Coupon } from '../models/Coupon.js';
import { Banner } from '../models/Banner.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { NotFoundError } from '../utils/AppError.js';
import { exportOrdersCSV } from '../services/reportService.js';
import { sendOrderStatusEmail } from '../services/emailService.js';

export const getDashboardStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalProducts,
    totalOrders,
    totalUsers,
    totalRevenue,
    monthlyOrders,
    lastMonthOrders,
    monthlyRevenue,
    lastMonthRevenue,
    lowStockProducts,
    pendingReviews,
  ] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Product.find({ stock: { $lte: 10 }, isActive: true }).limit(10),
    Review.countDocuments({ isApproved: false }),
  ]);

  const revenueChart = await Order.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    stats: {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyOrders,
      orderGrowth: lastMonthOrders > 0 ? ((monthlyOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1) : 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      revenueGrowth: lastMonthRevenue[0]?.total
        ? (((monthlyRevenue[0]?.total || 0) - lastMonthRevenue[0].total) / lastMonthRevenue[0].total * 100).toFixed(1)
        : 0,
      lowStockProducts,
      pendingReviews,
      revenueChart,
    },
  });
});

export const adminGetProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter: Record<string, unknown> = {};
  if (search) filter.$text = { $search: search as string };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).populate('category brand').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.json({ success: true, products, pagination: { page: Number(page), limit: Number(limit), total } });
});

export const adminCreateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

export const adminUpdateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) throw new NotFoundError('Product not found');
  res.json({ success: true, product });
});

export const adminDeleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

export const adminGetOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.orderStatus = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, orders, pagination: { page: Number(page), limit: Number(limit), total } });
});

export const adminUpdateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, message, trackingNumber, carrier } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'email');
  if (!order) throw new NotFoundError('Order not found');

  order.orderStatus = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (carrier) order.carrier = carrier;
  order.tracking.push({ status, message: message || `Order ${status}`, timestamp: new Date() });
  await order.save();

  const user = order.user as unknown as { email: string };
  await sendOrderStatusEmail(user.email, order.orderNumber, status);

  await Notification.create({
    user: order.user,
    type: 'order',
    title: 'Order Update',
    message: `Your order #${order.orderNumber} is now ${status}`,
    link: `/orders/${order.orderNumber}`,
  });

  res.json({ success: true, order });
});

export const adminGetUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(),
  ]);
  res.json({ success: true, users, pagination: { page: Number(page), limit: Number(limit), total } });
});

export const adminUpdateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  if (!user) throw new NotFoundError('User not found');
  res.json({ success: true, user });
});

export const adminGetCategories = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const categories = await Category.find().sort({ order: 1 });
  res.json({ success: true, categories });
});

export const adminCreateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
});

export const adminUpdateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) throw new NotFoundError('Category not found');
  res.json({ success: true, category });
});

export const adminDeleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});

export const adminGetBrands = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const brands = await Brand.find().sort({ name: 1 });
  res.json({ success: true, brands });
});

export const adminCreateBrand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const brand = await Brand.create(req.body);
  res.status(201).json({ success: true, brand });
});

export const adminGetCoupons = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

export const adminCreateCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

export const adminGetReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviews = await Review.find().populate('user product', 'firstName lastName name').sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

export const adminApproveReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!review) throw new NotFoundError('Review not found');
  res.json({ success: true, review });
});

export const adminGetBanners = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const banners = await Banner.find().sort({ order: 1 });
  res.json({ success: true, banners });
});

export const adminCreateBanner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, banner });
});

export const adminExportOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { format = 'csv' } = req.query;
  const orders = await Order.find().populate('user', 'email').sort({ createdAt: -1 }).limit(1000);

  if (format === 'csv') {
    const csv = exportOrdersCSV(orders);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    return res.send(csv);
  }

  res.json({ success: true, orders });
});

export const adminSendNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId, title, message, type = 'system' } = req.body;
  const notification = await Notification.create({ user: userId, title, message, type });
  res.status(201).json({ success: true, notification });
});
