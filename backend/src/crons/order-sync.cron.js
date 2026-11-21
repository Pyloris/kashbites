import cron from 'node-cron';
import { ordersStore, shippingConfigStore, dispatchOutboundOrderWebhook } from '../data/store.js';

/**
 * Periodically verifies order webhook dispatch status and attempts retry for un-synced orders
 */
export const orderSyncCron = () => {
    let isRunning = false;

    // Run every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        if (isRunning) {
            console.warn('[CRON:OrderSync] Previous tick still executing, skipping...');
            return;
        }

        isRunning = true;
        const startTime = Date.now();
        console.log(`[CRON:OrderSync] Started at ${new Date().toISOString()}`);

        try {
            if (shippingConfigStore.isEnabled && shippingConfigStore.outboundWebhookUrl) {
                const unsyncedOrders = ordersStore.filter((o) => !o.webhookSynced && o.orderStatus !== 'Cancelled');
                for (const order of unsyncedOrders) {
                    await dispatchOutboundOrderWebhook(order);
                }
                console.log(`[CRON:OrderSync] Processed ${unsyncedOrders.length} un-synced orders in ${Date.now() - startTime}ms`);
            }
        } catch (err) {
            console.error('[CRON:OrderSync] Execution failed:', err.message);
        } finally {
            isRunning = false;
        }
    });
};

export default orderSyncCron;
