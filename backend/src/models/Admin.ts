import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  username: string;
  password?: string;
  name: string;
  email: string;
  role: 'superadmin' | 'manager';
  lastLogin: string;
}

const AdminSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'manager'], default: 'superadmin' },
    lastLogin: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
