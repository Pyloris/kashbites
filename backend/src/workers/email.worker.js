import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { EMAIL_QUEUE_NAME } from '../queues/email.queue.js';
import { EmailService } from '../services/email.service.js';

let emailWorker = null;

/**
 * Worker processor for email jobs
 */
export const processEmailJob = async (job) => {
    const { to, subject, html, text, from, attachments, template, templateData } = job.data;

    let finalHtml = html;
    let finalSubject = subject;

    // Render template dynamically if specified
    if (!finalHtml && template) {
        if (template === 'order-confirmation' && templateData) {
            finalHtml = EmailService.renderOrderConfirmationTemplate(templateData);
            if (!finalSubject) {
                finalSubject = `Your KashBites Order #${templateData.orderNumber} is Confirmed! 🏔️`;
            }
        } else if (template === 'payment-success' && templateData) {
            finalHtml = EmailService.renderPaymentSuccessTemplate(templateData.order, templateData.paymentInfo);
            if (!finalSubject) {
                finalSubject = `Payment Received for Order #${templateData.order?.orderNumber} - KashBites`;
            }
        } else if (template === 'welcome' && templateData) {
            finalHtml = EmailService.renderWelcomeTemplate(templateData);
            if (!finalSubject) {
                finalSubject = 'Welcome to KashBites Chinar Club 🍁';
            }
        }
    }

    console.log(`[Worker:Email] Processing job [${job.id}] -> sending email to ${to}`);
    job.updateProgress(25);

    const result = await EmailService.sendEmail({
        to,
        subject: finalSubject,
        html: finalHtml,
        text,
        from,
        attachments,
    });

    job.updateProgress(100);

    return {
        success: true,
        to,
        subject: finalSubject,
        messageId: result.messageId || 'delivered',
        timestamp: new Date().toISOString(),
    };
};

/**
 * Initializes and starts the BullMQ Email Worker
 */
export const startEmailWorker = async () => {
    if (emailWorker) {
        return emailWorker;
    }

    try {
        emailWorker = new Worker(EMAIL_QUEUE_NAME, processEmailJob, {
            connection: redisConnection,
            concurrency: 5,
        });

        emailWorker.on('completed', (job, result) => {
            console.log(`[Worker:Email] Job [${job.id}] completed successfully (Message: ${result?.messageId || 'ok'})`);
        });

        emailWorker.on('failed', (job, err) => {
            console.error(`[Worker:Email] Job [${job?.id}] failed on attempt ${job?.attemptsMade}: ${err.message}`);
        });

        emailWorker.on('error', (err) => {
            console.warn('[Worker:Email] BullMQ email worker non-blocking connection notice:', err.message);
        });

        console.log('[Worker:Email] Email worker started and listening for email-sending jobs.');
        return emailWorker;
    } catch (err) {
        console.warn('[Worker:Email] Email worker failed to initialize:', err.message);
        return null;
    }
};

export const getEmailWorker = () => emailWorker;

export default startEmailWorker;
