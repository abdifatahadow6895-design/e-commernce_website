import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as order from '../controllers/orderController.js';

const router = Router();

router.post('/', protect, order.createOrder);
router.get('/', protect, order.getOrders);
router.get('/track/:orderNumber', order.trackOrder);
router.get('/:id', protect, order.getOrder);
router.post('/reviews', protect, order.createReview);
router.get('/reviews/:productId', order.getProductReviews);

export default router;
