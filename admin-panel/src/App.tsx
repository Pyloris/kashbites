import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Layers,
  Tag,
  Truck,
  ShoppingBag,
  Users,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  KeyRound,
  Percent,
  ArrowUpRight,
  Search,
  ShieldCheck,
  AlertCircle,
  Upload,
  Check,
  X,
  SlidersHorizontal,
  Terminal,
  Store,
  Eye,
  EyeOff,
} from 'lucide-react';

export interface INetWeight {
  weight: string;
  price: number;
  originalPrice: number;
  inStock?: boolean;
}

export interface IProduct {
  _id: string;
  name: string;
  subtitle: string;
  category: string;
  price: number;
  originalPrice: number;
  discountBadge?: string;
  promotionalOfferTag?: string;
  netWeights: INetWeight[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockQuantity: number;
  isCombo: boolean;
  featured: boolean;
  origin: string;
  harvestSeason: string;
  batchCode: string;
  images: string[];
  primaryImage: string;
  description: string;
  nutritionalHighlights: { label: string; value: string }[];
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  featured: boolean;
  productCount: number;
}

export interface ICoupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  isActive: boolean;
  usageCount: number;
}

export interface IOffer {
  _id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  discountPercentage: number;
  applicableCategory: string;
  isActive: boolean;
  expiryDate: string;
}

export interface IShippingConfig {
  providerName: string;
  outboundWebhookUrl: string;
  secretToken: string;
  isEnabled: boolean;
  autoPushOnNewOrder: boolean;
  lastTestedAt?: string;
}

export interface IWebhookLog {
  _id: string;
  direction: 'OUTBOUND' | 'INBOUND';
  event: string;
  orderId: string;
  targetUrl?: string;
  statusCode: number;
  success: boolean;
  payload: Record<string, any>;
  responseBody?: string;
  timestamp: string;
}

export interface IOrder {
  _id: string;
  orderId: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: {
    productId: string;
    name: string;
    weight: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: 'COD' | 'UPI' | 'Card';
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  orderStatus: 'Confirmed' | 'Srinagar Cold-Packing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  courierName?: string;
  webhookSynced?: boolean;
  cancelReason?: string;
  statusHistory?: {
    status: string;
    timestamp: string;
    note: string;
    source: 'SYSTEM' | 'ADMIN' | 'SHIPPING_WEBHOOK';
  }[];
  estimatedDelivery: string;
  createdAt: string;
}

export interface IAdminCustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  joinedDate: string;
  loyaltyPoints: number;
  addresses: {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }[];
  ordersCount: number;
  totalSpent: number;
}

type AdminTab = 'inventory' | 'categories' | 'coupons' | 'webhooks' | 'orders' | 'users';

interface AdminAppProps {
  onBackToStorefront?: () => void;
}

