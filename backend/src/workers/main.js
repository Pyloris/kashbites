import { connectDb } from '../database/connect.js';
import { startWebhookWorker } from './webhook.worker.js';
import { startSeedWorker } from './seed.worker.js';

// Initialize database
await connectDb();

// Start workers
console.log('[WORKERS] Initializing message consumers...');
await startWebhookWorker();
const seedWorker = await startSeedWorker();

console.log('[WORKERS] All background workers initialized and listening.');

export { seedWorker };
export default seedWorker;
