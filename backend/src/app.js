import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import authRoutes from './routes/authRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { connectDB, getDBStatus } from './config/db.js';
import { initMinIO, getMinIOStatus } from './config/minio.js';
export const createApp = () => {
    const app = express();
    // Middleware
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    // Connect to MongoDB (with non-blocking failover)
    connectDB().catch((err) => {
        console.warn('[MongoDB] Init connection non-blocking note:', err?.message || err);
    });
    // Connect to MinIO Object Storage (with non-blocking failover)
    initMinIO().catch((err) => {
        console.warn('[MinIO] Init connection non-blocking note:', err?.message || err);
    });
    // API Health & Diagnostics
    app.get('/api/health', (_req, res) => {
        res.json({
            status: 'healthy',
            app: 'KashBites API',
            timestamp: new Date().toISOString(),
            database: getDBStatus(),
            storage: getMinIOStatus(),
        });
    });
    // Mount API modules
    app.use('/api', productRoutes);
    app.use('/api', orderRoutes);
    app.use('/api', reviewRoutes);
    app.use('/api', authRoutes);
    app.use('/api', mediaRoutes);
    app.use('/api', adminRoutes);
    return app;
};
export default createApp;
