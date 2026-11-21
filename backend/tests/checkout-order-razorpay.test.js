import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import { connectDb } from '../src/database/connect.js';
import { OrderService } from '../src/services/order.service.js';
import { appConfig } from '../src/config/app-config.js';
import { temporaryOrdersStore, ordersStore, usersStore, productsStore } from '../src/data/store.js';

describe('E-Commerce Ordering & Razorpay Checkout Suite', () => {
    before(async () => {
        await connectDb().catch(() => console.log('Running tests with in-memory fallback'));
    });

    it('1. Server-side product price & inventory verification ignores client-tampered prices', async () => {
        const testProduct = productsStore[0];
        const genuinePrice = testProduct.price;

        const { validatedItems, subtotal, shippingFee } = await OrderService.validateAndPriceItems({
            items: [
                {
                    productId: testProduct._id || testProduct.id || testProduct.slug,
                    name: testProduct.name,
                    price: 1, // Malicious client attempt to pay ₹1
                    quantity: 2,
                    weight: testProduct.netWeights?.[0]?.weight || '500g',
                },
            ],
        });

        assert.strictEqual(validatedItems.length, 1);
        // Server price must match product price, NOT client's ₹1
        const expectedPrice = testProduct.netWeights?.[0]?.price || genuinePrice;
        assert.strictEqual(validatedItems[0].price, expectedPrice);
        assert.strictEqual(subtotal, expectedPrice * 2);
        assert.strictEqual(shippingFee, subtotal >= 999 ? 0 : 99);
    });

    it('2. Guest checkout automatically creates a customer account without mandatory password', async () => {
        const guestEmail = `guest_test_${Date.now()}@example.com`;
        const guestPhone = `+91 91${Math.floor(10000000 + Math.random() * 90000000)}`;
        const guestName = 'Aaqib Wani';

        const { customer, isNew } = await OrderService.findOrCreateCustomer({
            fullName: guestName,
            email: guestEmail,
            phone: guestPhone,
            shippingAddress: {
                fullName: guestName,
                phone: guestPhone,
                addressLine1: 'Gupkar Road, House 12',
                city: 'Srinagar',
                state: 'Jammu & Kashmir',
                pincode: '190001',
            },
        });

        assert.strictEqual(isNew, true);
        assert.strictEqual(customer.name, guestName);
        assert.strictEqual(customer.email, guestEmail);
        assert.strictEqual(customer.phone, guestPhone);
        assert.ok(customer.addresses.length > 0);
        assert.strictEqual(customer.addresses[0].addressLine1, 'Gupkar Road, House 12');
        assert.strictEqual(customer.password, undefined); // Password excluded from safe customer object
    });

    it('3. Existing customer is identified and re-used on checkout', async () => {
        const existingEmail = 'mohammadowais616@gmail.com';
        const { customer, isNew } = await OrderService.findOrCreateCustomer({
            fullName: 'Mohammad Owais',
            email: existingEmail,
            phone: '+91 98765 43210',
            shippingAddress: {
                fullName: 'Mohammad Owais',
                phone: '+91 98765 43210',
                addressLine1: 'Boulevard Road, Dal Lake',
                city: 'Srinagar',
                state: 'Jammu & Kashmir',
                pincode: '190001',
            },
        });

        assert.strictEqual(isNew, false);
        assert.strictEqual(customer.email, existingEmail);
    });

    it('4. Cash on Delivery (COD) order placement', async () => {
        const product = productsStore[0];
        const codOrder = await OrderService.create({
            items: [
                {
                    productId: product._id || product.id || product.slug,
                    name: product.name,
                    quantity: 1,
                    weight: product.netWeights?.[0]?.weight || '500g',
                },
            ],
            shippingAddress: {
                fullName: 'Tariq Butt',
                phone: '+91 9988776655',
                email: 'tariq.butt@example.com',
                addressLine1: 'Main Market, Baramulla',
                city: 'Baramulla',
                state: 'Jammu & Kashmir',
                pincode: '193101',
            },
            paymentMethod: 'COD',
            couponCode: '',
            source: 'cart',
        });

        assert.ok(codOrder.orderNumber.startsWith('KB-'));
        assert.strictEqual(codOrder.paymentMethod, 'COD');
        assert.strictEqual(codOrder.paymentStatus, 'Pending');
        assert.strictEqual(codOrder.orderStatus, 'Confirmed');
        assert.strictEqual(codOrder.checkoutSource, 'cart');
    });

    it('5. Buy Now checkout tags order source as buy_now independently of cart', async () => {
        const product = productsStore[1] || productsStore[0];
        const buyNowOrder = await OrderService.create({
            items: [
                {
                    productId: product._id || product.id || product.slug,
                    name: product.name,
                    quantity: 1,
                    weight: product.netWeights?.[0]?.weight || '500g',
                },
            ],
            shippingAddress: {
                fullName: 'Zubair Shah',
                phone: '+91 9911223344',
                email: 'zubair.shah@example.com',
                addressLine1: 'Rajbagh Ext',
                city: 'Srinagar',
                state: 'Jammu & Kashmir',
                pincode: '190008',
            },
            paymentMethod: 'COD',
            source: 'buy_now',
        });

        assert.strictEqual(buyNowOrder.checkoutSource, 'buy_now');
    });

    it('6. Razorpay order initiation creates Temporary Order session', async () => {
        const product = productsStore[0];
        const checkoutSession = await OrderService.createRazorpayOrder({
            items: [
                {
                    productId: product._id || product.id || product.slug,
                    name: product.name,
                    quantity: 1,
                    weight: product.netWeights?.[0]?.weight || '500g',
                },
            ],
            shippingAddress: {
                fullName: 'Farooq Abdullah',
                phone: '+91 9419012345',
                email: 'farooq.abdullah@example.com',
                addressLine1: 'Nishat Harwan Road',
                city: 'Srinagar',
                state: 'Jammu & Kashmir',
                pincode: '191121',
            },
            couponCode: 'KASHMIR10',
            source: 'cart',
        });

        assert.ok(checkoutSession.temporaryOrderId.startsWith('TMP-'));
        assert.ok(checkoutSession.razorpayOrderId.startsWith('order_'));
        assert.strictEqual(checkoutSession.keyId, appConfig.RAZORPAY_KEY_ID);
        assert.ok(checkoutSession.amount > 0);
        assert.strictEqual(checkoutSession.currency, 'INR');

        // Verify temporary order exists with pending status
        const statusRes = await OrderService.getTemporaryOrderStatus({
            temporaryOrderId: checkoutSession.temporaryOrderId,
        });
        assert.strictEqual(statusRes.status, 'pending');
        assert.strictEqual(statusRes.convertedOrderNumber, null);
    });

    it('7. Payment verification converts Temporary Order to Confirmed Order with Paid status', async () => {
        const product = productsStore[0];
        // 1. Create session
        const checkoutSession = await OrderService.createRazorpayOrder({
            items: [
                {
                    productId: product._id || product.id || product.slug,
                    name: product.name,
                    quantity: 1,
                    weight: product.netWeights?.[0]?.weight || '500g',
                },
            ],
            shippingAddress: {
                fullName: 'Bilal Ahmad',
                phone: '+91 9419112233',
                email: 'bilal.ahmad@example.com',
                addressLine1: 'Pampore Saffron Town',
                city: 'Pulwama',
                state: 'Jammu & Kashmir',
                pincode: '192121',
            },
            source: 'cart',
        });

        const fakePaymentId = `pay_${Date.now()}`;
        // Generate valid cryptographic signature using test secret
        const payloadToSign = `${checkoutSession.razorpayOrderId}|${fakePaymentId}`;
        const validSignature = crypto
            .createHmac('sha256', appConfig.RAZORPAY_KEY_SECRET)
            .update(payloadToSign)
            .digest('hex');

        // 2. Verify payment
        const result = await OrderService.verifyRazorpayPayment({
            temporaryOrderId: checkoutSession.temporaryOrderId,
            razorpayOrderId: checkoutSession.razorpayOrderId,
            razorpayPaymentId: fakePaymentId,
            razorpaySignature: validSignature,
        });

        assert.strictEqual(result.alreadyProcessed, false);
        assert.ok(result.order);
        assert.strictEqual(result.order.paymentMethod, 'ONLINE');
        assert.strictEqual(result.order.paymentStatus, 'Paid');
        assert.strictEqual(result.order.orderStatus, 'Confirmed');
        assert.strictEqual(result.order.razorpayPaymentId, fakePaymentId);

        // 3. Verify temporary order is now converted
        const statusRes = await OrderService.getTemporaryOrderStatus({
            temporaryOrderId: checkoutSession.temporaryOrderId,
        });
        assert.strictEqual(statusRes.status, 'converted');
        assert.strictEqual(statusRes.convertedOrderNumber, result.order.orderNumber);
    });

    it('8. Duplicate payment verification requests are idempotent', async () => {
        const product = productsStore[0];
        const checkoutSession = await OrderService.createRazorpayOrder({
            items: [
                {
                    productId: product._id || product.id || product.slug,
                    name: product.name,
                    quantity: 1,
                },
            ],
            shippingAddress: {
                fullName: 'Sameer Mir',
                phone: '+91 9797000111',
                email: 'sameer.mir@example.com',
                addressLine1: 'Anantnag Town',
                city: 'Anantnag',
                state: 'Jammu & Kashmir',
                pincode: '192101',
            },
            source: 'cart',
        });

        const fakePaymentId = `pay_${Date.now()}`;
        const validSignature = crypto
            .createHmac('sha256', appConfig.RAZORPAY_KEY_SECRET)
            .update(`${checkoutSession.razorpayOrderId}|${fakePaymentId}`)
            .digest('hex');

        // First verification call
        const first = await OrderService.verifyRazorpayPayment({
            temporaryOrderId: checkoutSession.temporaryOrderId,
            razorpayOrderId: checkoutSession.razorpayOrderId,
            razorpayPaymentId: fakePaymentId,
            razorpaySignature: validSignature,
        });

        // Second duplicate verification call
        const duplicate = await OrderService.verifyRazorpayPayment({
            temporaryOrderId: checkoutSession.temporaryOrderId,
            razorpayOrderId: checkoutSession.razorpayOrderId,
            razorpayPaymentId: fakePaymentId,
            razorpaySignature: validSignature,
        });

        assert.strictEqual(duplicate.alreadyProcessed, true);
        assert.strictEqual(first.order.orderNumber, duplicate.order.orderNumber);
    });

    it('9. Tampered payment signature fails verification and marks temporary order as failed', async () => {
        const product = productsStore[0];
        const checkoutSession = await OrderService.createRazorpayOrder({
            items: [{ productId: product._id || product.id || product.slug, name: product.name, quantity: 1 }],
            shippingAddress: {
                fullName: 'Intruder Test',
                phone: '+91 9000000000',
                email: 'intruder@example.com',
                addressLine1: 'Unknown',
                city: 'Unknown',
                state: 'Unknown',
                pincode: '100001',
            },
        });

        let errorCaught = null;
        try {
            await OrderService.verifyRazorpayPayment({
                temporaryOrderId: checkoutSession.temporaryOrderId,
                razorpayOrderId: checkoutSession.razorpayOrderId,
                razorpayPaymentId: 'pay_tampered_123',
                razorpaySignature: 'invalid_malicious_signature',
            });
        } catch (err) {
            errorCaught = err;
        }

        assert.ok(errorCaught);
        assert.strictEqual(errorCaught.statusCode, 400);

        const statusRes = await OrderService.getTemporaryOrderStatus({
            temporaryOrderId: checkoutSession.temporaryOrderId,
        });
        assert.strictEqual(statusRes.status, 'failed');
    });

    it('10. Razorpay webhook order.paid event verifies signature and converts order', async () => {
        const product = productsStore[0];
        const checkoutSession = await OrderService.createRazorpayOrder({
            items: [{ productId: product._id || product.id || product.slug, name: product.name, quantity: 1 }],
            shippingAddress: {
                fullName: 'Webhook Test User',
                phone: '+91 9419998877',
                email: 'webhook.user@example.com',
                addressLine1: 'Karan Nagar',
                city: 'Srinagar',
                state: 'Jammu & Kashmir',
                pincode: '190010',
            },
        });

        const paymentId = `pay_wh_${Date.now()}`;
        const webhookPayload = {
            entity: 'event',
            account_id: 'acc_test_123',
            event: 'order.paid',
            contains: ['payment', 'order'],
            payload: {
                payment: {
                    entity: {
                        id: paymentId,
                        order_id: checkoutSession.razorpayOrderId,
                        amount: checkoutSession.amount,
                        currency: 'INR',
                        status: 'captured',
                    },
                },
                order: {
                    entity: {
                        id: checkoutSession.razorpayOrderId,
                        amount: checkoutSession.amount,
                        status: 'paid',
                    },
                },
            },
            created_at: Math.floor(Date.now() / 1000),
        };

        const rawBody = Buffer.from(JSON.stringify(webhookPayload));
        const validWebhookSignature = crypto
            .createHmac('sha256', appConfig.RAZORPAY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('hex');

        const webhookRes = await OrderService.handleRazorpayWebhook({
            rawBody,
            signature: validWebhookSignature,
            event: webhookPayload,
        });

        assert.strictEqual(webhookRes.received, true);
        assert.strictEqual(webhookRes.event, 'order.paid');

        // Check that temp order was converted
        const statusRes = await OrderService.getTemporaryOrderStatus({
            temporaryOrderId: checkoutSession.temporaryOrderId,
        });
        assert.strictEqual(statusRes.status, 'converted');
        assert.ok(statusRes.convertedOrderNumber);
    });

    it('11. Razorpay webhook with forged signature is rejected with 400', async () => {
        const rawBody = Buffer.from(JSON.stringify({ event: 'payment.captured' }));
        let errorCaught = null;
        try {
            await OrderService.handleRazorpayWebhook({
                rawBody,
                signature: 'forged_fake_signature_abc',
                event: { event: 'payment.captured' },
            });
        } catch (err) {
            errorCaught = err;
        }

        assert.ok(errorCaught);
        assert.strictEqual(errorCaught.statusCode, 400);
    });

    it('12. Temporary order cancellation marks session as cancelled', async () => {
        const product = productsStore[0];
        const checkoutSession = await OrderService.createRazorpayOrder({
            items: [{ productId: product._id || product.id || product.slug, name: product.name, quantity: 1 }],
            shippingAddress: {
                fullName: 'Cancelled User',
                phone: '+91 9419111222',
                email: 'cancelled@example.com',
                addressLine1: 'Nowhatta',
                city: 'Srinagar',
                state: 'Jammu & Kashmir',
                pincode: '190002',
            },
        });

        const cancelRes = await OrderService.cancelTemporaryOrder({
            temporaryOrderId: checkoutSession.temporaryOrderId,
            reason: 'User closed payment window',
        });

        assert.strictEqual(cancelRes.status, 'cancelled');

        const statusRes = await OrderService.getTemporaryOrderStatus({
            temporaryOrderId: checkoutSession.temporaryOrderId,
        });
        assert.strictEqual(statusRes.status, 'cancelled');
    });

    it('13. Expired temporary orders cleanup works properly', async () => {
        // Push an expired temporary order directly
        const expiredTempId = `TMP-EXPIRED-${Date.now()}`;
        temporaryOrdersStore.push({
            temporaryOrderId: expiredTempId,
            razorpayOrderId: 'order_expired_test',
            status: 'pending',
            expiresAt: new Date(Date.now() - 3600 * 1000), // 1 hour ago
        });

        const { expiredCount } = await OrderService.cleanupExpiredTemporaryOrders();
        assert.ok(expiredCount >= 1);

        const found = temporaryOrdersStore.find((t) => t.temporaryOrderId === expiredTempId);
        assert.strictEqual(found.status, 'expired');
    });
});
