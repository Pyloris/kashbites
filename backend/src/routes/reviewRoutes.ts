import { Router } from 'express';
import { getReviewsByProduct, createReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/reviews/:productId', getReviewsByProduct);
router.post('/reviews', createReview);

export default router;
