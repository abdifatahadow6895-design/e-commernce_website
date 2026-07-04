import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as payment from '../controllers/paymentController.js';

const router = Router();

router.get('/stripe/config', payment.getStripeConfig);
router.post('/stripe/intent', protect, payment.createPaymentIntent);
router.post('/stripe/confirm', protect, payment.confirmPayment);
router.post('/mpesa/initiate', protect, payment.initiateMpesa);
router.post('/mpesa/callback', payment.mpesaCallback);

export default router;
