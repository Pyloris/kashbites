import mongoose, { Schema } from 'mongoose';

const CouponSchema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['PERCENTAGE', 'FLAT'], default: 'PERCENTAGE' },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    isActive: { type: Boolean, default: true },
    expiryDate: { type: String, required: true },
    usageCount: { type: Number, default: 0 },
}, { timestamps: true });

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

export default Coupon;
