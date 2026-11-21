import { connectDb } from '../database/connect.js';
import { orderSyncCron } from './order-sync.cron.js';

// Initialize infrastructure
await connectDb();

// Register and schedule all crons
orderSyncCron();

console.log('[CRON] Background cron daemon initialized and running.');
