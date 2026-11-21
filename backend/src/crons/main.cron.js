import { connectDb } from '../database/connect.js';
import { orderSyncCron } from './order-sync.cron.js';
import { temporaryOrderCleanupCron } from './temporary-order-cleanup.cron.js';

// Initialize infrastructure
await connectDb();

// Register and schedule all crons
orderSyncCron();
temporaryOrderCleanupCron();

console.log('[CRON] Background cron daemon initialized and running.');
