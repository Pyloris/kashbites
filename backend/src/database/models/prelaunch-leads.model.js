import mongoose, { Schema } from 'mongoose';

const PrelaunchLeadSchema = new Schema(
    {
        phone: { type: String, required: true, trim: true, index: true },
        countryCode: { type: String, default: '+91' },
        name: { type: String, trim: true, default: '' },
        source: { type: String, default: 'launching_screen' },
        couponCode: { type: String, default: 'KASHLAUNCH20' },
        ipAddress: { type: String, default: '' },
        userAgent: { type: String, default: '' },
        status: { type: String, enum: ['pending', 'notified', 'converted'], default: 'pending' },
    },
    { timestamps: true }
);

export const PrelaunchLead =
    mongoose.models.PrelaunchLead || mongoose.model('PrelaunchLead', PrelaunchLeadSchema);

export default PrelaunchLead;
