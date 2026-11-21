import express from 'express';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import authRoutes from './auth.routes.js';
import reviewRoutes from './review.routes.js';
import mediaRoutes from './media.routes.js';
import adminRoutes from './admin.routes.js';

const router = express.Router();

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/auth', authRoutes);
router.use('/reviews', reviewRoutes);
router.use('/media', mediaRoutes);
router.use('/admin', adminRoutes);

export default router;
