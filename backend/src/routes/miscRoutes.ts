import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { contactValidator } from '../validators/authValidators.js';
import * as misc from '../controllers/miscController.js';

const router = Router();

router.get('/categories', misc.getCategories);
router.get('/categories/:slug', misc.getCategory);
router.get('/brands', misc.getBrands);
router.get('/banners', misc.getBanners);
router.post('/coupons/validate', misc.validateCoupon);
router.post('/contact', contactValidator, validate, misc.submitContact);
router.get('/notifications', protect, misc.getNotifications);
router.put('/notifications/:id/read', protect, misc.markNotificationRead);
router.put('/notifications/read-all', protect, misc.markAllNotificationsRead);

export default router;
