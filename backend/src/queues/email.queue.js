import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { EmailService } from '../services/email.service.js';

export const EMAIL_QUEUE_NAME = 'email-sending';

let emailQueue = null;

/**
 * Returns the singleton BullMQ Email Queue instance
 */
export const getEmailQueue = () => {
    if (!emailQueue) {
        emailQueue = new Queue(EMAIL_QUEUE_NAME, {
            connection: redisConnection,
            defaultJobOptions: {
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 3000, // 3s, 6s, 12s, 24s, 48s
                },
                removeOnComplete: 1000,
                removeOnFail: 5000,
            },
        });
    }
    return emailQueue;
};

/**
 * Dispatches an email sending job to BullMQ with graceful fallback
 */
export const dispatchEmailJob = async ({
    to,
    subject,
    html = null,
    text = null,
    from = null,
    attachments = [],
    template = null,
    templateData = null,
    jobId = null,
}) => {
    if (!to) {
        console.warn('[EmailQueue] Dispatch skipped: recipient email is missing');
        return null;
    }

    const payload = {
        to,
        subject,
        html,
        text,
        from,
        attachments,
        template,
        templateData,
        dispatchedAt: new Date().toISOString(),
    };

    try {
        const queue = getEmailQueue();
        const options = {};
        if (jobId) {
            options.jobId = jobId;
        }

        const job = await queue.add('send-email', payload, options);
        console.log(`[EmailQueue] Dispatched email job [${job.id}] to ${to} ("${subject}")`);
        return job;
    } catch (err) {
        console.warn('[EmailQueue] Redis queue dispatch failed, falling back to direct async delivery:', err.message);
        // Direct fallback so email is never lost if Redis is temporarily unreachable
        EmailService.sendEmail({
            to,
            subject,
            html: html || (template === 'order-confirmation' && templateData ? EmailService.renderOrderConfirmationTemplate(templateData) : ''),
            text,
            from,
            attachments,
        }).catch((directErr) => {
            console.error('[EmailQueue] Direct fallback email sending failed:', directErr.message);
        });
        return { id: `fallback-${Date.now()}`, data: payload };
    }
};

/**
 * Dispatches an order confirmation email for a completed or confirmed order
 */
export const dispatchOrderConfirmationEmail = async (order) => {
    const to = order.customerEmail || order.shippingAddress?.email;
    if (!to) {
        console.warn(`[EmailQueue] Skipping order confirmation email for ${order.orderNumber}: no email found`);
        return null;
    }

    const subject = `Your KashBites Order #${order.orderNumber} is Confirmed! 🏔️`;
    const html = EmailService.renderOrderConfirmationTemplate(order);

    return await dispatchEmailJob({
        to,
        subject,
        html,
        template: 'order-confirmation',
        templateData: order,
        jobId: `order-conf-${order.orderNumber}`,
    });
};

/**
 * Dispatches a payment receipt email for a verified Razorpay online payment
 */
export const dispatchPaymentSuccessEmail = async (order, paymentInfo = {}) => {
    const to = order.customerEmail || order.shippingAddress?.email;
    if (!to) {
        return null;
    }

    const subject = `Payment Received for Order #${order.orderNumber} - KashBites`;
    const html = EmailService.renderPaymentSuccessTemplate(order, paymentInfo);

    return await dispatchEmailJob({
        to,
        subject,
        html,
        template: 'payment-success',
        templateData: { order, paymentInfo },
        jobId: `pay-receipt-${order.orderNumber}-${paymentInfo.paymentId || 'paid'}`,
    });
};

/**
 * Dispatches a welcome email for newly created accounts
 */
export const dispatchWelcomeEmail = async (user) => {
    if (!user || !user.email) {
        return null;
    }

    const subject = `Welcome to KashBites Chinar Club 🍁`;
    const html = EmailService.renderWelcomeTemplate(user);

    return await dispatchEmailJob({
        to: user.email,
        subject,
        html,
        template: 'welcome',
        templateData: user,
        jobId: `welcome-${user.email}`,
    });
};

export default {
    EMAIL_QUEUE_NAME,
    getEmailQueue,
    dispatchEmailJob,
    dispatchOrderConfirmationEmail,
    dispatchPaymentSuccessEmail,
    dispatchWelcomeEmail,
};
