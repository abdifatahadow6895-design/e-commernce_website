import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as wishlist from '../controllers/wishlistController.js';

const router = Router();

router.use(protect);
router.get('/', wishlist.getWishlist);
router.post('/:productId', wishlist.addToWishlist);
router.delete('/:productId', wishlist.removeFromWishlist);

export default router;