export default function App({ onBackToStorefront }: AdminAppProps) {
  // Auth state
  const [adminUser, setAdminUser] = useState<{ username: string; fullName: string; role: string } | null>(() => {
    try {
      const saved = localStorage.getItem('kashbites_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loginUsername, setLoginUsername] = useState('shoaibwani');
  const [loginPassword, setLoginPassword] = useState('kashbites@admin2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<AdminTab>('inventory');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data stores
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [offers, setOffers] = useState<IOffer[]>([]);
  const [shippingConfig, setShippingConfig] = useState<IShippingConfig>({
    providerName: 'Shiprocket Kashmir Cold-Chain Express',
    outboundWebhookUrl: 'https://api.shiprocket.in/v1/external/orders/create/adhoc',
    secretToken: 'kb_whsec_kashmir_2026',
    isEnabled: true,
    autoPushOnNewOrder: true,
  });
  const [webhookLogs, setWebhookLogs] = useState<IWebhookLog[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [customers, setCustomers] = useState<IAdminCustomer[]>([]);

  // Inventory Filters & Modals
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodSubtitle, setProdSubtitle] = useState('');
  const [prodCategory, setProdCategory] = useState('Walnuts');
  const [prodOrigin, setProdOrigin] = useState('Pampore & Kupwara, Kashmir');
  const [prodBatch, setProdBatch] = useState('KB-2026-NEW');
  const [prodStockQty, setProdStockQty] = useState(50);
  const [prodOfferTag, setProdOfferTag] = useState('');
  const [prodIsCombo, setProdIsCombo] = useState(false);
  const [prodPrimaryImage, setProdPrimaryImage] = useState('/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg');
  const [prodDescription, setProdDescription] = useState('');
  const [prodWeights, setProdWeights] = useState<INetWeight[]>([
    { weight: '250g', price: 399, originalPrice: 499, inStock: true },
    { weight: '500g', price: 749, originalPrice: 899, inStock: true },
    { weight: '1kg', price: 1399, originalPrice: 1699, inStock: true },
  ]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Bulk Price Adjuster State
  const [bulkAdjType, setBulkAdjType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [bulkAdjDir, setBulkAdjDir] = useState<'INCREASE' | 'DECREASE'>('INCREASE');
  const [bulkAdjValue, setBulkAdjValue] = useState(10);
  const [bulkAdjCategory, setBulkAdjCategory] = useState('All');

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatFeatured, setNewCatFeatured] = useState(true);

  // Coupon Form State
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponType, setCouponType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [couponVal, setCouponVal] = useState(15);
  const [couponMinOrder, setCouponMinOrder] = useState(799);
  const [couponMaxDisc, setCouponMaxDisc] = useState(500);
  const [couponExpiry, setCouponExpiry] = useState('2027-12-31');

  // Promotional Offer Form State
  const [offerTitle, setOfferTitle] = useState('');
  const [offerSubtitle, setOfferSubtitle] = useState('');
  const [offerBadgeText, setOfferBadgeText] = useState('');
  const [offerDiscountPct, setOfferDiscountPct] = useState(20);
  const [offerCategory, setOfferCategory] = useState('All');
  const [offerProductId, setOfferProductId] = useState('');

  // Webhook Simulator State
  const [simOrderId, setSimOrderId] = useState('');
  const [simStatus, setSimStatus] = useState('IN_TRANSIT');
  const [simTracking, setSimTracking] = useState('SR-KASH-884920');
  const [simCourier, setSimCourier] = useState('Delhivery Kashmir Air');
  const [simLocation, setSimLocation] = useState('Srinagar Airport Cargo Hub');
  const [simNote, setSimNote] = useState('Dispatched in nitrogen-flushed cold pack');
  const [simSecretHeader, setSimSecretHeader] = useState('kb_whsec_kashmir_2026');
  const [simFiring, setSimFiring] = useState(false);

  // Order Filter & Update State
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderEdits, setOrderEdits] = useState<
    Record<string, { status: string; trackingNumber: string; courierName: string; note: string }>
  >({});

  // Customer Password Modal State
  const [passwordModalUser, setPasswordModalUser] = useState<IAdminCustomer | null>(null);
  const [newCustomerPassword, setNewCustomerPassword] = useState('');

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllAdminData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [prodRes, catRes, coupRes, offRes, shipRes, ordRes, usrRes] = await Promise.all([
        fetch('/api/admin/products').then((r) => r.json()),
        fetch('/api/admin/categories').then((r) => r.json()),
        fetch('/api/admin/coupons').then((r) => r.json()),
        fetch('/api/admin/offers').then((r) => r.json()),
        fetch('/api/admin/shipping-config').then((r) => r.json()),
        fetch('/api/admin/orders').then((r) => r.json()),
        fetch('/api/admin/users').then((r) => r.json()),
      ]);

      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (coupRes.success) setCoupons(coupRes.data);
      if (offRes.success) setOffers(offRes.data);
      if (shipRes.success) {
        setShippingConfig(shipRes.data.config);
        setSimSecretHeader(shipRes.data.config.secretToken);
        setWebhookLogs(shipRes.data.logs || []);
      }
      if (ordRes.success) {
        setOrders(ordRes.data);
        if (ordRes.data.length > 0 && !simOrderId) {
          setSimOrderId(ordRes.data[0].orderId);
        }
      }
      if (usrRes.success) setCustomers(usrRes.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [simOrderId]);

  useEffect(() => {
    if (adminUser) {
      fetchAllAdminData();
    }
  }, [adminUser, fetchAllAdminData]);

  // 1. Admin Login Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.message || 'Invalid admin credentials');
      } else {
        setAdminUser(data.data);
        localStorage.setItem('kashbites_admin_session', JSON.stringify(data.data));
        showNotice(`Welcome back, ${data.data.fullName} (@${data.data.username})`);
      }
    } catch {
      setLoginError('Unable to reach backend server. Ensure API is running.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('kashbites_admin_session');
  };

  // 2. Inventory & Product Handlers
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdSubtitle('Single-Origin Kashmiri Harvest');
    setProdCategory(categories[0]?.name || 'Walnuts');
    setProdOrigin('Pampore & Kupwara, Kashmir');
    setProdBatch(`KB-2026-${Math.floor(100 + Math.random() * 900)}`);
    setProdStockQty(80);
    setProdOfferTag('');
    setProdIsCombo(false);
    setProdPrimaryImage('/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg');
    setProdDescription('Hand-harvested directly from Kashmiri valley orchards and vacuum-sealed for peak freshness.');
    setProdWeights([
      { weight: '250g', price: 399, originalPrice: 499, inStock: true },
      { weight: '500g', price: 749, originalPrice: 899, inStock: true },
      { weight: '1kg', price: 1399, originalPrice: 1699, inStock: true },
    ]);
    setShowProductModal(true);
  };

  const openEditProductModal = (product: IProduct) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdSubtitle(product.subtitle);
    setProdCategory(product.category);
    setProdOrigin(product.origin);
    setProdBatch(product.batchCode);
    setProdStockQty(product.stockQuantity ?? 50);
    setProdOfferTag(product.promotionalOfferTag || product.discountBadge || '');
    setProdIsCombo(product.isCombo);
    setProdPrimaryImage(product.primaryImage);
    setProdDescription(product.description);
    setProdWeights(
      product.netWeights.map((nw) => ({
        weight: nw.weight,
        price: nw.price,
        originalPrice: nw.originalPrice,
        inStock: nw.inStock !== false,
      }))
    );
    setShowProductModal(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            base64Data,
            folder: 'products',
          }),
        });
        const data = await res.json();
        if (data.success && data.data?.url) {
          setProdPrimaryImage(data.data.url);
          showNotice('Product image uploaded to MinIO storage');
        } else {
          setProdPrimaryImage(base64Data);
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingImage(false);
      showNotice('Failed to upload image', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const baseWeight = prodWeights[0] || { price: 499, originalPrice: 599 };
    const payload = {
      name: prodName,
      subtitle: prodSubtitle,
      category: prodCategory,
      price: Number(baseWeight.price),
      originalPrice: Number(baseWeight.originalPrice),
      discountBadge: prodOfferTag || undefined,
      promotionalOfferTag: prodOfferTag || '',
      netWeights: prodWeights.map((w) => ({
        weight: w.weight,
        price: Number(w.price),
        originalPrice: Number(w.originalPrice),
        inStock: w.inStock !== false,
      })),
      stockQuantity: Number(prodStockQty),
      inStock: Number(prodStockQty) > 0,
      isCombo: prodIsCombo,
      origin: prodOrigin,
      batchCode: prodBatch,
      primaryImage: prodPrimaryImage,
      images: [prodPrimaryImage],
      description: prodDescription,
    };

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct._id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(editingProduct ? `Updated "${prodName}"` : `Added "${prodName}" to inventory`);
        setShowProductModal(false);
        fetchAllAdminData();
      } else {
        showNotice(data.message || 'Failed to save product', 'error');
      }
    } catch {
      showNotice('Network error saving product', 'error');
    }
  };

  const handleToggleProductStock = async (product: IProduct) => {
    try {
      const nextStock = !product.inStock;
      const res = await fetch(`/api/admin/products/${product._id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inStock: nextStock,
          stockQuantity: nextStock ? Math.max(product.stockQuantity || 50, 25) : 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`${product.name} marked ${nextStock ? 'In Stock' : 'Out of Stock'}`);
        fetchAllAdminData();
      }
    } catch {
      showNotice('Failed to toggle stock status', 'error');
    }
  };

  const handleDeleteProduct = async (product: IProduct) => {
    try {
      const res = await fetch(`/api/admin/products/${product._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice(`Removed "${product.name}" from inventory`);
        fetchAllAdminData();
      }
    } catch {
      showNotice('Failed to delete product', 'error');
    }
  };

  const handleBulkPriceAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products/bulk-price', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustmentType: bulkAdjType,
          direction: bulkAdjDir,
          value: Number(bulkAdjValue),
          category: bulkAdjCategory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(data.message);
        setShowBulkPriceModal(false);
        fetchAllAdminData();
      } else {
        showNotice(data.message || 'Bulk price update failed', 'error');
      }
    } catch {
      showNotice('Failed to adjust prices', 'error');
    }
  };

  // 3. Categories Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDesc.trim() || `Authentic Kashmiri ${newCatName.trim()}`,
          featured: newCatFeatured,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`Category "${newCatName}" created`);
        setNewCatName('');
        setNewCatDesc('');
        fetchAllAdminData();
      } else {
        showNotice(data.message || 'Could not create category', 'error');
      }
    } catch {
      showNotice('Error creating category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice(`Category "${name}" deleted`);
        fetchAllAdminData();
      }
    } catch {
      showNotice('Error deleting category', 'error');
    }
  };

  // 4. Coupons & Offers Handlers
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          description:
            couponDesc.trim() ||
            `${couponType === 'PERCENTAGE' ? `${couponVal}% OFF` : `₹${couponVal} OFF`} on orders above ₹${couponMinOrder}`,
          discountType: couponType,
          discountValue: Number(couponVal),
          minOrderAmount: Number(couponMinOrder),
          maxDiscountAmount: couponType === 'PERCENTAGE' ? Number(couponMaxDisc) : undefined,
          expiryDate: couponExpiry,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`Coupon code "${data.data.code}" created!`);
        setCouponCode('');
        setCouponDesc('');
        fetchAllAdminData();
      } else {
        showNotice(data.message || 'Failed to create coupon', 'error');
      }
    } catch {
      showNotice('Error creating coupon', 'error');
    }
  };

  const handleToggleCoupon = async (coupon: ICoupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`Coupon ${coupon.code} ${!coupon.isActive ? 'activated' : 'paused'}`);
        fetchAllAdminData();
      }
    } catch {
      showNotice('Failed to update coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice(`Coupon ${code} deleted`);
        fetchAllAdminData();
      }
    } catch {
      showNotice('Failed to delete coupon', 'error');
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim() || !offerBadgeText.trim()) return;
    try {
      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: offerTitle.trim(),
          subtitle: offerSubtitle.trim(),
          badgeText: offerBadgeText.trim(),
          discountPercentage: Number(offerDiscountPct),
          applicableCategory: offerCategory,
          productId: offerProductId || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`Promotional offer "${offerTitle}" launched!`);
        setOfferTitle('');
        setOfferSubtitle('');
        setOfferBadgeText('');
        setOfferProductId('');
        fetchAllAdminData();
      }
    } catch {
      showNotice('Failed to create offer', 'error');
    }
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      await fetch(`/api/admin/offers/${id}`, { method: 'DELETE' });
      showNotice('Promotional offer removed');
      fetchAllAdminData();
    } catch {
      showNotice('Failed to delete offer', 'error');
    }
  };

  // 5. Shipping Config & Webhooks Handlers
  const handleSaveShippingConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/shipping-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shippingConfig),
      });
      const data = await res.json();
      if (data.success) {
        setSimSecretHeader(data.data.secretToken);
        showNotice('Shipping provider webhook configuration saved');
        fetchAllAdminData();
      }
    } catch {
      showNotice('Failed to save shipping config', 'error');
    }
  };

  const handleManualOutboundPush = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/shipping-config/push/${orderId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`Order ${orderId} pushed to ${shippingConfig.providerName} webhook`);
        fetchAllAdminData();
      } else {
        showNotice(data.message || 'Outbound webhook push failed', 'error');
      }
    } catch {
      showNotice('Failed to trigger outbound webhook', 'error');
    }
  };

  const handleFireInboundWebhookSimulator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simOrderId) {
      showNotice('Please select an order to simulate', 'error');
      return;
    }
    setSimFiring(true);
    try {
      const res = await fetch('/api/webhooks/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-shipping-webhook-secret': simSecretHeader,
        },
        body: JSON.stringify({
          orderId: simOrderId,
          status: simStatus,
          trackingNumber: simTracking,
          courierName: simCourier,
          location: simLocation,
          note: simNote,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotice(`Inbound Webhook processed: Order ${simOrderId} -> ${data.data.orderStatus}`);
        fetchAllAdminData();
      } else {
        showNotice(data.message || 'Webhook rejected (check secret token)', 'error');
        fetchAllAdminData();
      }
    } catch {
      showNotice('Failed to send simulated webhook request', 'error');
    } finally {
      setSimFiring(false);
    }
  };

  // 6. Orders Management Handlers
  const handleManualOrderStatusUpdate = async (orderId: string) => {
    const edit = orderEdits[orderId];
    if (!edit) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edit),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`Order ${orderId} updated to "${edit.status}"`);
        fetchAllAdminData();
      }
    } catch {
      showNotice('Failed to update order status', 'error');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelled by Admin (shoaibwani) from Admin Console' }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`Order ${orderId} has been cancelled`);
        fetchAllAdminData();
      }
    } catch {
      showNotice('Failed to cancel order', 'error');
    }
  };

  // 7. Customer Password Reset Handler
  const handleUpdateCustomerPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || newCustomerPassword.trim().length < 4) {
      showNotice('Password must be at least 4 characters', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${passwordModalUser._id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newCustomerPassword.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(data.message || `Password updated for ${passwordModalUser.name}`);
        setPasswordModalUser(null);
        setNewCustomerPassword('');
      } else {
        showNotice(data.message || 'Failed to update password', 'error');
      }
    } catch {
      showNotice('Error updating user password', 'error');
    }
  };

  // Computed metrics
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.filter((p) => !p.inStock).length;

  const filteredProducts = products.filter((p) => {
    const matchesCat = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    const matchesSearch =
      !productSearch.trim() ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.batchCode.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredOrders = orders.filter(
    (o) => orderStatusFilter === 'All' || o.orderStatus === orderStatusFilter
  );

  // ============================================================================
  // LOGIN VIEW (IF NOT AUTHENTICATED)
  // ============================================================================
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#0B2516] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Subtle Gold Botanical Framing */}
        <div className="w-full max-w-md bg-[#F8F6F1] rounded-2xl border border-[#C59B27]/40 shadow-2xl overflow-hidden">
          <div className="bg-[#0F2C1D] px-8 py-7 border-b border-[#C59B27]/30 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#C59B27]/20 border border-[#C59B27]/40 text-[#E5C158] text-xs font-semibold tracking-wider uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              KashBites Merchant Operations
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#FBF8F1] tracking-tight">
              KashBites Admin Console
            </h1>
            <p className="text-xs text-[#D5CEBE] mt-1">
              Inventory, Pricing, Coupons, Shipping Webhooks & Customer Accounts
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="p-8 space-y-5">
            {loginError && (
              <div className="p-3.5 rounded-lg bg-[#B91C1C]/10 border border-[#B91C1C]/30 text-[#B91C1C] text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1.5">
                Admin Username
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2DDD2] text-sm font-mono text-[#0F1F16] focus:outline-none focus:border-[#0F2C1D]"
                placeholder="shoaibwani"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white border border-[#E2DDD2] text-sm font-mono text-[#0F1F16] focus:outline-none focus:border-[#0F2C1D]"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5D52] hover:text-[#0F1F16]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Seeded Admin Credentials Quick-Fill Box */}
            <div className="p-3.5 rounded-xl bg-[#EFECE4] border border-[#E2DDD2] text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#0F2C1D]">Seeded Default Admin Account</span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginUsername('shoaibwani');
                    setLoginPassword('kashbites@admin2026');
                  }}
                  className="text-[11px] font-semibold text-[#9E7A18] hover:underline"
                >
                  Fill Credentials
                </button>
              </div>
              <div className="font-mono text-[#4A5D52] flex items-center justify-between">
                <span>User: <strong className="text-[#0F1F16]">shoaibwani</strong></span>
                <span>Pass: <strong className="text-[#0F1F16]">kashbites@admin2026</strong></span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 rounded-lg bg-[#0F2C1D] hover:bg-[#163F2A] text-[#FBF8F1] font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Admin Console'}
              <ArrowUpRight className="w-4 h-4 text-[#C59B27]" />
            </button>

            {onBackToStorefront && (
              <button
                type="button"
                onClick={onBackToStorefront}
                className="w-full py-2.5 px-4 rounded-lg border border-[#E2DDD2] text-[#4A5D52] hover:text-[#0F1F16] hover:bg-white text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                Return to KashBites Customer Storefront
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN AUTHENTICATED ADMIN WORKSPACE
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#0F1F16] flex flex-col lg:flex-row">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-[#0F2C1D] text-[#FBF8F1] border-[#C59B27]'
              : 'bg-[#B91C1C] text-white border-red-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#C59B27] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Left Vertical Sidebar Navigation (260px on desktop) */}
      <aside className="w-full lg:w-[260px] shrink-0 bg-[#0B2516] text-[#FBF8F1] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#C59B27]/25">
        <div>
          {/* Brand Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#FBF8F1]">
                  KashBites
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#C59B27] text-[#0B2516] font-bold rounded">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-[#A7B8AE] mt-0.5">Srinagar Fulfillment Control</p>
            </div>
          </div>

          {/* Admin User Badge */}
          <div className="px-6 py-3.5 bg-[#0F2C1D] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C59B27]/20 border border-[#C59B27]/50 flex items-center justify-center font-mono text-xs font-bold text-[#E5C158]">
                SW
              </div>
              <div>
                <p className="text-xs font-semibold text-white leading-tight">{adminUser.fullName}</p>
                <p className="text-[11px] font-mono text-[#E5C158]">@{adminUser.username}</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Authenticated" />
          </div>

          {/* Primary Navigation Links */}
          <nav className="p-3 space-y-1 flex lg:flex-col overflow-x-auto">
            {[
              { id: 'inventory', label: 'Inventory & Pricing', icon: Package, badge: products.length },
              { id: 'categories', label: 'Categories', icon: Layers, badge: categories.length },
              { id: 'coupons', label: 'Offers & Coupons', icon: Tag, badge: coupons.length + offers.length },
              { id: 'webhooks', label: 'Shipping & Webhooks', icon: Truck, badge: webhookLogs.length },
              { id: 'orders', label: 'Orders Management', icon: ShoppingBag, badge: orders.length },
              { id: 'users', label: 'Customer Accounts', icon: Users, badge: customers.length },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#C59B27] text-[#0B2516] font-semibold shadow-sm'
                      : 'text-[#D5CEBE] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums ${
                      isActive ? 'bg-[#0B2516]/20 text-[#0B2516] font-bold' : 'bg-white/10 text-[#D5CEBE]'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {onBackToStorefront ? (
            <button
              onClick={onBackToStorefront}
              className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-[#FBF8F1] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-[#E5C158]" />
              Switch to Storefront
            </button>
          ) : (
            <a
              href="/"
              className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-[#FBF8F1] flex items-center justify-center gap-2 transition"
            >
              <Store className="w-3.5 h-3.5 text-[#E5C158]" />
              Open Storefront
            </a>
          )}
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-lg border border-red-400/30 hover:bg-red-500/20 text-xs font-medium text-red-200 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out ({adminUser.username})
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Utility Header */}
        <header className="h-16 bg-white border-b border-[#E2DDD2] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#4A5D52]">
              Admin /
            </span>
            <h2 className="text-lg font-bold text-[#0F1F16] capitalize">
              {activeTab === 'inventory' && 'Inventory, Variations & Dynamic Pricing'}
              {activeTab === 'categories' && 'Orchard Categories Management'}
              {activeTab === 'coupons' && 'Promotional Offers & Coupon Codes'}
              {activeTab === 'webhooks' && 'Shipping Provider Integration & 2-Way Webhooks'}
              {activeTab === 'orders' && 'Customer Orders & Dispatch Control'}
              {activeTab === 'users' && 'Registered Shop Accounts & Password Management'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllAdminData}
              className="px-3 py-1.5 rounded-lg border border-[#E2DDD2] bg-[#F8F6F1] hover:bg-[#EFECE4] text-xs font-medium text-[#0F1F16] flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
          </div>
        </header>

        {/* KPI Executive Summary Strip (Max 4 cards, single-elevation, tabular-nums) */}
        <div className="px-6 pt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-[#E2DDD2]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4A5D52]">
              Active Store Revenue
            </span>
            <p className="text-2xl font-bold font-mono tabular-nums text-[#0F1F16] mt-1">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
            <span className="text-xs text-[#15803D] font-medium mt-1 inline-block">
              Across {orders.filter((o) => o.orderStatus !== 'Cancelled').length} active orders
            </span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#E2DDD2]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4A5D52]">
              Inventory SKUs
            </span>
            <p className="text-2xl font-bold font-mono tabular-nums text-[#0F1F16] mt-1">
              {products.length} Products
            </p>
            <span className="text-xs text-[#4A5D52] font-mono tabular-nums mt-1 inline-block">
              <strong className="text-[#15803D]">{inStockCount} In Stock</strong> ·{' '}
              <strong className="text-[#B91C1C]">{outOfStockCount} Out</strong>
            </span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#E2DDD2]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4A5D52]">
              Active Coupons & Offers
            </span>
            <p className="text-2xl font-bold font-mono tabular-nums text-[#0F1F16] mt-1">
              {coupons.filter((c) => c.isActive).length} Coupons / {offers.length} Offers
            </p>
            <span className="text-xs text-[#9E7A18] font-medium mt-1 inline-block">
              Percentage & Flat Rules Active
            </span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#E2DDD2]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4A5D52]">
              Shipping Provider Webhook
            </span>
            <p className="text-base font-bold text-[#0F1F16] mt-1 truncate">
              {shippingConfig.providerName}
            </p>
            <span className="text-xs font-mono text-[#15803D] mt-1 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#15803D]" />
              {shippingConfig.autoPushOnNewOrder ? 'Auto-Push on New Order ON' : 'Manual Push Mode'}
            </span>
          </div>
        </div>

        {/* Workspace Tab Content */}
        <main className="p-6 flex-1">
          {/* ================================================================
              TAB 1: INVENTORY & PRICING
             ================================================================ */}
          {activeTab === 'inventory' && (
            <div className="space-y-5">
              {/* Action & Filter Bar */}
              <div className="bg-white p-4 rounded-xl border border-[#E2DDD2] flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-4 h-4 text-[#4A5D52] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search product or batch code..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E2DDD2] text-xs focus:outline-none focus:border-[#0F2C1D]"
                    />
                  </div>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs font-medium bg-white focus:outline-none focus:border-[#0F2C1D]"
                  >
                    <option value="All">All Categories ({products.length})</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setShowBulkPriceModal(true)}
                    className="px-3.5 py-2 rounded-lg border border-[#C59B27] bg-[#C59B27]/10 hover:bg-[#C59B27]/20 text-[#0F2C1D] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#9E7A18]" />
                    Raise / Adjust Prices
                  </button>
                  <button
                    onClick={openAddProductModal}
                    className="px-4 py-2 rounded-lg bg-[#0F2C1D] hover:bg-[#163F2A] text-[#FBF8F1] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#C59B27]" />
                    Add New Product
                  </button>
                </div>
              </div>

              {/* Inventory Data Table */}
              <div className="bg-white rounded-xl border border-[#E2DDD2] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#EFECE4] border-b border-[#E2DDD2] text-[11px] font-semibold uppercase tracking-wider text-[#4A5D52]">
                        <th className="py-3.5 px-4">Product & Batch</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Variations & Rates (netWeights)</th>
                        <th className="py-3.5 px-4">Base Rate</th>
                        <th className="py-3.5 px-4">Stock Level</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DDD2] text-sm">
                      {filteredProducts.map((product) => (
                        <tr key={product._id} className="hover:bg-[#F8F6F1]/60 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.primaryImage}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover border border-[#E2DDD2] shrink-0 bg-[#EFECE4]"
                              />
                              <div>
                                <div className="font-semibold text-[#0F1F16] flex items-center gap-2">
                                  <span>{product.name}</span>
                                  {product.promotionalOfferTag && (
                                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#C59B27]/20 text-[#9E7A18] rounded">
                                      {product.promotionalOfferTag}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-[#4A5D52] font-mono mt-0.5">
                                  Batch: {product.batchCode} · {product.origin}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-md bg-[#EFECE4] text-xs font-medium text-[#0F2C1D]">
                              {product.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1.5">
                              {product.netWeights.map((nw) => (
                                <span
                                  key={nw.weight}
                                  className={`px-2 py-1 rounded border text-xs font-mono tabular-nums ${
                                    nw.inStock === false
                                      ? 'bg-red-50 border-red-200 text-red-700 line-through'
                                      : 'bg-[#F8F6F1] border-[#E2DDD2] text-[#0F1F16]'
                                  }`}
                                >
                                  <strong>{nw.weight}:</strong> ₹{nw.price}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono tabular-nums">
                            <div className="font-bold text-[#0F1F16]">₹{product.price}</div>
                            <div className="text-xs text-[#4A5D52] line-through">
                              MRP ₹{product.originalPrice}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleProductStock(product)}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition ${
                                  product.inStock
                                    ? 'bg-[#15803D]/15 text-[#15803D] hover:bg-[#15803D]/25'
                                    : 'bg-[#B91C1C]/15 text-[#B91C1C] hover:bg-[#B91C1C]/25'
                                }`}
                                title="Click to toggle In Stock / Out of Stock"
                              >
                                {product.inStock ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    In Stock ({product.stockQuantity ?? 50})
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" />
                                    Out of Stock (0)
                                  </>
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => openEditProductModal(product)}
                                className="px-2.5 py-1.5 rounded-lg border border-[#E2DDD2] hover:bg-[#EFECE4] text-xs font-medium text-[#0F1F16] flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit / Prices
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product)}
                                className="p-1.5 rounded-lg border border-[#E2DDD2] hover:bg-red-50 hover:border-red-200 text-[#B91C1C] cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 2: CATEGORIES MANAGER
             ================================================================ */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Category Form */}
              <div className="bg-white p-6 rounded-xl border border-[#E2DDD2] h-fit">
                <h3 className="text-base font-bold text-[#0F1F16] mb-1">Add New Orchard Category</h3>
                <p className="text-xs text-[#4A5D52] mb-4">
                  Create a new product category for the storefront filter bar and inventory catalog.
                </p>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g., Kashmiri Saffron & Honey"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="Pure Pampore Mogra Saffron and raw multiflora honey..."
                      className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs font-medium text-[#0F1F16] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCatFeatured}
                      onChange={(e) => setNewCatFeatured(e.target.checked)}
                      className="rounded border-[#E2DDD2]"
                    />
                    Feature on Storefront Home Page
                  </label>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-lg bg-[#0F2C1D] hover:bg-[#163F2A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#C59B27]" />
                    Create Category
                  </button>
                </form>
              </div>

              {/* Categories List */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2DDD2] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EFECE4] border-b border-[#E2DDD2] text-[11px] font-semibold uppercase tracking-wider text-[#4A5D52]">
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Products</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DDD2] text-sm">
                    {categories.map((cat) => (
                      <tr key={cat._id} className="hover:bg-[#F8F6F1]/60">
                        <td className="py-3.5 px-4 font-semibold text-[#0F1F16]">
                          <div>{cat.name}</div>
                          <div className="text-xs font-mono text-[#4A5D52]">/{cat.slug}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#4A5D52] max-w-md">
                          {cat.description}
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums text-xs font-semibold">
                          {cat.productCount} SKUs
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteCategory(cat._id, cat.name)}
                            className="p-1.5 rounded-lg border border-[#E2DDD2] hover:bg-red-50 text-[#B91C1C] cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 3: OFFERS & COUPON CODES
             ================================================================ */}
          {activeTab === 'coupons' && (
            <div className="space-y-8">
              {/* Section A: Coupon Code Generator & Table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[#E2DDD2] h-fit">
                  <div className="flex items-center gap-2 mb-1">
                    <Percent className="w-4 h-4 text-[#9E7A18]" />
                    <h3 className="text-base font-bold text-[#0F1F16]">Create Coupon Code</h3>
                  </div>
                  <p className="text-xs text-[#4A5D52] mb-4">
                    Supports both Percentage (%) and Flat (₹) discounts with minimum order rules.
                  </p>

                  <form onSubmit={handleCreateCoupon} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                        Coupon Code
                      </label>
                      <input
                        type="text"
                        required
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g., HARVEST25 or FLAT300"
                        className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-sm font-mono uppercase"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                          Discount Type
                        </label>
                        <select
                          value={couponType}
                          onChange={(e) => setCouponType(e.target.value as 'PERCENTAGE' | 'FLAT')}
                          className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs font-semibold bg-white"
                        >
                          <option value="PERCENTAGE">Percentage (%)</option>
                          <option value="FLAT">Flat Discount (₹)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                          Value ({couponType === 'PERCENTAGE' ? '%' : '₹'})
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={couponVal}
                          onChange={(e) => setCouponVal(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                          Min Order (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={couponMinOrder}
                          onChange={(e) => setCouponMinOrder(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          value={couponExpiry}
                          onChange={(e) => setCouponExpiry(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={couponDesc}
                        onChange={(e) => setCouponDesc(e.target.value)}
                        placeholder="Special Valley Harvest discount..."
                        className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-lg bg-[#0F2C1D] hover:bg-[#163F2A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#C59B27]" />
                      Create Coupon Code
                    </button>
                  </form>
                </div>

                {/* Active Coupons Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2DDD2] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E2DDD2] flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0F1F16]">
                      Storefront Coupon Codes (Live at Checkout)
                    </h3>
                    <span className="text-xs font-mono text-[#4A5D52]">
                      {coupons.length} Configured
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#EFECE4] border-b border-[#E2DDD2] text-[11px] font-semibold uppercase tracking-wider text-[#4A5D52]">
                          <th className="py-3 px-4">Code</th>
                          <th className="py-3 px-4">Discount</th>
                          <th className="py-3 px-4">Min Order</th>
                          <th className="py-3 px-4">Expiry</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2DDD2] text-sm">
                        {coupons.map((c) => (
                          <tr key={c._id} className="hover:bg-[#F8F6F1]/60">
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 rounded bg-[#0F2C1D] text-[#E5C158] font-mono text-xs font-bold tracking-wider">
                                {c.code}
                              </span>
                              <p className="text-xs text-[#4A5D52] mt-1">{c.description}</p>
                            </td>
                            <td className="py-3.5 px-4 font-mono tabular-nums font-bold text-[#15803D]">
                              {c.discountType === 'PERCENTAGE'
                                ? `${c.discountValue}% OFF`
                                : `₹${c.discountValue} FLAT`}
                            </td>
                            <td className="py-3.5 px-4 font-mono tabular-nums text-xs">
                              ₹{c.minOrderAmount}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-[#4A5D52]">
                              {c.expiryDate}
                            </td>
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => handleToggleCoupon(c)}
                                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                                  c.isActive
                                    ? 'bg-[#15803D]/15 text-[#15803D]'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {c.isActive ? 'Active' : 'Paused'}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => handleDeleteCoupon(c._id, c.code)}
                                className="p-1.5 rounded-lg border border-[#E2DDD2] hover:bg-red-50 text-[#B91C1C] cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Section B: Promotional Offers & Product Tagging */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[#E2DDD2] h-fit">
                  <h3 className="text-base font-bold text-[#0F1F16] mb-1">
                    Launch Promotional Offer
                  </h3>
                  <p className="text-xs text-[#4A5D52] mb-4">
                    Create a seasonal offer banner and optionally tag a specific product with the offer badge.
                  </p>
                  <form onSubmit={handleCreateOffer} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                        Offer Title
                      </label>
                      <input
                        type="text"
                        required
                        value={offerTitle}
                        onChange={(e) => setOfferTitle(e.target.value)}
                        placeholder="e.g., Winter Shilajit & Almond Immunity Offer"
                        className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                          Badge Text
                        </label>
                        <input
                          type="text"
                          required
                          value={offerBadgeText}
                          onChange={(e) => setOfferBadgeText(e.target.value)}
                          placeholder="FESTIVE 25% OFF"
                          className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                          Discount %
                        </label>
                        <input
                          type="number"
                          value={offerDiscountPct}
                          onChange={(e) => setOfferDiscountPct(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                        Tag Specific Product (Optional)
                      </label>
                      <select
                        value={offerProductId}
                        onChange={(e) => setOfferProductId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs bg-white"
                      >
                        <option value="">-- Storewide / Category Offer --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} (₹{p.price})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-lg bg-[#C59B27] hover:bg-[#b0891f] text-[#0B2516] font-bold text-xs cursor-pointer"
                    >
                      Publish Promotional Offer
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2DDD2] p-5">
                  <h3 className="text-sm font-bold text-[#0F1F16] mb-4">Active Promotional Campaigns</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offers.map((off) => (
                      <div
                        key={off._id}
                        className="p-4 rounded-xl bg-[#F8F6F1] border border-[#E2DDD2] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded bg-[#C59B27]/25 text-[#9E7A18] font-mono text-[11px] font-bold">
                              {off.badgeText}
                            </span>
                            <button
                              onClick={() => handleDeleteOffer(off._id)}
                              className="text-xs text-[#B91C1C] hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                          <h4 className="font-bold text-sm text-[#0F1F16]">{off.title}</h4>
                          <p className="text-xs text-[#4A5D52] mt-1">{off.subtitle}</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-[#E2DDD2] flex items-center justify-between text-[11px] font-mono text-[#4A5D52]">
                          <span>Category: {off.applicableCategory}</span>
                          <span>Save {off.discountPercentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 4: SHIPPING PROVIDER & 2-WAY WEBHOOKS
             ================================================================ */}
          {activeTab === 'webhooks' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel A: Outbound Shipping Provider Configuration */}
                <div className="bg-white p-6 rounded-xl border border-[#E2DDD2]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#0F2C1D]" />
                      <h3 className="text-base font-bold text-[#0F1F16]">
                        1. Outbound Shipping Provider Webhook
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[11px] font-semibold">
                      OUTBOUND PUSH
                    </span>
                  </div>
                  <p className="text-xs text-[#4A5D52] mb-4">
                    Whenever a new order is placed on KashBites, our backend automatically pushes the order payload (`ORDER_CREATED`) to your configured shipping provider webhook URL.
                  </p>

                  <form onSubmit={handleSaveShippingConfig} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                        Shipping Provider Name
                      </label>
                      <input
                        type="text"
                        value={shippingConfig.providerName}
                        onChange={(e) =>
                          setShippingConfig({ ...shippingConfig, providerName: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                        Provider Outbound Webhook URL (POST)
                      </label>
                      <input
                        type="url"
                        required
                        value={shippingConfig.outboundWebhookUrl}
                        onChange={(e) =>
                          setShippingConfig({
                            ...shippingConfig,
                            outboundWebhookUrl: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                        Shared Webhook Secret Header (`x-shipping-webhook-secret`)
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingConfig.secretToken}
                        onChange={(e) =>
                          setShippingConfig({ ...shippingConfig, secretToken: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs font-mono"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-1">
                      <label className="flex items-center gap-2 text-xs font-semibold text-[#0F1F16] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shippingConfig.isEnabled}
                          onChange={(e) =>
                            setShippingConfig({ ...shippingConfig, isEnabled: e.target.checked })
                          }
                        />
                        Webhook Integration Enabled
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-[#0F1F16] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shippingConfig.autoPushOnNewOrder}
                          onChange={(e) =>
                            setShippingConfig({
                              ...shippingConfig,
                              autoPushOnNewOrder: e.target.checked,
                            })
                          }
                        />
                        Auto-Push Every New Order
                      </label>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-lg bg-[#0F2C1D] hover:bg-[#163F2A] text-white text-xs font-semibold cursor-pointer"
                      >
                        Save Webhook Configuration
                      </button>
                      {orders[0] && (
                        <button
                          type="button"
                          onClick={() => handleManualOutboundPush(orders[0].orderId)}
                          className="px-3.5 py-2.5 rounded-lg border border-[#C59B27] bg-[#C59B27]/15 text-[#0F2C1D] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Test Push Latest Order ({orders[0].orderId})
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Panel B: Inbound Shipping Webhook & Live Simulator */}
                <div className="bg-white p-6 rounded-xl border border-[#E2DDD2]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-[#9E7A18]" />
                      <h3 className="text-base font-bold text-[#0F1F16]">
                        2. Inbound Provider Webhook & Simulator
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[11px] font-semibold">
                      POST /api/webhooks/shipping
                    </span>
                  </div>
                  <p className="text-xs text-[#4A5D52] mb-4">
                    Your shipping provider sends live status updates to{' '}
                    <code className="font-mono bg-[#EFECE4] px-1.5 py-0.5 rounded text-[#0F2C1D]">
                      POST /api/webhooks/shipping
                    </code>{' '}
                    authenticated with{' '}
                    <code className="font-mono bg-[#EFECE4] px-1.5 py-0.5 rounded text-[#0F2C1D]">
                      x-shipping-webhook-secret
                    </code>
                    . Use the simulator below to fire a real webhook call and watch the order update!
                  </p>

                  <form onSubmit={handleFireInboundWebhookSimulator} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                          Target Order ID
                        </label>
                        <select
                          value={simOrderId}
                          onChange={(e) => setSimOrderId(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs font-mono bg-white"
                        >
                          {orders.map((o) => (
                            <option key={o.orderId} value={o.orderId}>
                              {o.orderId} ({o.customer.fullName} - {o.orderStatus})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                          Provider Event Status
                        </label>
                        <select
                          value={simStatus}
                          onChange={(e) => setSimStatus(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs font-mono bg-white"
                        >
                          <option value="PICKED_UP">PICKED_UP → Srinagar Cold-Packing</option>
                          <option value="IN_TRANSIT">IN_TRANSIT → Shipped</option>
                          <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY → Out for Delivery</option>
                          <option value="DELIVERED">DELIVERED → Delivered</option>
                          <option value="CANCELLED">CANCELLED → Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                          AWB Tracking Number
                        </label>
                        <input
                          type="text"
                          value={simTracking}
                          onChange={(e) => setSimTracking(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                          Courier Partner
                        </label>
                        <input
                          type="text"
                          value={simCourier}
                          onChange={(e) => setSimCourier(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                          Hub / Scan Location
                        </label>
                        <input
                          type="text"
                          value={simLocation}
                          onChange={(e) => setSimLocation(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                          Header: `x-shipping-webhook-secret`
                        </label>
                        <input
                          type="text"
                          value={simSecretHeader}
                          onChange={(e) => setSimSecretHeader(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={simFiring}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#C59B27] hover:bg-[#b0891f] text-[#0B2516] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      {simFiring
                        ? 'Dispatching Webhook...'
                        : 'Fire Simulated Inbound Shipping Webhook'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Panel C: Live Webhook Audit Log */}
              <div className="bg-white rounded-xl border border-[#E2DDD2] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E2DDD2] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F1F16]">
                      2-Way Webhook Event Audit Log (Outbound Pushes & Inbound Updates)
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#4A5D52]">
                    {webhookLogs.length} Events Recorded
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#EFECE4] border-b border-[#E2DDD2] text-[11px] font-semibold uppercase tracking-wider text-[#4A5D52]">
                        <th className="py-3 px-4">Direction</th>
                        <th className="py-3 px-4">Event</th>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">HTTP Status</th>
                        <th className="py-3 px-4">Payload Preview</th>
                        <th className="py-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DDD2] text-xs font-mono">
                      {webhookLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-[#F8F6F1]/60">
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                log.direction === 'OUTBOUND'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {log.direction}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#0F1F16]">{log.event}</td>
                          <td className="py-3 px-4 text-[#0F2C1D] font-bold">{log.orderId}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded ${
                                log.success
                                  ? 'bg-[#15803D]/15 text-[#15803D]'
                                  : 'bg-[#B91C1C]/15 text-[#B91C1C]'
                              }`}
                            >
                              HTTP {log.statusCode}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-md truncate text-[#4A5D52]">
                            {JSON.stringify(log.payload)}
                          </td>
                          <td className="py-3 px-4 text-[#4A5D52]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 5: ORDERS MANAGEMENT
             ================================================================ */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              {/* Order Status Filter Pills */}
              <div className="bg-white p-4 rounded-xl border border-[#E2DDD2] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    'All',
                    'Confirmed',
                    'Srinagar Cold-Packing',
                    'Shipped',
                    'Out for Delivery',
                    'Delivered',
                    'Cancelled',
                  ].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        orderStatusFilter === st
                          ? 'bg-[#0F2C1D] text-white'
                          : 'bg-[#F8F6F1] text-[#4A5D52] hover:bg-[#EFECE4]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono text-[#4A5D52]">
                  Showing {filteredOrders.length} of {orders.length} Orders
                </span>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const editState = orderEdits[order.orderId] || {
                    status: order.orderStatus,
                    trackingNumber: order.trackingNumber || '',
                    courierName: order.courierName || shippingConfig.providerName,
                    note: '',
                  };

                  return (
                    <div
                      key={order._id}
                      className="bg-white rounded-xl border border-[#E2DDD2] p-5 space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#E2DDD2]">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-base font-bold text-[#0F1F16]">
                              {order.orderId}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                                order.orderStatus === 'Delivered'
                                  ? 'bg-[#15803D]/15 text-[#15803D]'
                                  : order.orderStatus === 'Cancelled'
                                  ? 'bg-[#B91C1C]/15 text-[#B91C1C]'
                                  : 'bg-[#C59B27]/25 text-[#9E7A18]'
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#EFECE4] font-mono text-[11px] text-[#4A5D52]">
                              {order.paymentMethod} · {order.paymentStatus}
                            </span>
                            {order.webhookSynced && (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px]">
                                Webhook Synced
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#4A5D52] mt-1">
                            Placed on {new Date(order.createdAt).toLocaleString()} · Customer:{' '}
                            <strong className="text-[#0F1F16]">{order.customer.fullName}</strong> (
                            {order.customer.phone})
                          </p>
                          <p className="text-xs text-[#4A5D52]">
                            Ship to: {order.customer.address}, {order.customer.city},{' '}
                            {order.customer.state} - {order.customer.pincode}
                          </p>
                        </div>

                        <div className="text-right font-mono tabular-nums">
                          <div className="text-lg font-bold text-[#0F1F16]">
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </div>
                          {order.discount > 0 && (
                            <div className="text-xs text-[#15803D]">
                              Saved ₹{order.discount} {order.couponCode ? `(${order.couponCode})` : ''}
                            </div>
                          )}
                          {order.trackingNumber && (
                            <div className="text-xs text-[#9E7A18] mt-0.5">
                              AWB: {order.trackingNumber} ({order.courierName})
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="flex flex-wrap gap-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#F8F6F1] border border-[#E2DDD2] text-xs"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-9 h-9 rounded object-cover"
                            />
                            <div>
                              <div className="font-semibold text-[#0F1F16]">{item.name}</div>
                              <div className="font-mono text-[#4A5D52]">
                                {item.weight} × {item.quantity} = ₹{item.price * item.quantity}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Manual Status Controls & Cancel Button */}
                      <div className="pt-3 border-t border-[#E2DDD2] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={editState.status}
                            onChange={(e) =>
                              setOrderEdits({
                                ...orderEdits,
                                [order.orderId]: { ...editState, status: e.target.value },
                              })
                            }
                            className="px-3 py-1.5 rounded-lg border border-[#E2DDD2] text-xs font-semibold bg-white"
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Srinagar Cold-Packing">Srinagar Cold-Packing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          <input
                            type="text"
                            placeholder="AWB Tracking #"
                            value={editState.trackingNumber}
                            onChange={(e) =>
                              setOrderEdits({
                                ...orderEdits,
                                [order.orderId]: {
                                  ...editState,
                                  trackingNumber: e.target.value,
                                },
                              })
                            }
                            className="px-2.5 py-1.5 rounded-lg border border-[#E2DDD2] text-xs font-mono w-36"
                          />

                          <button
                            onClick={() => handleManualOrderStatusUpdate(order.orderId)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#0F2C1D] hover:bg-[#163F2A] text-white text-xs font-semibold cursor-pointer"
                          >
                            Update Status
                          </button>

                          <button
                            onClick={() => handleManualOutboundPush(order.orderId)}
                            className="px-3 py-1.5 rounded-lg border border-[#E2DDD2] hover:bg-[#EFECE4] text-xs font-medium text-[#0F1F16] flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            Push to Webhook
                          </button>
                        </div>

                        {order.orderStatus !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancelOrder(order.orderId)}
                            className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-[#B91C1C] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 6: CUSTOMER ACCOUNTS & PASSWORD RESET
             ================================================================ */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl border border-[#E2DDD2] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E2DDD2] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0F1F16]">
                    Registered Shop Customer Accounts
                  </h3>
                  <p className="text-xs text-[#4A5D52]">
                    View customer profiles, order history, and update/reset their login passwords.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#4A5D52]">
                  {customers.length} Accounts
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EFECE4] border-b border-[#E2DDD2] text-[11px] font-semibold uppercase tracking-wider text-[#4A5D52]">
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Saved Addresses</th>
                      <th className="py-3.5 px-4">Orders & Spend</th>
                      <th className="py-3.5 px-4">Loyalty Points</th>
                      <th className="py-3.5 px-4 text-right">Password Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DDD2] text-sm">
                    {customers.map((u) => (
                      <tr key={u._id} className="hover:bg-[#F8F6F1]/60">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#0F1F16]">{u.name}</div>
                          <div className="text-xs text-[#4A5D52]">Joined {u.joinedDate}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs">
                          <div className="text-[#0F1F16]">{u.email}</div>
                          <div className="text-[#4A5D52]">{u.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#4A5D52]">
                          {u.addresses?.length > 0 ? (
                            <div>
                              <span className="font-semibold text-[#0F1F16]">
                                {u.addresses[0].city}, {u.addresses[0].state}
                              </span>{' '}
                              ({u.addresses.length} saved)
                            </div>
                          ) : (
                            'No saved address'
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums text-xs">
                          <div className="font-bold text-[#0F1F16]">
                            ₹{u.totalSpent.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[#4A5D52]">{u.ordersCount} orders</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums text-xs font-semibold text-[#9E7A18]">
                          {u.loyaltyPoints} pts
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setPasswordModalUser(u);
                              setNewCustomerPassword('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#0F2C1D] hover:bg-[#163F2A] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-[#C59B27]" />
                            Change Password
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ====================================================================
          MODAL 1: ADD / EDIT PRODUCT & VARIATIONS
         ==================================================================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#E2DDD2] max-w-2xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-3">
              <h3 className="text-lg font-bold text-[#0F1F16]">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Kashmiri Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 rounded-lg hover:bg-[#EFECE4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={prodSubtitle}
                    onChange={(e) => setProdSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                    Category
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-sm bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={prodStockQty}
                    onChange={(e) => setProdStockQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                    Promotional Badge
                  </label>
                  <input
                    type="text"
                    value={prodOfferTag}
                    onChange={(e) => setProdOfferTag(e.target.value)}
                    placeholder="e.g., HARVEST SPECIAL"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-sm"
                  />
                </div>
              </div>

              {/* Dynamic Weight Variations (netWeights) */}
              <div className="p-4 rounded-xl bg-[#F8F6F1] border border-[#E2DDD2] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0F2C1D]">
                    Pack Weight Variations & Pricing (`netWeights`)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setProdWeights([
                        ...prodWeights,
                        { weight: '2kg', price: 2499, originalPrice: 2999, inStock: true },
                      ])
                    }
                    className="text-xs font-semibold text-[#9E7A18] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Weight Tier
                  </button>
                </div>

                {prodWeights.map((nw, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2.5 items-center">
                    <input
                      type="text"
                      value={nw.weight}
                      onChange={(e) => {
                        const next = [...prodWeights];
                        next[idx].weight = e.target.value;
                        setProdWeights(next);
                      }}
                      placeholder="Weight (250g)"
                      className="px-2.5 py-1.5 rounded border border-[#E2DDD2] bg-white text-xs font-mono"
                    />
                    <input
                      type="number"
                      value={nw.price}
                      onChange={(e) => {
                        const next = [...prodWeights];
                        next[idx].price = Number(e.target.value);
                        setProdWeights(next);
                      }}
                      placeholder="Sale ₹"
                      className="px-2.5 py-1.5 rounded border border-[#E2DDD2] bg-white text-xs font-mono"
                    />
                    <input
                      type="number"
                      value={nw.originalPrice}
                      onChange={(e) => {
                        const next = [...prodWeights];
                        next[idx].originalPrice = Number(e.target.value);
                        setProdWeights(next);
                      }}
                      placeholder="MRP ₹"
                      className="px-2.5 py-1.5 rounded border border-[#E2DDD2] bg-white text-xs font-mono"
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={nw.inStock !== false}
                          onChange={(e) => {
                            const next = [...prodWeights];
                            next[idx].inStock = e.target.checked;
                            setProdWeights(next);
                          }}
                        />
                        In Stock
                      </label>
                      {prodWeights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setProdWeights(prodWeights.filter((_, i) => i !== idx))}
                          className="text-[#B91C1C]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Product Image Upload (MinIO) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                  Product Packaging Image (MinIO Upload or Path)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={prodPrimaryImage}
                    onChange={(e) => setProdPrimaryImage(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs font-mono"
                  />
                  <label className="px-3 py-2 rounded-lg bg-[#EFECE4] hover:bg-[#E2DDD2] text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingImage ? 'Uploading...' : 'Upload to MinIO'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#E2DDD2] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0F2C1D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#C59B27]" />
                  {editingProduct ? 'Save Product Changes' : 'Add Product to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: BULK PRICE ADJUSTER
         ==================================================================== */}
      {showBulkPriceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2DDD2] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-3">
              <h3 className="text-base font-bold text-[#0F1F16]">
                Raise / Adjust Inventory Prices
              </h3>
              <button onClick={() => setShowBulkPriceModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBulkPriceAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                  Target Category
                </label>
                <select
                  value={bulkAdjCategory}
                  onChange={(e) => setBulkAdjCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-sm bg-white"
                >
                  <option value="All">All Inventory Products</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      Only {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                    Direction
                  </label>
                  <select
                    value={bulkAdjDir}
                    onChange={(e) => setBulkAdjDir(e.target.value as 'INCREASE' | 'DECREASE')}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs font-semibold bg-white"
                  >
                    <option value="INCREASE">Raise Prices (+)</option>
                    <option value="DECREASE">Lower Prices (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                    Mode
                  </label>
                  <select
                    value={bulkAdjType}
                    onChange={(e) => setBulkAdjType(e.target.value as 'PERCENTAGE' | 'FLAT')}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-xs font-semibold bg-white"
                  >
                    <option value="PERCENTAGE">By Percentage (%)</option>
                    <option value="FLAT">By Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                  Adjustment Value ({bulkAdjType === 'PERCENTAGE' ? '%' : '₹'})
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={bulkAdjValue}
                  onChange={(e) => setBulkAdjValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2DDD2] text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkPriceModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#E2DDD2] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0F2C1D] text-white text-xs font-semibold cursor-pointer"
                >
                  Apply Price Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: CHANGE CUSTOMER PASSWORD
         ==================================================================== */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2DDD2] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-3">
              <h3 className="text-base font-bold text-[#0F1F16]">
                Update Password for {passwordModalUser.name}
              </h3>
              <button onClick={() => setPasswordModalUser(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#4A5D52]">
              Account Email: <strong className="font-mono">{passwordModalUser.email}</strong>
            </p>
            <form onSubmit={handleUpdateCustomerPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5D52] mb-1">
                  New Login Password
                </label>
                <input
                  type="text"
                  required
                  minLength={4}
                  value={newCustomerPassword}
                  onChange={(e) => setNewCustomerPassword(e.target.value)}
                  placeholder="Enter new password (min 4 chars)..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2DDD2] text-sm font-mono"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-lg border border-[#E2DDD2] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0F2C1D] text-white text-xs font-semibold cursor-pointer"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
