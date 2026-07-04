import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { upload, uploadImage, uploadMultiple } from '../controllers/uploadController.js';

const router = Router();

router.post('/image', protect, authorize('admin', 'moderator'), upload.single('image'), uploadImage);
router.post('/images', protect, authorize('admin', 'moderator'), upload.array('images', 10), uploadMultiple);

export default router;
