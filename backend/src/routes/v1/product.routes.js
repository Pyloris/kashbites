import { Router } from 'express';
import { ProductController } from '../../controllers/product.controller.js';

const router = Router();

router.get('/', ProductController.getAllProducts);
router.get('/combos', ProductController.getFeaturedCombos);
router.get('/categories', ProductController.getCategories);
router.get('/offers', ProductController.getActiveOffers);
router.get('/:id', ProductController.getProductById);

export default router;
