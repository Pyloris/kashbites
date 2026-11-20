import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  name: string;
  description: string;
}

const CategorySchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Category =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
