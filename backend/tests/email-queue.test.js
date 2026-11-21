import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { EmailService } from '../src/services/email.service.js';
import {
    EMAIL_QUEUE_NAME,
    getEmailQueue,
    dispatchEmailJob,
    dispatchOrderConfirmationEmail,
    dispatchPaymentSuccessEmail,
    dispatchWelcomeEmail,
} from '../src/queues/email.queue.js';
import { processEmailJob } from '../src/workers/email.worker.js';

describe('SMTP Email Sending Queue & Worker Suite', () => {
    const mockOrder = {
        orderNumber: 'KB-88219',
        customerEmail: 'customer@kashbites.in',
        shippingAddress: {
            fullName: 'Irfan Mir',
            phone: '+91 9419123456',
            addressLine1: 'Rajbagh River View',
            city: 'Srinagar',
            state: 'Jammu & Kashmir',
            pincode: '190008',
        },
        items: [
            {
                productId: 'walnuts-snow-white',
                name: 'Extra Light Snow-White Walnut Halves',
                weight: '500g',
                price: 799,
                quantity: 2,
            },
        ],
        subtotal: 1598,
        shippingFee: 0,
        discount: 160,
        total: 1438,
        paymentMethod: 'ONLINE',
        paymentStatus: 'Paid',
        razorpayPaymentId: 'pay_test_88219',
    };

    it('1. Order confirmation template renders clean responsive HTML with items and pricing', () => {
        const html = EmailService.renderOrderConfirmationTemplate(mockOrder);

        assert.ok(html.includes('KB-88219'));
        assert.ok(html.includes('Irfan Mir'));
        assert.ok(html.includes('Extra Light Snow-White Walnut Halves'));
        assert.ok(html.includes('₹1598'));
        assert.ok(html.includes('₹1438'));
        assert.ok(html.includes('Rajbagh River View'));
    });

    it('2. Payment receipt template renders with Razorpay reference ID', () => {
        const html = EmailService.renderPaymentSuccessTemplate(mockOrder, { paymentId: 'pay_test_88219' });

        assert.ok(html.includes('KB-88219'));
        assert.ok(html.includes('pay_test_88219'));
        assert.ok(html.includes('₹1438'));
        assert.ok(html.includes('Payment Successful!'));
    });

    it('3. Welcome email template renders personalized user greeting', () => {
        const html = EmailService.renderWelcomeTemplate({ name: 'Shabir Dar', email: 'shabir@example.com' });

        assert.ok(html.includes('Shabir Dar'));
        assert.ok(html.includes('KashBites Chinar Club'));
        assert.ok(html.includes('KASHMIR10'));
    });

    it('4. EmailService.sendEmail validates required fields', async () => {
        await assert.rejects(
            async () => {
                await EmailService.sendEmail({ to: '', subject: 'Test' });
            },
            {
                message: 'Recipient email (to) is required',
            }
        );

        await assert.rejects(
            async () => {
                await EmailService.sendEmail({ to: 'test@example.com', subject: '' });
            },
            {
                message: 'Email subject is required',
            }
        );
    });

    it('5. EmailService.sendEmail sends mail successfully via transporter', async () => {
        const result = await EmailService.sendEmail({
            to: 'recipient@kashbites.in',
            subject: 'Test Kashmiri Autumn Harvest',
            html: '<p>Test email body</p>',
        });

        assert.ok(result);
        assert.strictEqual(typeof result.messageId, 'string');
    });

    it('6. Email queue is properly configured with exponential backoff and queue name', () => {
        const queue = getEmailQueue();
        assert.strictEqual(queue.name, EMAIL_QUEUE_NAME);
        assert.strictEqual(EMAIL_QUEUE_NAME, 'email-sending');
        assert.strictEqual(queue.defaultJobOptions.attempts, 5);
        assert.strictEqual(queue.defaultJobOptions.backoff.type, 'exponential');
    });

    it('7. dispatchEmailJob adds job to email queue', async () => {
        const job = await dispatchEmailJob({
            to: 'customer@kashbites.in',
            subject: 'Your Autumn Harvest Update',
            html: '<p>Fresh walnuts have arrived.</p>',
        });

        assert.ok(job);
        assert.ok(job.id);
    });

    it('8. dispatchOrderConfirmationEmail dispatches order confirmation job', async () => {
        const job = await dispatchOrderConfirmationEmail(mockOrder);

        assert.ok(job);
        assert.ok(job.id);
        if (job.data) {
            assert.strictEqual(job.data.to, mockOrder.customerEmail);
            assert.ok(job.data.subject.includes('KB-88219'));
            assert.strictEqual(job.data.template, 'order-confirmation');
        }
    });

    it('9. dispatchPaymentSuccessEmail dispatches payment receipt job', async () => {
        const job = await dispatchPaymentSuccessEmail(mockOrder, { paymentId: 'pay_test_88219' });

        assert.ok(job);
        assert.ok(job.id);
        if (job.data) {
            assert.strictEqual(job.data.to, mockOrder.customerEmail);
            assert.strictEqual(job.data.template, 'payment-success');
        }
    });

    it('10. dispatchWelcomeEmail dispatches welcome email job', async () => {
        const job = await dispatchWelcomeEmail({ name: 'Aamina', email: 'aamina@kashbites.in' });

        assert.ok(job);
        assert.ok(job.id);
        if (job.data) {
            assert.strictEqual(job.data.to, 'aamina@kashbites.in');
            assert.strictEqual(job.data.template, 'welcome');
        }
    });

    it('11. processEmailJob worker processor successfully renders and dispatches email', async () => {
        const mockJob = {
            id: 'mock-job-101',
            data: {
                to: 'test-worker@kashbites.in',
                subject: null,
                html: null,
                template: 'order-confirmation',
                templateData: mockOrder,
            },
            updateProgress: () => {},
        };

        const result = await processEmailJob(mockJob);

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.to, 'test-worker@kashbites.in');
        assert.ok(result.subject.includes('KB-88219'));
        assert.ok(result.messageId);
    });
});
