import { Router } from 'express';
import { createOrder, getOrderById, getAllOrders, validateCoupon } from '../controllers/orderController.js';
const router = Router();
router.post('/orders', createOrder);
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.post('/coupons/validate', validateCoupon);
export default router;
