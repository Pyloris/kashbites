import { Review } from '../models/Review.js';
import { reviewsStore } from '../data/store.js';
import mongoose from 'mongoose';
export const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        if (mongoose.connection.readyState === 1) {
            const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
            if (reviews.length > 0) {
                return res.json({ success: true, count: reviews.length, data: reviews });
            }
        }
        const reviews = reviewsStore.filter((r) => r.productId === productId);
        res.json({ success: true, count: reviews.length, data: reviews });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve reviews' });
    }
};
export const createReview = async (req, res) => {
    try {
        const { productId, author, location, rating, title, comment, images } = req.body;
        if (!productId || !author || !rating || !title || !comment) {
            return res.status(400).json({ success: false, message: 'Missing review fields' });
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
            return res.status(201).json({ success: true, data: saved });
        }
        reviewsStore.unshift({
            _id: `rev-${Date.now()}`,
            ...reviewData,
        });
        res.status(201).json({ success: true, data: reviewsStore[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to submit review' });
    }
};
