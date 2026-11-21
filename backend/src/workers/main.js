import { connectDb } from '../database/connect.js';
import { startWebhookWorker } from './webhook.worker.js';
import { startSeedWorker } from './seed.worker.js';
import { startEmailWorker } from './email.worker.js';

// Initialize database
await connectDb();

// Start workers
console.log('[WORKERS] Initializing message consumers...');
await startWebhookWorker();
const seedWorker = await startSeedWorker();
const emailWorker = await startEmailWorker();

console.log('[WORKERS] All background workers initialized and listening.');

export { seedWorker, emailWorker };
export default seedWorker;
