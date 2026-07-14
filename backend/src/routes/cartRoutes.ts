import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as cart from '../controllers/cartController.js';

const router = Router();

router.use(protect);
router.get('/', cart.getCart);
router.post('/items', cart.addToCart);
router.put('/items/:productId', cart.updateCartItem);
router.delete('/items/:productId', cart.removeFromCart);
router.delete('/', cart.clearCart);
router.post('/coupon', cart.applyCoupon);
router.delete('/coupon', cart.removeCoupon);

export default router;
