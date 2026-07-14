import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as admin from '../controllers/adminController.js';

const router = Router();

router.use(protect, authorize('admin', 'moderator'));

router.get('/dashboard', admin.getDashboardStats);
router.get('/dashboard/forecast', admin.getForecastSummary);
router.get('/dashboard/insights', admin.getOperationalInsights);
router.get('/products', admin.adminGetProducts);
router.post('/products', authorize('admin'), admin.adminCreateProduct);
router.put('/products/:id', authorize('admin'), admin.adminUpdateProduct);
router.delete('/products/:id', authorize('admin'), admin.adminDeleteProduct);
router.get('/orders', admin.adminGetOrders);
router.put('/orders/:id/status', admin.adminUpdateOrderStatus);
router.get('/orders/export', admin.adminExportOrders);
router.get('/users', admin.adminGetUsers);
router.put('/users/:id', authorize('admin'), admin.adminUpdateUser);
router.get('/categories', admin.adminGetCategories);
router.post('/categories', authorize('admin'), admin.adminCreateCategory);
router.put('/categories/:id', authorize('admin'), admin.adminUpdateCategory);
router.delete('/categories/:id', authorize('admin'), admin.adminDeleteCategory);
router.get('/brands', admin.adminGetBrands);
router.post('/brands', authorize('admin'), admin.adminCreateBrand);
router.get('/coupons', admin.adminGetCoupons);
router.post('/coupons', authorize('admin'), admin.adminCreateCoupon);
router.get('/reviews', admin.adminGetReviews);
router.put('/reviews/:id/approve', admin.adminApproveReview);
router.get('/banners', admin.adminGetBanners);
router.post('/banners', authorize('admin'), admin.adminCreateBanner);
router.post('/notifications', admin.adminSendNotification);

export default router;
