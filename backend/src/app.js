import express from 'express';
import { Config } from './config/env.js';
import { appConfig } from './config/app-config.js';
import { connectDb } from './database/connect.js';
import { initMinIO } from './config/minio.js';
import setupApp from './setup/setup-app.js';
import { checkIfDataSeeded, dispatchSeedJob, SEED_QUEUE_NAME } from './queues/seed.queue.js';
import { startSeedWorker, executeSeed } from './workers/seed.worker.js';
import { QueueEvents } from 'bullmq';
import { redisConnection } from './config/redis.js';

// Phase 1: Validate environment variables before doing anything else
Config.check();

// Factory function to create and configure an Express app instance
export const createApp = () => {
    // Phase 2: Connect to infrastructure (DB & Object Storage) with non-blocking graceful fallback
    connectDb().then(async (connected) => {
        if (connected) {
            try {
                const isSeeded = await checkIfDataSeeded();
                if (!isSeeded) {
                    console.log('[Startup] MongoDB data is not seeded. Triggering BullMQ seed worker...');
                    await startSeedWorker();
                    const job = await dispatchSeedJob();
                    console.log(`[Startup] Dispatched seed job [${job.id}] to BullMQ.`);
                    try {
                        const queueEvents = new QueueEvents(SEED_QUEUE_NAME, { connection: redisConnection });
                        await job.waitUntilFinished(queueEvents, 8000);
                        console.log('[Startup] BullMQ database seeding completed successfully.');
                        await queueEvents.close();
                    } catch (waitErr) {
                        console.log('[Startup] BullMQ job running in background:', waitErr?.message || waitErr);
                    }
                } else {
                    console.log('[Startup] MongoDB data already seeded.');
                }
            } catch (seedErr) {
                console.warn('[Startup] BullMQ dispatch issue, attempting direct seed fallback:', seedErr?.message || seedErr);
                await executeSeed().catch((err) => console.error('[Startup] Direct seed fallback note:', err?.message || err));
            }
        }
    }).catch((err) => {
        console.warn('[MongoDB] Init connection non-blocking note:', err?.message || err);
    });

    initMinIO().catch((err) => {
        console.warn('[MinIO] Init connection non-blocking note:', err?.message || err);
    });

    // Phase 3: Create Express app and configure pipeline
    const app = express();
    setupApp(app);
    return app;
};

const app = createApp();

// Phase 4: Start HTTP listener if run directly
const PORT = appConfig.PORT;


app.listen(PORT, '0.0.0.0', ()=>{
    console.log(`[${appConfig.APP_NAME}] Running on http://0.0.0.0:${PORT} in [${appConfig.NODE_ENV}] mode`);
});