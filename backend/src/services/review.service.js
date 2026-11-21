import { Review } from '../database/models/reviews.model.js';
import { reviewsStore } from '../data/store.js';
import { ApiError } from '../errors/api-error.js';
import mongoose from 'mongoose';

export class ReviewService {
    static async getByProductId({ productId }) {
        if (!productId) {
            throw ApiError.badRequest('Product ID is required');
        }

        if (mongoose.connection.readyState === 1) {
            let targetId = productId;
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                const Product = mongoose.models.Product;
                if (Product) {
                    const prod = await Product.findOne({ slug: productId }).lean();
                    if (prod) targetId = prod._id.toString();
                }
            }
            const reviews = await Review.find({ $or: [{ productId: targetId }, { productId }] }).sort({ createdAt: -1 }).lean();
            if (reviews.length > 0) {
                return reviews;
            }
        }

        return reviewsStore.filter((r) => r.productId === productId);
    }

    static async create({ productId, author, location, rating, title, comment, images }) {
        if (!productId || !author || !rating || !title || !comment) {
            throw ApiError.badRequest('Missing review fields');
        }

        const reviewData = {
            productId,
            author,
            location: location || 'Customer',
            rating: Number(rating),
            title,
            comment,
            images: Array.isArray(images) ? images : [],
            verifiedBuyer: true,
            date: 'Just now',
        };

        if (mongoose.connection.readyState === 1) {
            const saved = await Review.create(reviewData);
            return saved.toObject();
        }

        const created = {
            _id: `rev-${Date.now()}`,
            ...reviewData,
        };
        reviewsStore.unshift(created);
        return created;
    }
}

export default ReviewService;
