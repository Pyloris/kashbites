import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { connectDB, getDBStatus } from './config/db.js';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Connect to DB (with non-blocking failover)
  connectDB().catch((err) => {
    console.warn('[MongoDB] Init connection non-blocking note:', err?.message || err);
  });

  // API Health & Diagnostics
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'KashBites API',
      timestamp: new Date().toISOString(),
      database: getDBStatus(),
    });
  });

  // Mount API modules
  app.use('/api', productRoutes);
  app.use('/api', orderRoutes);
  app.use('/api', reviewRoutes);

  return app;
};

export default createApp;
