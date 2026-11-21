import { Order } from '../database/models/orders.model.js';
import { ordersStore, couponsStore, shippingConfigStore, dispatchOutboundOrderWebhook } from '../data/store.js';
import { ApiError } from '../errors/api-error.js';
import mongoose from 'mongoose';

export class OrderService {
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

    static async create({ items, shippingAddress, paymentMethod, couponCode }) {
        if (!items || !items.length || !shippingAddress || !shippingAddress.fullName) {
            throw ApiError.badRequest('Incomplete order payload');
        }

        const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const shippingFee = subtotal >= 999 ? 0 : 99;
        const discount = OrderService.calculateCouponDiscount(couponCode, subtotal);
        const total = Math.max(0, subtotal + shippingFee - discount);

        if (couponCode && discount > 0) {
            const usedCoupon = couponsStore.find((c) => c.code === String(couponCode).trim().toUpperCase());
            if (usedCoupon) usedCoupon.usageCount += 1;
        }

        const orderNumber = `KB-${Math.floor(10000 + Math.random() * 90000)}`;
        const newOrder = {
            orderNumber,
            items,
            shippingAddress,
            paymentMethod: paymentMethod || 'COD',
            paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
            orderStatus: 'Confirmed',
            trackingNumber: '',
            courierName: shippingConfigStore.isEnabled ? shippingConfigStore.providerName : '',
            webhookSynced: false,
            statusHistory: [
                {
                    status: 'Confirmed',
                    note: 'Order received and assigned to Srinagar hub',
                    updatedBy: 'Customer Checkout',
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
            await dispatchOutboundOrderWebhook(newOrder);
        }

        ordersStore.unshift(newOrder);

        if (mongoose.connection.readyState === 1) {
            const created = await Order.create(newOrder);
            return created.toObject();
        }

        return newOrder;
    }

    static async getById({ id }) {
        if (!id) {
            throw ApiError.badRequest('Order ID is required');
        }

        if (mongoose.connection.readyState === 1) {
            const order = await Order.findOne({ orderNumber: id }).lean();
            if (order) return order;
        }

        const order = ordersStore.find((o) => o.orderNumber === id);
        if (!order) {
            throw ApiError.notFound('Order tracking ID not found');
        }

        return order;
    }

    static async list() {
        if (mongoose.connection.readyState === 1) {
            const orders = await Order.find().sort({ createdAt: -1 }).lean();
            if (orders.length > 0) {
                return orders;
            }
        }
        return ordersStore;
    }
}

export default OrderService;
