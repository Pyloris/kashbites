import { catchError } from '../errors/catch-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { ReviewService } from '../services/review.service.js';

export class ReviewController {
    static getReviewsByProduct = catchError(async (req, res) => {
        const { productId } = req.params;
        const reviews = await ReviewService.getByProductId({ productId });
        return ApiResponse.success(res, reviews, 'Reviews retrieved successfully');
    });

    static createReview = catchError(async (req, res) => {
        const { productId, author, location, rating, title, comment, images } = req.body;
        const review = await ReviewService.create({
            productId,
            author,
            location,
            rating,
            title,
            comment,
            images,
        });
        return ApiResponse.created(res, review, 'Review submitted successfully');
    });
}

// Named exports for backward compatibility
export const getReviewsByProduct = ReviewController.getReviewsByProduct;
export const createReview = ReviewController.createReview;

export default ReviewController;
