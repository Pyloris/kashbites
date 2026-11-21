import mongoose, { Schema } from 'mongoose';

const ReviewSchema = new Schema({
    productId: { type: String, required: true },
    author: { type: String, required: true },
    location: { type: String, default: 'India' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    images: [{ type: String }],
    verifiedBuyer: { type: Boolean, default: true },
    date: { type: String, required: true },
}, { timestamps: true });

export const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

export default Review;
