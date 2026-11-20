import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  expiryDate: string;
  usageCount: number;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['PERCENTAGE', 'FLAT'], default: 'PERCENTAGE' },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    isActive: { type: Boolean, default: true },
    expiryDate: { type: String, required: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Coupon = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
