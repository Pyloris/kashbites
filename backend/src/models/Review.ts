import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  productId: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  verifiedBuyer: boolean;
  date: string;
}

const ReviewSchema: Schema = new Schema(
  {
    productId: { type: String, required: true },
    author: { type: String, required: true },
    location: { type: String, default: 'India' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    verifiedBuyer: { type: Boolean, default: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
