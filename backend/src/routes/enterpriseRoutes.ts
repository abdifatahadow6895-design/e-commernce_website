import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { calculateSalesForecast } from '../services/analyticsService.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Notification } from '../models/Notification.js';

const router = Router();

router.get('/analytics/forecast', protect, authorize('admin', 'moderator'), asyncHandler(async (_req, res) => {
  const revenueHistory = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: { month: { $month: '$createdAt' } }, revenue: { $sum: '$total' } } },
    { $sort: { '_id.month': 1 } },
  ]);

  const history = revenueHistory.map((point) => ({ month: `M${point._id.month}`, revenue: point.revenue }));
  res.json({ success: true, forecast: calculateSalesForecast(history) });
}));

router.get('/bundles', asyncHandler(async (_req, res) => {
  const products = await Product.find({ isActive: true }).sort({ soldCount: -1 }).limit(6);
  res.json({ success: true, bundles: products });
}));

router.post('/tickets', protect, asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  await Notification.create({
    user: req.user!._id,
    type: 'system',
    title: `Support ticket: ${subject}`,
    message,
    link: '/contact',
  });
  res.status(201).json({ success: true, message: 'Support ticket created' });
}));

export default router;
