import crypto from 'crypto';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';
import { appConfig } from '../config/app-config.js';
import { Order } from '../database/models/orders.model.js';
import { TemporaryOrder } from '../database/models/temporary-orders.model.js';
import { User } from '../database/models/users.model.js';
import { Product } from '../database/models/products.model.js';
import {
    ordersStore,
    couponsStore,
    shippingConfigStore,
    dispatchOutboundOrderWebhook,
    productsStore,
    usersStore,
    temporaryOrdersStore,
} from '../data/store.js';
import { ApiError } from '../errors/api-error.js';
import {
    dispatchOrderConfirmationEmail,
    dispatchPaymentSuccessEmail,
    dispatchWelcomeEmail,
    dispatchAccountCredentialsEmail,
} from '../queues/email.queue.js';

let razorpayClient = null;
const getRazorpayClient = () => {
    if (!razorpayClient) {
        razorpayClient = new Razorpay({
            key_id: appConfig.RAZORPAY_KEY_ID,
            key_secret: appConfig.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayClient;
};

export class OrderService {
    /**
     * Calculate discount for a coupon code on given subtotal
     */
    static calculateCouponDiscount(code, subtotal) {
        if (!code) return 0;
        const trimmed = String(code).trim().toUpperCase();
        const coupon = couponsStore.find((c) => c.code === trimmed && c.isActive);
        if (!coupon) return 0;
        if (subtotal < coupon.minOrderAmount) return 0;

        if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
            return 0;
        }

        let discount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discount = Math.round((subtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
        } else {
            discount = coupon.discountValue;
        }

        return Math.min(discount, subtotal);
    }

    /**
     * Validate coupon code against subtotal
     */
    static async validateCoupon({ code, subtotal = 1000 }) {
        if (!code) {
            throw ApiError.badRequest('Coupon code is required');
        }
        const trimmed = String(code).trim().toUpperCase();
        const coupon = couponsStore.find((c) => c.code === trimmed);
        if (!coupon || !coupon.isActive) {
            throw ApiError.notFound('Invalid or inactive coupon code');
        }
        if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
            throw ApiError.badRequest('This coupon has expired');
        }
        if (Number(subtotal) < coupon.minOrderAmount) {
            throw ApiError.badRequest(`Minimum order of ₹${coupon.minOrderAmount} required for ${coupon.code}`);
        }

        const discountAmount = OrderService.calculateCouponDiscount(trimmed, Number(subtotal));

        return {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderAmount: coupon.minOrderAmount,
            maxDiscountAmount: coupon.maxDiscountAmount,
            discountAmount,
            description: coupon.description,
        };
    }

    /**
     * Server-side product price & quantity validation
     * Never trusts prices submitted by client
     */
    static async validateAndPriceItems({ items }) {
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw ApiError.badRequest('Order items must be a non-empty array');
        }

        const validatedItems = [];

        for (const item of items) {
            if (!item.productId && !item.slug && !item.name) {
                throw ApiError.badRequest('Each item must specify a productId, slug, or name');
            }

            let product = null;

            // 1. Try to find product in MongoDB if connected
            if (mongoose.connection.readyState === 1) {
                const searchCriteria = [];
                if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
                    searchCriteria.push({ _id: item.productId });
                }
                if (item.productId) {
                    searchCriteria.push({ slug: item.productId });
                }
                if (item.slug) {
                    searchCriteria.push({ slug: item.slug });
                }
                if (item.name) {
                    searchCriteria.push({ name: item.name });
                }

                if (searchCriteria.length > 0) {
                    product = await Product.findOne({ $or: searchCriteria }).lean();
                }
            }

            // 2. Fallback to productsStore
            if (!product) {
                product = productsStore.find(
                    (p) =>
                        String(p._id) === String(item.productId) ||
                        String(p.id) === String(item.productId) ||
                        p.slug === item.productId ||
                        p.slug === item.slug ||
                        p.name === item.name
                );
            }

            if (!product) {
                throw ApiError.notFound(`Product "${item.name || item.productId}" was not found`);
            }

            if (product.inStock === false) {
                throw ApiError.badRequest(`Product "${product.name}" is currently out of stock`);
            }

            // Determine server-side unit price based on weight variant
            let unitPrice = product.price;
            let chosenWeight = item.weight || (product.netWeights && product.netWeights[0]?.weight) || '500g';

            if (product.netWeights && product.netWeights.length > 0) {
                const matchedWeight = product.netWeights.find(
                    (w) => String(w.weight).toLowerCase() === String(chosenWeight).toLowerCase()
                ) || product.netWeights[0];

                if (matchedWeight) {
                    chosenWeight = matchedWeight.weight;
                    unitPrice = matchedWeight.price;
                    if (matchedWeight.inStock === false) {
                        throw ApiError.badRequest(`Variant ${chosenWeight} of "${product.name}" is out of stock`);
                    }
                }
            }

            const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

            validatedItems.push({
                productId: String(product._id || product.id || item.productId),
                name: product.name,
                weight: chosenWeight,
                price: Number(unitPrice),
                quantity,
                image: item.image || product.primaryImage || (product.images && product.images[0]) || '',
                slug: product.slug || '',
            });
        }

        const subtotal = validatedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
        const shippingFee = subtotal >= 999 ? 0 : 99;

        return { validatedItems, subtotal, shippingFee };
    }

    /**
     * Find existing customer or auto-create guest account
     */
    static async findOrCreateCustomer({ fullName, email, phone, shippingAddress = {}, authenticatedUserId = null, createIfNotFound = true }) {
        const cleanEmail = email ? String(email).trim().toLowerCase() : null;
        const cleanPhone = phone ? String(phone).trim() : null;

        let customer = null;

        // 1. If customer is authenticated, look up by userId
        if (authenticatedUserId) {
            if (mongoose.connection.readyState === 1) {
                customer = await User.findById(authenticatedUserId);
            }
            if (!customer) {
                customer = usersStore.find((u) => String(u._id) === String(authenticatedUserId) || String(u.id) === String(authenticatedUserId));
            }
        }

        // 2. Identify by email if not found
        if (!customer && cleanEmail) {
            if (mongoose.connection.readyState === 1) {
                customer = await User.findOne({ email: cleanEmail });
            }
            if (!customer) {
                customer = usersStore.find((u) => u.email?.toLowerCase() === cleanEmail);
            }
        }

        // 3. Identify by phone only if email was NOT provided
        if (!customer && !cleanEmail && cleanPhone) {
            if (mongoose.connection.readyState === 1) {
                customer = await User.findOne({ phone: cleanPhone });
            }
            if (!customer) {
                customer = usersStore.find((u) => u.phone === cleanPhone);
            }
        }

        // If customer exists, update delivery address if new
        if (customer) {
            if (shippingAddress && shippingAddress.addressLine1) {
                const addresses = customer.addresses || [];
                const exists = addresses.some(
                    (a) =>
                        a.addressLine1 === shippingAddress.addressLine1 &&
                        a.pincode === shippingAddress.pincode
                );
                if (!exists) {
                    const newAddr = {
                        id: `addr-${Date.now()}`,
                        label: 'Delivery Address',
                        fullName: shippingAddress.fullName || customer.name,
                        phone: shippingAddress.phone || customer.phone,
                        addressLine1: shippingAddress.addressLine1,
                        addressLine2: shippingAddress.addressLine2 || '',
                        city: shippingAddress.city || 'Srinagar',
                        state: shippingAddress.state || 'Jammu & Kashmir',
                        pincode: shippingAddress.pincode || '190001',
                        isDefault: addresses.length === 0,
                    };
                    if (customer.addresses) {
                        customer.addresses.push(newAddr);
                    }
                    if (typeof customer.save === 'function') {
                        await customer.save().catch(() => {});
                    }
                }
            }
            const customerObj = typeof customer.toObject === 'function' ? customer.toObject() : customer;
            delete customerObj.password;
            return { customer: customerObj, isNew: false };
        }

        // If not found and not requested to create, return null
        if (!createIfNotFound) {
            return { customer: null, isNew: true };
        }

        // 4. Auto-create guest customer account (with clean, random password)
        const guestName = fullName || 'Guest Customer';
        const guestEmail = cleanEmail || `guest_${Date.now()}@kashbites.in`;
        const guestPhone = cleanPhone || '+91 98765 43210';
        const generatedPassword = `KB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        const initialAddresses = [];
        if (shippingAddress && shippingAddress.addressLine1) {
            initialAddresses.push({
                id: `addr-${Date.now()}`,
                label: 'Home Delivery',
                fullName: guestName,
                phone: guestPhone,
                addressLine1: shippingAddress.addressLine1,
                addressLine2: shippingAddress.addressLine2 || '',
                city: shippingAddress.city || 'Srinagar',
                state: shippingAddress.state || 'Jammu & Kashmir',
                pincode: shippingAddress.pincode || '190001',
                isDefault: true,
            });
        }

        const newCustomerData = {
            name: guestName,
            email: guestEmail,
            phone: guestPhone,
            password: generatedPassword,
            role: 'member',
            memberTier: 'Chinar Club Member',
            chinarPoints: 100,
            addresses: initialAddresses,
            notifications: {
                smsAlerts: true,
                whatsappAlerts: true,
                harvestNewsletter: true,
            },
            createdAt: new Date().toISOString(),
        };

        if (mongoose.connection.readyState === 1) {
            try {
                const created = await User.create(newCustomerData);
                const createdObj = created.toObject();
                delete createdObj.password;
                usersStore.push(createdObj);
                return { customer: createdObj, isNew: true, rawPassword: generatedPassword };
            } catch (err) {
                console.warn('[OrderService] Note creating guest user in DB:', err.message);
            }
        }

        const fallbackCustomer = {
            _id: `usr-${Date.now()}`,
            ...newCustomerData,
        };
        usersStore.push(fallbackCustomer);
        const { password: _, ...safeCustomer } = fallbackCustomer;
        return { customer: safeCustomer, isNew: true, rawPassword: generatedPassword };
    }

    /**
     * Place order (Direct / COD flow)
     */
    static async create({ items, shippingAddress, paymentMethod = 'COD', couponCode, source = 'cart', authenticatedUserId = null }) {
        if (!items || !items.length || !shippingAddress || !shippingAddress.fullName) {
            throw ApiError.badRequest('Incomplete order payload: items and shippingAddress are required');
        }

        // 1. Validate items and recalculate server-side prices
        const { validatedItems, subtotal, shippingFee } = await OrderService.validateAndPriceItems({ items });

        // 2. Identify or auto-create customer
        const { customer, isNew, rawPassword } = await OrderService.findOrCreateCustomer({
            fullName: shippingAddress.fullName,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            shippingAddress,
            authenticatedUserId,
            createIfNotFound: true,
        });

        // 3. Server-side discount calculation
        const discount = OrderService.calculateCouponDiscount(couponCode, subtotal);
        const total = Math.max(0, subtotal + shippingFee - discount);

        if (couponCode && discount > 0) {
            const usedCoupon = couponsStore.find((c) => c.code === String(couponCode).trim().toUpperCase());
            if (usedCoupon) usedCoupon.usageCount += 1;
        }

        const isOnline = paymentMethod === 'ONLINE' || paymentMethod === 'CARD' || paymentMethod === 'UPI';
        const finalPaymentMethod = isOnline ? 'ONLINE' : 'COD';
        const finalPaymentStatus = isOnline ? 'Paid' : 'Pending';

        const orderNumber = `KB-${Math.floor(10000 + Math.random() * 90000)}`;
        const newOrder = {
            orderNumber,
            items: validatedItems,
            shippingAddress: {
                fullName: shippingAddress.fullName,
                phone: shippingAddress.phone,
                email: shippingAddress.email || customer.email,
                addressLine1: shippingAddress.addressLine1,
                addressLine2: shippingAddress.addressLine2 || '',
                city: shippingAddress.city,
                state: shippingAddress.state,
                pincode: shippingAddress.pincode,
            },
            customerId: customer._id ? String(customer._id) : undefined,
            customerEmail: shippingAddress.email || customer.email,
            customerPhone: shippingAddress.phone || customer.phone,
            paymentMethod: finalPaymentMethod,
            paymentStatus: finalPaymentStatus,
            orderStatus: 'Confirmed',
            trackingNumber: '',
            courierName: shippingConfigStore.isEnabled ? shippingConfigStore.providerName : '',
            webhookSynced: false,
            checkoutSource: source || 'cart',
            statusHistory: [
                {
                    status: 'Confirmed',
                    note: finalPaymentMethod === 'COD'
                        ? 'Order placed with Cash on Delivery, scheduled for Srinagar Cold-Packing'
                        : 'Order placed with confirmed payment, scheduled for Srinagar Cold-Packing',
                    updatedBy: 'Checkout',
                    timestamp: new Date().toISOString(),
                },
            ],
            subtotal,
            shippingFee,
            discount,
            total,
            createdAt: new Date().toISOString(),
        };

        if (shippingConfigStore.isEnabled && shippingConfigStore.autoPushOnNewOrder) {
            await dispatchOutboundOrderWebhook(newOrder).catch((err) =>
                console.warn('[OrderService] Outbound webhook note:', err.message)
            );
        }

        // Asynchronously dispatch confirmation email via SMTP queue
        dispatchOrderConfirmationEmail(newOrder).catch((err) =>
            console.warn('[OrderService] Order confirmation email queue note:', err.message)
        );

        // If a guest account was newly created on the go for this order, dispatch login credentials email
        if (isNew && rawPassword && (customer.email || shippingAddress.email)) {
            dispatchAccountCredentialsEmail({
                user: {
                    ...customer,
                    name: customer.name || shippingAddress.fullName,
                    email: customer.email || shippingAddress.email,
                },
                rawPassword,
            }).catch((err) =>
                console.warn('[OrderService] Account credentials email dispatch note:', err.message)
            );
        }

        ordersStore.unshift(newOrder);

        if (mongoose.connection.readyState === 1) {
            const created = await Order.create(newOrder);
            return created.toObject();
        }

        return newOrder;
    }

    /**
     * Step 1 & 2: Initiate Razorpay Checkout and generate Temporary Order
     */
    static async createRazorpayOrder({ items, shippingAddress, couponCode, source = 'cart', authenticatedUserId = null }) {
        if (!items || !items.length || !shippingAddress || !shippingAddress.fullName) {
            throw ApiError.badRequest('Incomplete checkout payload: items and shippingAddress are required');
        }

        // 1. Server-side validation of products and price recalculation
        const { validatedItems, subtotal, shippingFee } = await OrderService.validateAndPriceItems({ items });

        // 2. Identify existing customer record if present (do not create guest account until order is paid/confirmed)
        const { customer } = await OrderService.findOrCreateCustomer({
            fullName: shippingAddress.fullName,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            shippingAddress,
            authenticatedUserId,
            createIfNotFound: false,
        });

        // 3. Calculate coupon discount server-side
        const discount = OrderService.calculateCouponDiscount(couponCode, subtotal);
        const total = Math.max(0, subtotal + shippingFee - discount);

        // 4. Create Razorpay order via Razorpay SDK
        const temporaryOrderId = `TMP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const amountInPaise = Math.round(total * 100);

        let rzpOrder;
        try {
            const rzp = getRazorpayClient();
            rzpOrder = await rzp.orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt: temporaryOrderId,
                notes: {
                    temporaryOrderId,
                    customerName: shippingAddress.fullName,
                    customerEmail: shippingAddress.email || customer?.email,
                    customerPhone: shippingAddress.phone || customer?.phone,
                    source: source || 'cart',
                },
            });
        } catch (rzpErr) {
            console.error('[Razorpay Order Creation Error]:', rzpErr?.error || rzpErr?.message || rzpErr);
            throw ApiError.badRequest(`Failed to initialize payment with Razorpay: ${rzpErr?.error?.description || rzpErr.message}`);
        }

        // 5. Store temporary order record
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiration
        const tempOrderData = {
            temporaryOrderId,
            razorpayOrderId: rzpOrder.id,
            customer: {
                userId: customer?._id ? String(customer._id) : undefined,
                fullName: shippingAddress.fullName,
                email: shippingAddress.email || customer?.email,
                phone: shippingAddress.phone || customer?.phone,
                isGuest: !customer?._id,
            },
            items: validatedItems,
            shippingAddress: {
                fullName: shippingAddress.fullName,
                phone: shippingAddress.phone,
                email: shippingAddress.email || customer?.email,
                addressLine1: shippingAddress.addressLine1,
                addressLine2: shippingAddress.addressLine2 || '',
                city: shippingAddress.city,
                state: shippingAddress.state,
                pincode: shippingAddress.pincode,
            },
            subtotal,
            shippingFee,
            discount,
            total,
            couponCode: couponCode || '',
            source: source || 'cart',
            status: 'pending',
            expiresAt,
            createdAt: new Date().toISOString(),
        };

        temporaryOrdersStore.unshift(tempOrderData);

        if (mongoose.connection.readyState === 1) {
            try {
                await TemporaryOrder.create(tempOrderData);
            } catch (dbErr) {
                console.warn('[OrderService] TemporaryOrder DB note:', dbErr.message);
            }
        }

        return {
            temporaryOrderId,
            razorpayOrderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            keyId: appConfig.RAZORPAY_KEY_ID,
            orderSummary: {
                subtotal,
                shippingFee,
                discount,
                total,
                itemsCount: validatedItems.length,
            },
            customer: {
                fullName: shippingAddress.fullName,
                email: shippingAddress.email || customer.email,
                phone: shippingAddress.phone || customer.phone,
            },
            source: source || 'cart',
        };
    }

    /**
     * Convert temporary order to confirmed actual order (Atomic & Idempotent)
     */
    static async convertTemporaryOrderToActual({ tempOrder, razorpayPaymentId, razorpaySignature }) {
        // Idempotency: If already converted, return existing order
        if (tempOrder.status === 'converted' && tempOrder.convertedOrderNumber) {
            const existingOrder = await OrderService.getById({ id: tempOrder.convertedOrderNumber });
            return existingOrder;
        }

        // If customer was a guest without an account, create account on the fly now that payment succeeded
        let customerId = tempOrder.customer?.userId;
        if (!customerId) {
            const { customer, isNew, rawPassword } = await OrderService.findOrCreateCustomer({
                fullName: tempOrder.shippingAddress?.fullName || tempOrder.customer?.fullName,
                email: tempOrder.shippingAddress?.email || tempOrder.customer?.email,
                phone: tempOrder.shippingAddress?.phone || tempOrder.customer?.phone,
                shippingAddress: tempOrder.shippingAddress,
                createIfNotFound: true,
            });
            if (customer?._id) {
                customerId = String(customer._id);
            }
            if (isNew && rawPassword) {
                dispatchAccountCredentialsEmail({
                    user: {
                        ...customer,
                        name: customer?.name || tempOrder.shippingAddress?.fullName || tempOrder.customer?.fullName,
                        email: customer?.email || tempOrder.shippingAddress?.email || tempOrder.customer?.email,
                    },
                    rawPassword,
                }).catch((err) =>
                    console.warn('[OrderService] Account credentials email dispatch note:', err.message)
                );
            }
        }

        const orderNumber = `KB-${Math.floor(10000 + Math.random() * 90000)}`;
        const actualOrder = {
            orderNumber,
            items: tempOrder.items,
            shippingAddress: tempOrder.shippingAddress,
            customerId,
            customerEmail: tempOrder.customer?.email || tempOrder.shippingAddress?.email,
            customerPhone: tempOrder.customer?.phone || tempOrder.shippingAddress?.phone,
            paymentMethod: 'ONLINE',
            paymentStatus: 'Paid',
            orderStatus: 'Confirmed',
            trackingNumber: '',
            courierName: shippingConfigStore.isEnabled ? shippingConfigStore.providerName : '',
            webhookSynced: false,
            razorpayOrderId: tempOrder.razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId || tempOrder.razorpayPaymentId,
            razorpaySignature: razorpaySignature || tempOrder.razorpaySignature,
            temporaryOrderId: tempOrder.temporaryOrderId,
            checkoutSource: tempOrder.source || 'cart',
            statusHistory: [
                {
                    status: 'Confirmed',
                    note: `Online payment received & verified via Razorpay (${razorpayPaymentId || tempOrder.razorpayPaymentId})`,
                    updatedBy: 'Razorpay Payment Gateway',
                    timestamp: new Date().toISOString(),
                },
            ],
            subtotal: tempOrder.subtotal,
            shippingFee: tempOrder.shippingFee,
            discount: tempOrder.discount,
            total: tempOrder.total,
            createdAt: new Date().toISOString(),
        };

        // Increment coupon count if coupon was applied
        if (tempOrder.couponCode && tempOrder.discount > 0) {
            const usedCoupon = couponsStore.find((c) => c.code === String(tempOrder.couponCode).trim().toUpperCase());
            if (usedCoupon) usedCoupon.usageCount += 1;
        }

        // Dispatch outbound webhook for logistics
        if (shippingConfigStore.isEnabled && shippingConfigStore.autoPushOnNewOrder) {
            await dispatchOutboundOrderWebhook(actualOrder).catch((err) =>
                console.warn('[OrderService] Outbound logistics webhook note:', err.message)
            );
        }

        // Asynchronously dispatch order confirmation & payment receipt emails via SMTP queue
        dispatchOrderConfirmationEmail(actualOrder).catch((err) =>
            console.warn('[OrderService] Order confirmation email queue note:', err.message)
        );
        dispatchPaymentSuccessEmail(actualOrder, { paymentId: actualOrder.razorpayPaymentId }).catch((err) =>
            console.warn('[OrderService] Payment receipt email queue note:', err.message)
        );

        // Mark temporary order converted
        tempOrder.status = 'converted';
        tempOrder.convertedOrderNumber = orderNumber;
        tempOrder.razorpayPaymentId = razorpayPaymentId || tempOrder.razorpayPaymentId;
        tempOrder.razorpaySignature = razorpaySignature || tempOrder.razorpaySignature;

        if (mongoose.connection.readyState === 1) {
            await TemporaryOrder.updateOne(
                { temporaryOrderId: tempOrder.temporaryOrderId },
                {
                    $set: {
                        status: 'converted',
                        convertedOrderNumber: orderNumber,
                        razorpayPaymentId: tempOrder.razorpayPaymentId,
                        razorpaySignature: tempOrder.razorpaySignature,
                    },
                }
            ).catch((err) => console.warn('[OrderService] Temp order update note:', err.message));
        }

        ordersStore.unshift(actualOrder);

        if (mongoose.connection.readyState === 1) {
            const created = await Order.create(actualOrder);
            return created.toObject();
        }

        return actualOrder;
    }

    /**
     * Step 4 & 5: Verify Razorpay Payment Signature and convert Temporary Order
     */
    static async verifyRazorpayPayment({ temporaryOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
        if (!razorpayPaymentId || !razorpaySignature) {
            throw ApiError.badRequest('Missing Razorpay payment ID or signature');
        }

        // 1. Find temporary order
        let tempOrder = null;
        if (mongoose.connection.readyState === 1) {
            const query = [];
            if (temporaryOrderId) query.push({ temporaryOrderId });
            if (razorpayOrderId) query.push({ razorpayOrderId });
            if (query.length > 0) {
                tempOrder = await TemporaryOrder.findOne({ $or: query });
            }
        }

        if (!tempOrder) {
            tempOrder = temporaryOrdersStore.find(
                (t) =>
                    (temporaryOrderId && t.temporaryOrderId === temporaryOrderId) ||
                    (razorpayOrderId && t.razorpayOrderId === razorpayOrderId)
            );
        }

        if (!tempOrder) {
            throw ApiError.notFound('Temporary order session not found');
        }

        // 2. Check if already converted (idempotent duplicate request handling)
        if (tempOrder.status === 'converted' && tempOrder.convertedOrderNumber) {
            const existing = await OrderService.getById({ id: tempOrder.convertedOrderNumber });
            return {
                order: existing,
                source: tempOrder.source || 'cart',
                alreadyProcessed: true,
                message: 'Payment already verified and converted into order',
            };
        }

        // 3. Server-side HMAC SHA256 Signature Verification
        const rzpOrderId = razorpayOrderId || tempOrder.razorpayOrderId;
        const payloadToSign = `${rzpOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', appConfig.RAZORPAY_KEY_SECRET)
            .update(payloadToSign)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            tempOrder.status = 'failed';
            tempOrder.failureReason = 'Cryptographic signature mismatch';
            if (mongoose.connection.readyState === 1) {
                await TemporaryOrder.updateOne(
                    { temporaryOrderId: tempOrder.temporaryOrderId },
                    { $set: { status: 'failed', failureReason: 'Cryptographic signature mismatch' } }
                ).catch(() => {});
            }
            throw ApiError.badRequest('Invalid payment signature verification failed');
        }

        // 4. Convert to actual Order
        const confirmedOrder = await OrderService.convertTemporaryOrderToActual({
            tempOrder,
            razorpayPaymentId,
            razorpaySignature,
        });

        return {
            order: confirmedOrder,
            source: tempOrder.source || 'cart',
            alreadyProcessed: false,
            message: 'Payment verified and order confirmed successfully',
        };
    }

    /**
     * Handle incoming official Razorpay Webhooks
     */
    static async handleRazorpayWebhook({ rawBody, signature, event }) {
        if (!signature) {
            throw ApiError.unauthorized('Missing Razorpay webhook signature header');
        }

        // 1. Verify webhook signature using raw body buffer and configured webhook secret
        const expectedSignature = crypto
            .createHmac('sha256', appConfig.RAZORPAY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('hex');

        if (expectedSignature !== signature) {
            throw ApiError.badRequest('Invalid webhook signature');
        }

        const eventType = event?.event;
        const payload = event?.payload;

        console.log(`[Razorpay Webhook] Received event: ${eventType}`);

        if (eventType === 'order.paid' || eventType === 'payment.captured') {
            const paymentEntity = payload?.payment?.entity;
            const rzpOrderId = paymentEntity?.order_id || payload?.order?.entity?.id;
            const rzpPaymentId = paymentEntity?.id;

            if (rzpOrderId) {
                let tempOrder = null;
                if (mongoose.connection.readyState === 1) {
                    tempOrder = await TemporaryOrder.findOne({ razorpayOrderId: rzpOrderId });
                }
                if (!tempOrder) {
                    tempOrder = temporaryOrdersStore.find((t) => t.razorpayOrderId === rzpOrderId);
                }

                if (tempOrder) {
                    if (tempOrder.status !== 'converted') {
                        await OrderService.convertTemporaryOrderToActual({
                            tempOrder,
                            razorpayPaymentId: rzpPaymentId,
                            razorpaySignature: 'webhook_verified',
                        });
                        console.log(`[Razorpay Webhook] Converted temp order ${tempOrder.temporaryOrderId} via ${eventType}`);
                    } else {
                        console.log(`[Razorpay Webhook] Temp order ${tempOrder.temporaryOrderId} already converted`);
                    }
                } else {
                    console.warn(`[Razorpay Webhook] No matching temporary order found for Razorpay order ${rzpOrderId}`);
                }
            }
        } else if (eventType === 'payment.failed') {
            const paymentEntity = payload?.payment?.entity;
            const rzpOrderId = paymentEntity?.order_id;
            const failureReason = paymentEntity?.error_description || 'Payment failed';

            if (rzpOrderId) {
                let tempOrder = null;
                if (mongoose.connection.readyState === 1) {
                    tempOrder = await TemporaryOrder.findOne({ razorpayOrderId: rzpOrderId });
                }
                if (!tempOrder) {
                    tempOrder = temporaryOrdersStore.find((t) => t.razorpayOrderId === rzpOrderId);
                }

                if (tempOrder && tempOrder.status !== 'converted') {
                    tempOrder.status = 'failed';
                    tempOrder.failureReason = failureReason;
                    if (mongoose.connection.readyState === 1) {
                        await TemporaryOrder.updateOne(
                            { razorpayOrderId: rzpOrderId },
                            { $set: { status: 'failed', failureReason } }
                        ).catch(() => {});
                    }
                    console.log(`[Razorpay Webhook] Marked temp order ${tempOrder.temporaryOrderId} as failed: ${failureReason}`);
                }
            }
        }

        return { received: true, event: eventType };
    }

    /**
     * Cancel or abandon temporary order (e.g. user dismissed modal)
     */
    static async cancelTemporaryOrder({ temporaryOrderId, reason = 'Customer cancelled checkout' }) {
        if (!temporaryOrderId) {
            throw ApiError.badRequest('temporaryOrderId is required');
        }

        let tempOrder = null;
        if (mongoose.connection.readyState === 1) {
            tempOrder = await TemporaryOrder.findOne({ temporaryOrderId });
        }
        if (!tempOrder) {
            tempOrder = temporaryOrdersStore.find((t) => t.temporaryOrderId === temporaryOrderId);
        }

        if (!tempOrder) {
            throw ApiError.notFound('Temporary order not found');
        }

        if (tempOrder.status === 'converted') {
            return { temporaryOrderId, status: 'converted', message: 'Order is already converted' };
        }

        tempOrder.status = 'cancelled';
        tempOrder.failureReason = reason;

        if (mongoose.connection.readyState === 1) {
            await TemporaryOrder.updateOne(
                { temporaryOrderId },
                { $set: { status: 'cancelled', failureReason: reason } }
            ).catch(() => {});
        }

        return { temporaryOrderId, status: 'cancelled' };
    }

    /**
     * Retrieve status of a temporary order (for polling / guest recovery)
     */
    static async getTemporaryOrderStatus({ temporaryOrderId }) {
        if (!temporaryOrderId) {
            throw ApiError.badRequest('temporaryOrderId is required');
        }

        let tempOrder = null;
        if (mongoose.connection.readyState === 1) {
            tempOrder = await TemporaryOrder.findOne({ temporaryOrderId }).lean();
        }
        if (!tempOrder) {
            tempOrder = temporaryOrdersStore.find((t) => t.temporaryOrderId === temporaryOrderId);
        }

        if (!tempOrder) {
            throw ApiError.notFound('Temporary order not found');
        }

        let actualOrder = null;
        if (tempOrder.status === 'converted' && tempOrder.convertedOrderNumber) {
            actualOrder = await OrderService.getById({ id: tempOrder.convertedOrderNumber });
        }

        return {
            temporaryOrderId: tempOrder.temporaryOrderId,
            razorpayOrderId: tempOrder.razorpayOrderId,
            status: tempOrder.status,
            source: tempOrder.source,
            expiresAt: tempOrder.expiresAt,
            convertedOrderNumber: tempOrder.convertedOrderNumber || null,
            order: actualOrder,
            failureReason: tempOrder.failureReason || null,
        };
    }

    /**
     * Periodic cron cleanup for expired temporary orders
     */
    static async cleanupExpiredTemporaryOrders() {
        const now = new Date();
        let expiredCount = 0;

        // 1. In-memory store cleanup
        for (const temp of temporaryOrdersStore) {
            if (temp.status === 'pending' && new Date(temp.expiresAt).getTime() < now.getTime()) {
                temp.status = 'expired';
                expiredCount += 1;
            }
        }

        // 2. MongoDB cleanup
        if (mongoose.connection.readyState === 1) {
            const res = await TemporaryOrder.updateMany(
                { status: 'pending', expiresAt: { $lt: now } },
                { $set: { status: 'expired' } }
            );
            expiredCount += res.modifiedCount || 0;
        }

        return { expiredCount };
    }

    /**
     * Retrieve order by orderNumber or ID
     */
    static async getById({ id }) {
        if (!id) {
            throw ApiError.badRequest('Order ID is required');
        }

        if (mongoose.connection.readyState === 1) {
            const order = await Order.findOne({
                $or: [
                    { orderNumber: id },
                    ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])
                ]
            }).lean();
            if (order) return order;
        }

        const order = ordersStore.find((o) => o.orderNumber === id || o._id === id);
        if (!order) {
            throw ApiError.notFound('Order tracking ID not found');
        }

        return order;
    }

    /**
     * List customer orders
     */
    static async list({ customerId, customerEmail } = {}) {
        if (mongoose.connection.readyState === 1) {
            const query = {};
            if (customerId) query.customerId = customerId;
            if (customerEmail) query.customerEmail = customerEmail.toLowerCase().trim();

            const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
            if (orders.length > 0) {
                return orders;
            }
        }

        if (customerId || customerEmail) {
            return ordersStore.filter((o) =>
                (customerId && o.customerId === customerId) ||
                (customerEmail && o.customerEmail?.toLowerCase() === customerEmail.toLowerCase().trim())
            );
        }

        return ordersStore;
    }
}

export default OrderService;
