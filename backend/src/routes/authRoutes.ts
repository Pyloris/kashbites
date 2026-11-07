import { Router } from 'express';
import {
  login,
  register,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/authController.js';

const router = Router();

router.post('/auth/login', login);
router.post('/auth/register', register);
router.get('/auth/me', getMe);
router.put('/auth/profile', updateProfile);
router.post('/auth/addresses', addAddress);
router.delete('/auth/addresses/:userId/:addressId', deleteAddress);
router.put('/auth/addresses/:userId/:addressId/default', setDefaultAddress);

export default router;
