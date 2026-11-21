import mongoose, { Schema } from 'mongoose';

const AdminSchema = new Schema({
    username: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'manager'], default: 'superadmin' },
    lastLogin: { type: String, default: () => new Date().toISOString() },
}, { timestamps: true });

export const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

export default Admin;
