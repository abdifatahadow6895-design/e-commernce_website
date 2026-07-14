import Stripe from 'stripe';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let stripe: Stripe | null = null;

if (config.stripe.secretKey) {
  stripe = new Stripe(config.stripe.secretKey);
}

export const createStripePaymentIntent = async (amount: number, currency = 'usd', metadata?: Record<string, string>) => {
  if (!stripe) {
    logger.warn('Stripe not configured');
    return { clientSecret: 'mock_secret', id: 'mock_pi' };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });

  return { clientSecret: paymentIntent.client_secret, id: paymentIntent.id };
};

export const verifyStripeWebhook = (payload: Buffer, signature: string) => {
  if (!stripe || !config.stripe.webhookSecret) return null;
  return stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);
};

export const processPayPalPayment = async (_amount: number, _currency = 'USD') => {
  // PayPal REST API integration - configure PAYPAL_* env vars
  return { success: true, transactionId: `PAYPAL_${Date.now()}` };
};

export const processMpesaPayment = async (phone: string, amount: number, orderNumber: string) => {
  // M-Pesa STK Push integration - configure MPESA_* env vars
  logger.info(`M-Pesa STK Push: ${phone}, ${amount}, order ${orderNumber}`);
  return { success: true, checkoutRequestId: `MPESA_${Date.now()}` };
};

export const processCOD = async () => {
  return { success: true, transactionId: `COD_${Date.now()}` };
};
