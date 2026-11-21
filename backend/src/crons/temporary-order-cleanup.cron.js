import cron from 'node-cron';
import { OrderService } from '../services/order.service.js';

/**
 * Periodically verifies and expires abandoned temporary order sessions
 */
export const temporaryOrderCleanupCron = () => {
    let isRunning = false;

    // Run every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        if (isRunning) {
            console.warn('[CRON:TempOrderCleanup] Previous tick still executing, skipping...');
            return;
        }

        isRunning = true;
        const startTime = Date.now();
        console.log(`[CRON:TempOrderCleanup] Started at ${new Date().toISOString()}`);

        try {
            const { expiredCount } = await OrderService.cleanupExpiredTemporaryOrders();
            console.log(`[CRON:TempOrderCleanup] Marked ${expiredCount} temporary orders as expired in ${Date.now() - startTime}ms`);
        } catch (err) {
            console.error('[CRON:TempOrderCleanup] Execution failed:', err.message);
        } finally {
            isRunning = false;
        }
    });
};

export default temporaryOrderCleanupCron;
