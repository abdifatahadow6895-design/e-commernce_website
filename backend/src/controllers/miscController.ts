import { Response } from 'express';
import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';
import { Banner } from '../models/Banner.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getCategories = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1 });
  res.json({ success: true, categories });
});

export const getCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  res.json({ success: true, category });
});

export const getBrands = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, brands });
});

export const getBanners = asyncHandler(async (req: AuthRequest, res: Response) => {
  const filter: Record<string, unknown> = { isActive: true };
  if (req.query.position) filter.position = req.query.position;

  const now = new Date();
  const banners = await Banner.find({
    ...filter,
    $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }],
    $and: [{ $or: [{ endsAt: { $exists: false } }, { endsAt: { $gte: now } }] }],
  }).sort({ order: 1 });

  res.json({ success: true, banners });
});

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notifications = await Notification.find({ user: req.user!._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, notifications });
});

export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true, message: 'Notification marked as read' });
});

export const markAllNotificationsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ user: req.user!._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});

export const validateCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { Coupon } = await import('../models/Coupon.js');
  const coupon = await Coupon.findOne({
    code: req.body.code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() },
  });

  if (!coupon) return res.json({ success: false, message: 'Invalid coupon' });
  res.json({ success: true, coupon });
});

export const submitContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, subject, message } = req.body;
  const { sendContactEmail } = await import('../services/emailService.js');
  await sendContactEmail({ name, email, subject, message });
  res.json({ success: true, message: 'Message sent successfully. We will respond within 24 hours.' });
});
