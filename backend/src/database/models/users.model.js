import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['member'], default: 'member' },
    avatar: { type: String },
    memberTier: { type: String, default: 'Chinar Gold Member' },
    chinarPoints: { type: Number, default: 250 },
    addresses: [
        {
            id: { type: String, required: true },
            label: { type: String, default: 'Home' },
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            addressLine1: { type: String, required: true },
            addressLine2: { type: String },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            isDefault: { type: Boolean, default: false },
        },
    ],
    notifications: {
        smsAlerts: { type: Boolean, default: true },
        whatsappAlerts: { type: Boolean, default: true },
        harvestNewsletter: { type: Boolean, default: true },
    },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
