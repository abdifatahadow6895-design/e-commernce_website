import { Request, Response } from 'express';
import Stripe from 'stripe';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { NotFoundError, ValidationError } from '../utils/AppError.js';
import { config } from '../config/index.js';
import {
  createStripePaymentIntent,
  verifyStripeWebhook,
  processMpesaPayment,
} from '../services/paymentService.js';
import { sendOrderConfirmationEmail, sendSMS } from '../services/emailService.js';
import { logger } from '../utils/logger.js';

const finalizePaidOrder = async (orderNumber: string, transactionId?: string) => {
  const order = await Order.findOne({ orderNumber });
  if (!order || order.paymentStatus === 'paid') return order;

  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  order.tracking.push({ status: 'confirmed', message: 'Payment confirmed', timestamp: new Date() });
  await order.save();

  await Payment.findOneAndUpdate(
    { order: order._id },
    { status: 'completed', transactionId },
    { sort: { createdAt: -1 } }
  );

  const user = await User.findById(order.user);
  if (user) {
    user.loyaltyPoints += order.loyaltyPointsEarned;
    await user.save({ validateBeforeSave: false });
  }

  if (user?.email) {
    await sendOrderConfirmationEmail(
      user.email,
      order.orderNumber,
      order.total,
      order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price }))
    );
  }

  return order;
};

const cancelUnpaidOrder = async (orderNumber: string) => {
  const order = await Order.findOne({ orderNumber, paymentStatus: 'pending' });
  if (!order) return;

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }

  order.paymentStatus = 'failed';
  order.orderStatus = 'cancelled';
  order.tracking.push({ status: 'cancelled', message: 'Payment failed', timestamp: new Date() });
  await order.save();

  await Payment.findOneAndUpdate({ order: order._id }, { status: 'failed' }, { sort: { createdAt: -1 } });
};

export const createPaymentIntent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderNumber } = req.body;
  if (!orderNumber) throw new ValidationError('Order number is required');

  const order = await Order.findOne({ orderNumber, user: req.user!._id });
  if (!order) throw new NotFoundError('Order not found');
  if (order.paymentStatus === 'paid') throw new ValidationError('Order already paid');

  const result = await createStripePaymentIntent(order.total, 'usd', { orderNumber: order.orderNumber });
  res.json({ success: true, clientSecret: result.clientSecret, id: result.id });
});

export const confirmPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderNumber } = req.body;
  if (!orderNumber) throw new ValidationError('Order number is required');

  const order = await Order.findOne({ orderNumber, user: req.user!._id });
  if (!order) throw new NotFoundError('Order not found');

  if (order.paymentMethod === 'cod') {
    return res.json({ success: true, order, message: 'Cash on delivery order confirmed' });
  }

  if (order.paymentStatus === 'paid') {
    return res.json({ success: true, order });
  }

  if (!config.stripe.secretKey) {
    const finalized = await finalizePaidOrder(order.orderNumber, `mock_${Date.now()}`);
    return res.json({ success: true, order: finalized });
  }

  res.json({ success: true, order, pending: true, message: 'Awaiting payment confirmation' });
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const event = verifyStripeWebhook(req.body as Buffer, signature);

  if (!event) {
    if (!config.stripe.webhookSecret) {
      logger.warn('Stripe webhook received but webhook secret not configured');
      return res.json({ received: true });
    }
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent;
      await finalizePaidOrder(intent.metadata.orderNumber || '', intent.id);
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      await cancelUnpaidOrder(intent.metadata.orderNumber || '');
      break;
    }
    default:
      logger.info(`Unhandled Stripe event: ${event.type}`);
  }

  res.json({ received: true });
});

export const mpesaCallback = asyncHandler(async (req: Request, res: Response) => {
  const { Body } = req.body as { Body?: { stkCallback?: { ResultCode: number; CheckoutRequestID: string; CallbackMetadata?: { Item: { Name: string; Value: string }[] } } } };
  const callback = Body?.stkCallback;

  if (!callback) {
    return res.json({ ResultCode: 1, ResultDesc: 'Invalid callback' });
  }

  const checkoutId = callback.CheckoutRequestID;
  const payment = await Payment.findOne({ transactionId: checkoutId }).populate('order');
  if (!payment?.order) {
    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }

  const order = await Order.findById(payment.order);
  if (!order) {
    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }

  if (callback.ResultCode === 0) {
    await finalizePaidOrder(order.orderNumber, checkoutId);
  } else {
    await cancelUnpaidOrder(order.orderNumber);
  }

  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

export const initiateMpesa = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderNumber, phone } = req.body;
  if (!orderNumber || !phone) throw new ValidationError('Order number and phone are required');

  const order = await Order.findOne({ orderNumber, user: req.user!._id });
  if (!order) throw new NotFoundError('Order not found');

  const result = await processMpesaPayment(phone, order.total, order.orderNumber);
  await Payment.findOneAndUpdate(
    { order: order._id },
    { transactionId: result.checkoutRequestId, status: 'pending' },
    { sort: { createdAt: -1 } }
  );

  if (order.shippingAddress?.phone) {
    await sendSMS(phone, `NexShop: M-Pesa payment initiated for order #${order.orderNumber}. Amount: $${order.total.toFixed(2)}`);
  }

  res.json({ success: true, checkoutRequestId: result.checkoutRequestId });
});

export const getStripeConfig = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    publishableKey: config.stripe.publishableKey || 'pk_test_mock',
    configured: !!config.stripe.secretKey,
  });
});
