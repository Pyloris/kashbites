import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller.js';
import { auth } from '../../middleware/auth/index.js';

const router = Router();
const memberAuth = auth({ role: ['superadmin', 'member'] });

// Public auth endpoints
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Protected customer account endpoints
router.get('/me', memberAuth, AuthController.getMe);
router.put('/profile', memberAuth, AuthController.updateProfile);
router.post('/addresses', memberAuth, AuthController.addAddress);
router.delete('/addresses/:userId/:addressId', memberAuth, AuthController.deleteAddress);
router.put('/addresses/:userId/:addressId/default', memberAuth, AuthController.setDefaultAddress);

export default router;
