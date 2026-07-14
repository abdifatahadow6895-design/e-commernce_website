import { Response } from 'express';
import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Payment } from '../models/Payment.js';
import { Coupon } from '../models/Coupon.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { NotFoundError, ValidationError } from '../utils/AppError.js';
import {
  generateOrderNumber,
  calculateCouponDiscount,
} from '../services/commerceService.js';
import {
  createStripePaymentIntent,
  processPayPalPayment,
  processMpesaPayment,
  processCOD,
} from '../services/paymentService.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail, sendSMS } from '../services/emailService.js';
import { generateInvoicePDF } from '../services/reportService.js';

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { shippingAddress, paymentMethod, notes } = req.body;

  const cart = await Cart.findOne({ user: req.user!._id }).populate('items.product coupon');
  if (!cart || cart.items.length === 0) throw new ValidationError('Cart is empty');

  for (const item of cart.items) {
    const product = item.product as unknown as { stock: number; name: string; _id: { toString(): string } };
    if (product.stock < item.quantity) {
      throw new ValidationError(`Insufficient stock for ${product.name}`);
    }
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  let couponDoc;

  if (cart.coupon) {
    couponDoc = await Coupon.findById(cart.coupon);
    if (couponDoc) discount = calculateCouponDiscount(couponDoc, subtotal);
  }

  const shippingCost = subtotal > 100 ? 0 : 9.99;
  const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
  const total = Math.round((subtotal - discount + shippingCost + tax) * 100) / 100;

  const orderItems = cart.items.map((item) => {
    const product = item.product as unknown as {
      _id: { toString(): string };
      name: string;
      images: string[];
      sku: string;
    };
    return {
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      price: item.price,
      quantity: item.quantity,
      sku: product.sku,
    };
  });

  const orderNumber = generateOrderNumber();
  const order = await Order.create({
    orderNumber,
    user: req.user!._id,
    items: orderItems,
    shippingAddress,
    subtotal,
    discount,
    shippingCost,
    tax,
    total,
    coupon: couponDoc?._id,
    couponCode: couponDoc?.code,
    paymentMethod,
    notes,
    loyaltyPointsEarned: Math.floor(total),
    tracking: [{ status: 'pending', message: 'Order placed successfully' }],
  });

  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  if (couponDoc) {
    couponDoc.usedCount += 1;
    await couponDoc.save();
  }

  const isOnlinePayment = ['stripe', 'google_pay', 'apple_pay', 'paypal', 'mpesa'].includes(paymentMethod);
  order.paymentStatus = paymentMethod === 'cod' ? 'pending' : isOnlinePayment ? 'pending' : 'pending';
  order.orderStatus = paymentMethod === 'cod' ? 'confirmed' : 'pending';
  await order.save();

  let paymentResult;
  switch (paymentMethod) {
    case 'stripe':
    case 'google_pay':
    case 'apple_pay':
      paymentResult = await createStripePaymentIntent(total, 'usd', { orderNumber });
      break;
    case 'paypal':
      paymentResult = await processPayPalPayment(total);
      break;
    case 'mpesa':
      paymentResult = await processMpesaPayment(shippingAddress.phone, total, orderNumber);
      break;
    case 'cod':
      paymentResult = await processCOD();
      break;
    default:
      throw new ValidationError('Invalid payment method');
  }

  await Payment.create({
    order: order._id,
    user: req.user!._id,
    amount: total,
    method: paymentMethod,
    status: 'pending',
    transactionId: ('transactionId' in paymentResult
      ? paymentResult.transactionId
      : 'id' in paymentResult
        ? paymentResult.id
        : 'checkoutRequestId' in paymentResult
          ? paymentResult.checkoutRequestId
          : undefined) as string,
  });

  cart.items = [];
  cart.coupon = undefined;
  await cart.save();

  await Notification.create({
    user: req.user!._id,
    type: 'order',
    title: paymentMethod === 'cod' ? 'Order Confirmed' : 'Order Placed',
    message: paymentMethod === 'cod'
      ? `Your order #${orderNumber} has been placed successfully.`
      : `Your order #${orderNumber} is awaiting payment confirmation.`,
    link: `/orders/${orderNumber}`,
  });

  if (paymentMethod === 'cod') {
    const invoiceUrl = await generateInvoicePDF(order);
    order.invoiceUrl = invoiceUrl;
    await order.save();

    await sendOrderConfirmationEmail(
      req.user!.email,
      orderNumber,
      total,
      orderItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price }))
    );

    if (shippingAddress.phone) {
      await sendSMS(shippingAddress.phone, `NexShop: Order #${orderNumber} confirmed. Total: $${total.toFixed(2)}`);
    }

    const user = await (await import('../models/User.js')).User.findById(req.user!._id);
    if (user) {
      user.loyaltyPoints += order.loyaltyPointsEarned;
      await user.save({ validateBeforeSave: false });
    }
  }

  res.status(201).json({
    success: true,
    order,
    payment: paymentResult,
  });
});

export const getOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user!._id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments({ user: req.user!._id }),
  ]);

  res.json({ success: true, orders, pagination: { page: Number(page), limit: Number(limit), total } });
});

export const getOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findOne({
    $or: [{ orderNumber: req.params.id }, { _id: req.params.id }],
    user: req.user!._id,
  });

  if (!order) throw new NotFoundError('Order not found');
  res.json({ success: true, order });
});

export const trackOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });
  if (!order) throw new NotFoundError('Order not found');
  res.json({ success: true, order: { orderNumber: order.orderNumber, status: order.orderStatus, tracking: order.tracking } });
});

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { Review } = await import('../models/Review.js');
  const { productId, rating, title, comment } = req.body;

  const existingOrder = await Order.findOne({
    user: req.user!._id,
    'items.product': productId,
    orderStatus: 'delivered',
  });

  const review = await Review.create({
    product: productId,
    user: req.user!._id,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!existingOrder,
  });

  const stats = await Review.aggregate([
    { $match: { product: review.product, isApproved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].avg * 10) / 10,
      reviewCount: stats[0].count,
    });
  }

  res.status(201).json({ success: true, review });
});

export const getProductReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { Review } = await import('../models/Review.js');
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments({ product: req.params.productId, isApproved: true }),
  ]);

  res.json({ success: true, reviews, pagination: { page: Number(page), limit: Number(limit), total } });
});
