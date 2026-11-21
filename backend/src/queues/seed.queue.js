import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { Product } from '../database/models/products.model.js';
import mongoose from 'mongoose';

export const SEED_QUEUE_NAME = 'database-seed';

let seedQueue = null;

export const getSeedQueue = () => {
    if (!seedQueue) {
        seedQueue = new Queue(SEED_QUEUE_NAME, {
            connection: redisConnection,
        });
    }
    return seedQueue;
};

/**
 * Checks if the database has already been seeded.
 * @returns {Promise<boolean>}
 */
export const checkIfDataSeeded = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return false;
        }
        const count = await Product.countDocuments();
        return count > 0;
    } catch (err) {
        console.warn('[SeedQueue] Error checking seeded status:', err?.message || err);
        return false;
    }
};

/**
 * Dispatches a seed job to the BullMQ seed queue.
 * @returns {Promise<any>}
 */
export const dispatchSeedJob = async () => {
    const queue = getSeedQueue();
    const job = await queue.add(
        'seed-initial-data',
        { triggeredAt: new Date().toISOString() },
        {
            jobId: 'initial-seed-job',
            removeOnComplete: true,
            removeOnFail: false,
        }
    );
    return job;
};
