import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  weight: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: 'COD' | 'UPI' | 'CARD';
  paymentStatus: 'Pending' | 'Paid' | 'Processing' | 'Refunded';
  orderStatus: 'Confirmed' | 'Srinagar Cold-Packing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  courierName?: string;
  webhookSynced?: boolean;
  statusHistory?: Array<{
    status: string;
    note: string;
    updatedBy: string;
    timestamp: string;
  }>;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        weight: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ['COD', 'UPI', 'CARD'], default: 'COD' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Processing', 'Refunded'], default: 'Pending' },
    orderStatus: {
      type: String,
      enum: ['Confirmed', 'Srinagar Cold-Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Confirmed',
    },
    trackingNumber: { type: String },
    courierName: { type: String },
    webhookSynced: { type: Boolean, default: false },
    statusHistory: [
      {
        status: { type: String },
        note: { type: String },
        updatedBy: { type: String },
        timestamp: { type: String },
      },
    ],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
