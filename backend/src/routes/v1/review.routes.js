import { Router } from 'express';
import { ReviewController } from '../../controllers/review.controller.js';

const router = Router();

router.get('/:productId', ReviewController.getReviewsByProduct);
router.post('/', ReviewController.createReview);

export default router;
