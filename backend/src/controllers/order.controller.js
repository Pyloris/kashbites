import { catchError } from '../errors/catch-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { OrderService } from '../services/order.service.js';

export class OrderController {
    static validateCoupon = catchError(async (req, res) => {
        const { code, subtotal = 1000 } = req.body;
        const result = await OrderService.validateCoupon({ code, subtotal });
        return ApiResponse.success(res, result, 'Coupon validated successfully');
    });

    static createOrder = catchError(async (req, res) => {
        const { items, shippingAddress, paymentMethod, couponCode } = req.body;
        const order = await OrderService.create({ items, shippingAddress, paymentMethod, couponCode });
        return ApiResponse.created(res, order, 'Order created successfully');
    });

    static getOrderById = catchError(async (req, res) => {
        const { id } = req.params;
        const order = await OrderService.getById({ id });
        return ApiResponse.success(res, order, 'Order retrieved successfully');
    });

    static getAllOrders = catchError(async (_req, res) => {
        const orders = await OrderService.list();
        return ApiResponse.success(res, orders, 'Orders retrieved successfully');
    });
}

// Named exports for backward compatibility
export const validateCoupon = OrderController.validateCoupon;
export const createOrder = OrderController.createOrder;
export const getOrderById = OrderController.getOrderById;
export const getAllOrders = OrderController.getAllOrders;
export const calculateCouponDiscount = OrderService.calculateCouponDiscount;

export default OrderController;
