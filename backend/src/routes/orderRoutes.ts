import { Router } from 'express';
import { createOrder, getOrderById, getAllOrders } from '../controllers/orderController.js';

const router = Router();

router.post('/orders', createOrder);
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);

export default router;
