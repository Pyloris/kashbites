import { Router } from 'express';
import { OrderController } from '../../controllers/order.controller.js';

const router = Router();

router.post('/', OrderController.createOrder);
router.get('/', OrderController.getAllOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/validate-coupon', OrderController.validateCoupon);

export default router;
