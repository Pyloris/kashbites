import { catchError } from '../errors/catch-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { OrderService } from '../services/order.service.js';

export class OrderController {
    /**
     * Validate coupon code against subtotal
     */
    static validateCoupon = catchError(async (req, res) => {
        const { code, subtotal = 1000 } = req.body;
        const result = await OrderService.validateCoupon({ code, subtotal });
        return ApiResponse.success(res, result, 'Coupon validated successfully');
    });

    /**
     * Create order (COD or direct)
     */
    static createOrder = catchError(async (req, res) => {
        const { items, shippingAddress, paymentMethod, couponCode, source = 'cart' } = req.body;
        const order = await OrderService.create({
            items,
            shippingAddress,
            paymentMethod,
            couponCode,
            source,
            authenticatedUserId: req.user?.id,
        });
        return ApiResponse.created(res, order, 'Order created successfully');
    });

    /**
     * Step 1 & 2: Initiate Razorpay Checkout and generate Temporary Order
     */
    static createRazorpayOrder = catchError(async (req, res) => {
        const { items, shippingAddress, couponCode, source = 'cart' } = req.body;
        const result = await OrderService.createRazorpayOrder({
            items,
            shippingAddress,
            couponCode,
            source,
            authenticatedUserId: req.user?.id,
        });
        return ApiResponse.created(res, result, 'Razorpay order created successfully');
    });

    /**
     * Step 4 & 5: Verify Razorpay Payment Signature and convert Temporary Order into confirmed Order
     */
    static verifyRazorpayPayment = catchError(async (req, res) => {
        const { temporaryOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const result = await OrderService.verifyRazorpayPayment({
            temporaryOrderId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        });
        return ApiResponse.success(res, result, 'Payment verified and order confirmed successfully');
    });

    /**
     * Handle incoming official Razorpay Webhooks
     */
    static handleRazorpayWebhook = catchError(async (req, res) => {
        const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
        const signature = req.headers['x-razorpay-signature'];
        const result = await OrderService.handleRazorpayWebhook({
            rawBody,
            signature,
            event: req.body,
        });
        return res.status(200).json(result);
    });

    /**
     * Cancel or abandon temporary order (e.g. customer dismissed modal or cancelled payment)
     */
    static cancelTemporaryOrder = catchError(async (req, res) => {
        const { temporaryOrderId, reason } = req.body;
        const result = await OrderService.cancelTemporaryOrder({ temporaryOrderId, reason });
        return ApiResponse.success(res, result, 'Temporary order cancelled');
    });

    /**
     * Retrieve status of a temporary order (for polling / guest recovery)
     */
    static getTemporaryOrderStatus = catchError(async (req, res) => {
        const { id } = req.params;
        const result = await OrderService.getTemporaryOrderStatus({ temporaryOrderId: id });
        return ApiResponse.success(res, result, 'Temporary order status retrieved successfully');
    });

    /**
     * Get order details by orderNumber or ID
     */
    static getOrderById = catchError(async (req, res) => {
        const { id } = req.params;
        const order = await OrderService.getById({ id });
        return ApiResponse.success(res, order, 'Order retrieved successfully');
    });

    /**
     * List orders
     */
    static getAllOrders = catchError(async (req, res) => {
        const customerId = req.query?.customerId || ((req.user?.role === 'member' || req.user?.role === 'customer') ? req.user.id : undefined);
        const customerEmail = req.query?.email;
        const orders = await OrderService.list({ customerId, customerEmail });
        return ApiResponse.success(res, orders, 'Orders retrieved successfully');
    });
}

// Named exports for backward compatibility
export const validateCoupon = OrderController.validateCoupon;
export const createOrder = OrderController.createOrder;
export const createRazorpayOrder = OrderController.createRazorpayOrder;
export const verifyRazorpayPayment = OrderController.verifyRazorpayPayment;
export const handleRazorpayWebhook = OrderController.handleRazorpayWebhook;
export const cancelTemporaryOrder = OrderController.cancelTemporaryOrder;
export const getTemporaryOrderStatus = OrderController.getTemporaryOrderStatus;
export const getOrderById = OrderController.getOrderById;
export const getAllOrders = OrderController.getAllOrders;
export const calculateCouponDiscount = OrderService.calculateCouponDiscount;

export default OrderController;
