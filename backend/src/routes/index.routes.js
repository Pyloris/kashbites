import express from 'express';
import v1Routes from './v1/index.js';
import productRoutes from './v1/product.routes.js';
import orderRoutes from './v1/order.routes.js';
import authRoutes from './v1/auth.routes.js';
import reviewRoutes from './v1/review.routes.js';
import mediaRoutes from './v1/media.routes.js';
import adminRoutes from './v1/admin.routes.js';
import { getDBStatus } from '../database/connect.js';
import { getMinIOStatus } from '../config/minio.js';
import { OrderController } from '../controllers/order.controller.js';
import { AdminController } from '../controllers/admin.controller.js';

const router = express.Router();

// Mount versioned API routes under /v1
router.use('/v1', v1Routes);

// Unversioned route bindings to ensure zero breaking changes for existing frontend and admin panel calls
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/auth', authRoutes);
router.use('/reviews', reviewRoutes);
router.use('/media', mediaRoutes);
router.use('/admin', adminRoutes);

// Backward compatible coupon validate endpoint (/api/coupons/validate)
router.post('/coupons/validate', OrderController.validateCoupon);

// Health check endpoint (both /health and /v1/health)
router.get(['/health', '/v1/health'], (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        app: 'KashBites API',
        timestamp: new Date().toISOString(),
        database: getDBStatus(),
        storage: getMinIOStatus(),
    });
});

export default router;
