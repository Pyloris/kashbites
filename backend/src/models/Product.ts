import mongoose, { Schema, Document } from 'mongoose';

export interface IProductWeight {
  weight: string;
  price: number;
  inStock: boolean;
  stockQuantity?: number;
}

export interface INutritionInfo {
  calories: string;
  protein: string;
  healthyFats: string;
  carbs: string;
  fiber: string;
}

export interface ICertificate {
  certificateNumber: string;
  issuedBy: string;
  labTestDate: string;
  purityScore: string;
  moistureLevel: string;
  aflatoxinStatus: string;
  originDistrict: string;
  harvestSeason: string;
}

export interface IPackagingVideo {
  title: string;
  duration: string;
  thumbnail: string;
  facilityLocation: string;
  cleanlinessStandard: string;
  steps: string[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  images: string[];
  netWeights: IProductWeight[];
  nutrition: INutritionInfo;
  certificate: ICertificate;
  packagingVideo: IPackagingVideo;
  badges: string[];
  featured: boolean;
  isCombo: boolean;
  inStock: boolean;
  stockQuantity?: number;
  promotionalOfferTag?: string;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    images: [{ type: String }],
    netWeights: [
      {
        weight: { type: String, required: true },
        price: { type: Number, required: true },
        inStock: { type: Boolean, default: true },
        stockQuantity: { type: Number, default: 50 },
      },
    ],
    nutrition: {
      calories: { type: String },
      protein: { type: String },
      healthyFats: { type: String },
      carbs: { type: String },
      fiber: { type: String },
    },
    certificate: {
      certificateNumber: { type: String },
      issuedBy: { type: String },
      labTestDate: { type: String },
      purityScore: { type: String },
      moistureLevel: { type: String },
      aflatoxinStatus: { type: String },
      originDistrict: { type: String },
      harvestSeason: { type: String },
    },
    packagingVideo: {
      title: { type: String },
      duration: { type: String },
      thumbnail: { type: String },
      facilityLocation: { type: String },
      cleanlinessStandard: { type: String },
      steps: [{ type: String }],
    },
    badges: [{ type: String }],
    featured: { type: Boolean, default: false },
    isCombo: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 120 },
    promotionalOfferTag: { type: String },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
