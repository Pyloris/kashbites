import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  avatar?: string;
  memberTier: string;
  chinarPoints: number;
  addresses: IUserAddress[];
  notifications: {
    smsAlerts: boolean;
    whatsappAlerts: boolean;
    harvestNewsletter: boolean;
  };
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
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
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
