import { Router } from 'express';
import { OrderController } from '../../controllers/order.controller.js';
import { optionalAuth } from '../../middleware/auth/index.js';

const router = Router();

// Checkout & Order creation
router.post('/', optionalAuth, OrderController.createOrder);

// Razorpay Online Payment Flow
router.post('/razorpay/create-order', optionalAuth, OrderController.createRazorpayOrder);
router.post('/razorpay/verify-payment', optionalAuth, OrderController.verifyRazorpayPayment);
router.post('/razorpay/cancel', optionalAuth, OrderController.cancelTemporaryOrder);
router.post('/webhook/razorpay', OrderController.handleRazorpayWebhook);

// Temporary Order status tracking (guest & recovery)
router.get('/temporary/:id', OrderController.getTemporaryOrderStatus);

// Order tracking & listing
router.get('/', optionalAuth, OrderController.getAllOrders);
router.get('/:id', OrderController.getOrderById);

// Coupon validation
router.post('/validate-coupon', OrderController.validateCoupon);

export default router;
