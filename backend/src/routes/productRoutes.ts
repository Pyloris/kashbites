import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  getCategories,
  getFeaturedCombos,
  getActiveOffers,
} from '../controllers/productController.js';

const router = Router();

router.get('/products', getAllProducts);
router.get('/products/combos', getFeaturedCombos);
router.get('/products/categories', getCategories);
router.get('/products/offers', getActiveOffers);
router.get('/products/:id', getProductById);

export default router;

