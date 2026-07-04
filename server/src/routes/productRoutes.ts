import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/auth.js';
import * as product from '../controllers/productController.js';

const router = Router();

router.get('/', optionalAuth, product.getProducts);
router.get('/search', product.searchProducts);
router.get('/recommendations', optionalAuth, product.getRecommendations);
router.get('/flash-sales', product.getFlashSales);
router.get('/compare', product.compareProducts);
router.get('/recently-viewed', protect, product.getRecentlyViewed);
router.get('/:slug', optionalAuth, product.getProduct);

export default router;
