import mongoose, { Schema } from 'mongoose';
const CategorySchema = new Schema({
    id: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
}, { timestamps: true });
export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
