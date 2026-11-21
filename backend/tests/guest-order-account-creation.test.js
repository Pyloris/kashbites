import test, { describe, it, before } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { connectDb } from '../src/database/connect.js';
import { User } from '../src/database/models/users.model.js';
import { Order } from '../src/database/models/orders.model.js';
import { TemporaryOrder } from '../src/database/models/temporary-orders.model.js';
import { OrderService } from '../src/services/order.service.js';
import { AuthService } from '../src/services/auth.service.js';
import { EmailService } from '../src/services/email.service.js';
import {
    dispatchAccountCredentialsEmail,
    getEmailQueue,
} from '../src/queues/email.queue.js';
import { processEmailJob } from '../src/workers/email.worker.js';
import { productsStore } from '../src/data/store.js';
import crypto from 'node:crypto';
import { appConfig } from '../src/config/app-config.js';

describe('Guest Order Account Auto-Creation & Credentials Email Suite', () => {
    before(async () => {
        await connectDb();
    });

    it('1. EmailService.renderAccountCreatedTemplate renders clean credentials box and login button', () => {
        const templateData = {
            name: 'Zahoor Lone',
            email: 'zahoor.lone@example.com',
            password: 'KB-88B12F09',
            loginUrl: 'http://localhost:5173',
        };

        const html = EmailService.renderAccountCreatedTemplate(templateData);

        assert.ok(html.includes('Zahoor Lone'));
        assert.ok(html.includes('zahoor.lone@example.com'));
        assert.ok(html.includes('KB-88B12F09'));
        assert.ok(html.includes('Your Login Credentials'));
        assert.ok(html.includes('Sign In to KashBites'));
        assert.ok(html.includes('Chinar Club'));
    });

    it('2. dispatchAccountCredentialsEmail enqueues job with account-credentials template', async () => {
        const mockUser = {
            name: 'Mehraj Din',
            email: 'mehraj.din@example.com',
        };
        const rawPassword = 'KB-A1B2C3D4';

        const job = await dispatchAccountCredentialsEmail({ user: mockUser, rawPassword });

        assert.ok(job);
        assert.ok(job.id);
        if (job.data) {
            assert.strictEqual(job.data.to, mockUser.email);
            assert.strictEqual(job.data.template, 'account-credentials');
            assert.strictEqual(job.data.templateData.rawPassword, rawPassword);
            assert.ok(job.data.subject.includes('KashBites Account Has Been Created'));
        }
    });

    it('3. processEmailJob successfully processes account-credentials email worker job', async () => {
        const mockJob = {
            id: 'job-test-credentials-001',
            data: {
                to: 'credentials.test@example.com',
                subject: null,
                html: null,
                template: 'account-credentials',
                templateData: {
                    user: { name: 'Khurshid Reshi', email: 'credentials.test@example.com' },
                    rawPassword: 'KB-99X88Y77',
                },
            },
            updateProgress: () => {},
        };

        const result = await processEmailJob(mockJob);

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.to, 'credentials.test@example.com');
        assert.ok(result.subject.includes('KashBites Account Has Been Created'));
        assert.ok(result.messageId);
    });

    it('4. Guest user creates COD order successfully -> creates account with random password & user can immediately login', async () => {
        const timestamp = Date.now();
        const guestEmail = `guest.cod.${timestamp}@kashbites.in`;
        const guestPhone = `+91 9797${Math.floor(100000 + Math.random() * 900000)}`;
        const guestName = 'Fayaz Mir';

        const product = productsStore[0];
        const order = await OrderService.create({
            items: [
                {
                    productId: product._id || product.id || product.slug,
                    name: product.name,
                    quantity: 1,
                    weight: product.netWeights?.[0]?.weight || '500g',
                },
            ],
            shippingAddress: {
                fullName: guestName,
                phone: guestPhone,
                email: guestEmail,
                addressLine1: 'Residency Road, House 44',
                city: 'Srinagar',
                state: 'Jammu & Kashmir',
                pincode: '190001',
            },
            paymentMethod: 'COD',
            source: 'cart',
        });

        assert.ok(order);
        assert.ok(order.orderNumber);
        assert.strictEqual(order.orderStatus, 'Confirmed');
        assert.ok(order.customerId, 'Order must be linked to the newly created customerId');

        // Verify user account exists in DB
        let createdUser = null;
        if (mongoose.connection.readyState === 1) {
            createdUser = await User.findOne({ email: guestEmail });
        }
        assert.ok(createdUser, 'User account must exist in database');
        assert.strictEqual(createdUser.name, guestName);
        assert.strictEqual(createdUser.email, guestEmail);
        assert.ok(createdUser.password.startsWith('KB-'), 'Generated random password should start with KB-');

        // Verify customer can log in with generated password via AuthService
        const loginResult = await AuthService.login({
            email: guestEmail,
            password: createdUser.password,
        });

        assert.ok(loginResult.token, 'Customer must receive JWT auth token');
        assert.strictEqual(loginResult.user.email, guestEmail);
        assert.strictEqual(loginResult.user.name, guestName);
    });

    it('5. Existing user checkout does NOT re-create account or overwrite password', async () => {
        const existingEmail = 'mohammadowais616@gmail.com';
        let existingUser = null;
        if (mongoose.connection.readyState === 1) {
            existingUser = await User.findOne({ email: existingEmail });
        }
        const originalPassword = existingUser ? existingUser.password : 'password123';

        const product = productsStore[0];
        const order = await OrderService.create({
            items: [
                {
                    productId: product._id || product.id || product.slug,
                    name: product.name,
                    quantity: 1,
                    weight: product.netWeights?.[0]?.weight || '500g',
                },
            ],
            shippingAddress: {
                fullName: 'Mohammad Owais',
                phone: '+91 98765 43210',
                email: existingEmail,
                addressLine1: 'Boulevard Road',
                city: 'Srinagar',
                state: 'Jammu & Kashmir',
                pincode: '190001',
            },
            paymentMethod: 'COD',
            source: 'cart',
        });

        assert.ok(order);

        // Password should remain untouched
        if (mongoose.connection.readyState === 1) {
            const reloaded = await User.findOne({ email: existingEmail });
            assert.strictEqual(reloaded.password, originalPassword);
        }
    });

    it('6. Guest Razorpay order -> Account is created only upon successful payment verification, allowing login', async () => {
        const timestamp = Date.now();
        const guestEmail = `guest.rzp.${timestamp}@kashbites.in`;
        const guestPhone = `+91 9419${Math.floor(100000 + Math.random() * 900000)}`;
        const guestName = 'Shabir Banday';

        const product = productsStore[0];

        // Step 1: Initiate Razorpay Checkout
        const initResult = await OrderService.createRazorpayOrder({
            items: [
                {
                    productId: product._id || product.id || product.slug,
                    name: product.name,
                    quantity: 2,
                    weight: product.netWeights?.[0]?.weight || '500g',
                },
            ],
            shippingAddress: {
                fullName: guestName,
                phone: guestPhone,
                email: guestEmail,
                addressLine1: 'Lal Chowk, Shop 12',
                city: 'Srinagar',
                state: 'Jammu & Kashmir',
                pincode: '190001',
            },
            source: 'buy_now',
        });

        assert.ok(initResult.temporaryOrderId);
        assert.ok(initResult.razorpayOrderId);

        // At initiation time before payment, user should NOT exist yet
        if (mongoose.connection.readyState === 1) {
            const userBeforePayment = await User.findOne({ email: guestEmail });
            assert.strictEqual(userBeforePayment, null, 'User should not be created before payment is completed');
        }

        // Step 2: Payment is verified
        const razorpayPaymentId = `pay_guest_rzp_${timestamp}`;
        const signaturePayload = `${initResult.razorpayOrderId}|${razorpayPaymentId}`;
        const razorpaySignature = crypto
            .createHmac('sha256', appConfig.RAZORPAY_KEY_SECRET)
            .update(signaturePayload)
            .digest('hex');

        const verificationResult = await OrderService.verifyRazorpayPayment({
            temporaryOrderId: initResult.temporaryOrderId,
            razorpayOrderId: initResult.razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        });

        assert.ok(verificationResult);
        const confirmedOrder = verificationResult.order;
        assert.ok(confirmedOrder);
        assert.strictEqual(confirmedOrder.paymentStatus, 'Paid');
        assert.strictEqual(confirmedOrder.orderStatus, 'Confirmed');
        assert.ok(confirmedOrder.customerId);

        // Account must now exist in DB with random password
        let createdRzpUser = null;
        if (mongoose.connection.readyState === 1) {
            createdRzpUser = await User.findOne({ email: guestEmail });
        }
        assert.ok(createdRzpUser, 'User account must now exist in DB after payment verification');
        assert.strictEqual(createdRzpUser.email, guestEmail);
        assert.ok(createdRzpUser.password.startsWith('KB-'));

        // Customer can log in with the new credentials
        const loginResult = await AuthService.login({
            email: guestEmail,
            password: createdRzpUser.password,
        });

        assert.ok(loginResult.token);
        assert.strictEqual(loginResult.user.email, guestEmail);

        // Verify GET /auth/me returns this specific user and not Mohammad Owais
        const profile = await AuthService.getMe({ authHeader: `Bearer ${loginResult.token}` });
        assert.strictEqual(profile.email, guestEmail);
        assert.strictEqual(profile.name, guestName);
        assert.notStrictEqual(profile.email, 'mohammadowais616@gmail.com');
    });
});
