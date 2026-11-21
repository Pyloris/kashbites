import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', AuthController.getMe);
router.put('/profile', AuthController.updateProfile);
router.post('/addresses', AuthController.addAddress);
router.delete('/addresses/:userId/:addressId', AuthController.deleteAddress);
router.put('/addresses/:userId/:addressId/default', AuthController.setDefaultAddress);

export default router;
