export interface IProductWeight {
  weight: string;
  price: number;
  inStock: boolean;
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

export interface IProduct {
  _id: string;
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
}

export interface ICartItem {
  productId: string;
  name: string;
  weight: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
}

export interface IReview {
  _id: string;
  productId: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  verifiedBuyer: boolean;
  date: string;
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

export interface IOrder {
  orderNumber: string;
  items: ICartItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: 'COD' | 'UPI' | 'CARD';
  paymentStatus: 'Pending' | 'Paid' | 'Processing';
  orderStatus: 'Confirmed' | 'Srinagar Cold-Packing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  createdAt: string;
}

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

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  memberTier: string;
  chinarPoints: number;
  addresses: IUserAddress[];
  notifications: {
    smsAlerts: boolean;
    whatsappAlerts: boolean;
    harvestNewsletter: boolean;
  };
  createdAt: string;
}

