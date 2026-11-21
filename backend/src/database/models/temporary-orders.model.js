import mongoose, { Schema } from 'mongoose';

const TemporaryOrderSchema = new Schema({
    temporaryOrderId: { type: String, required: true, unique: true, index: true },
    razorpayOrderId: { type: String, required: true, index: true },
    customer: {
        userId: { type: String },
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
    },
    items: [
        {
            productId: { type: String, required: true },
            name: { type: String, required: true },
            weight: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            image: { type: String },
            slug: { type: String },
        },
    ],
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String },
    source: { type: String, enum: ['cart', 'buy_now'], default: 'cart' },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'cancelled', 'converted', 'expired'],
        default: 'pending',
        index: true,
    },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    failureReason: { type: String },
    convertedOrderNumber: { type: String },
    expiresAt: { type: Date, required: true, index: true },
}, { timestamps: true });

export const TemporaryOrder = mongoose.models.TemporaryOrder || mongoose.model('TemporaryOrder', TemporaryOrderSchema);

export default TemporaryOrder;
