import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  SlidersHorizontal,
  Upload,
  X,
  Image as ImageIcon,
  Star,
  Check,
} from 'lucide-react';
import { adminApi } from '../../../services/admin.api.js';
import { AdminHeader } from '../components/AdminHeader.jsx';

export const AdminInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    category: 'walnuts',
    origin: '',
    batchCode: '',
    stockQuantity: 50,
    promotionalOfferTag: '',
    isCombo: false,
    primaryImage: '',
    images: [],
    description: '',
    netWeights: [],
  });

  // Bulk Price Form State
  const [bulkPercentage, setBulkPercentage] = useState(10);
  const [bulkCategory, setBulkCategory] = useState('All');

  const showNotice = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories(),
      ]);

      if (prodRes.success && Array.isArray(prodRes.data)) {
        setProducts(prodRes.data);
      }
      if (catRes.success && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Error loading inventory data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleToggleStock = async (product) => {
    const productId = product._id || product.id || product.slug;
    if (!productId) return;
    try {
      const res = await adminApi.toggleProductStock(productId);
      if (res && (res.success || res.status === 1)) {
        showNotice(`Updated stock for "${product.name}"`);
        loadData();
      } else {
        alert(res?.message || 'Failed to update stock');
      }
    } catch (err) {
      console.error('Stock toggle error:', err);
      alert(err.message || 'Error updating stock');
    }
  };

  const handleDelete = async (product) => {
    const productId = product._id || product.id || product.slug;
    if (!productId) {
      alert('Product ID not found');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      const res = await adminApi.deleteProduct(productId);
      if (res && (res.success || res.status === 1)) {
        showNotice(`Deleted "${product.name}"`);
        loadData();
      } else {
        alert(res?.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Delete product error:', err);
      alert(err.message || 'Error deleting product');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setImageUrlInput('');
    setFormData({
      name: '',
      subtitle: '',
      category: categories[0]?.id || categories[0]?.slug || 'walnuts',
      origin: '',
      batchCode: '',
      stockQuantity: 50,
      promotionalOfferTag: '',
      isCombo: false,
      primaryImage: '',
      images: [],
      description: '',
      netWeights: [
        { weight: '500g', price: '', originalPrice: '', inStock: true, stockQuantity: 50 },
      ],
    });
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setImageUrlInput('');
    const resolvedImages = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.primaryImage].filter(Boolean);
    const primaryImg = product.primaryImage || resolvedImages[0] || '';

    setFormData({
      name: product.name || '',
      subtitle: product.subtitle || product.tagline || '',
      category: product.category || categories[0]?.id || 'walnuts',
      origin: product.origin || product.certificate?.originDistrict || '',
      batchCode: product.batchCode || product.certificate?.certificateNumber || '',
      stockQuantity: product.stockQuantity ?? 50,
      promotionalOfferTag: product.promotionalOfferTag || '',
      isCombo: Boolean(product.isCombo),
      primaryImage: primaryImg,
      images: resolvedImages,
      description: product.description || '',
      netWeights: Array.isArray(product.netWeights) && product.netWeights.length > 0
        ? product.netWeights.map((nw) => ({
            weight: nw.weight || '500g',
            price: nw.price !== undefined ? nw.price : (product.price || ''),
            originalPrice: nw.originalPrice !== undefined ? nw.originalPrice : '',
            inStock: nw.inStock !== false,
            stockQuantity: Number(nw.stockQuantity ?? 50),
          }))
        : [{ weight: '500g', price: product.price || '', originalPrice: product.originalPrice || '', inStock: true, stockQuantity: 50 }],
    });
    setShowProductModal(true);
  };

  const handleAddVariation = () => {
    const count = formData.netWeights.length;
    const defaultWeights = ['250g', '500g', '1kg', '2kg', '5kg'];
    const usedWeights = new Set(formData.netWeights.map((w) => String(w.weight || '').toLowerCase().trim()));
    const nextWeight = defaultWeights.find((w) => !usedWeights.has(w.toLowerCase())) || `Pack-${count + 1}`;
    const lastPrice = formData.netWeights[count - 1]?.price || '';

    setFormData((prev) => ({
      ...prev,
      netWeights: [
        ...prev.netWeights,
        {
          weight: nextWeight,
          price: lastPrice,
          originalPrice: lastPrice ? Math.round(Number(lastPrice) * 1.25) : '',
          inStock: true,
          stockQuantity: 50,
        },
      ],
    }));
  };

  const handleRemoveVariation = (indexToRemove) => {
    if (formData.netWeights.length <= 1) {
      showNotice('Product must have at least one weight variation.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      netWeights: prev.netWeights.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleMultipleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    try {
      const res = await adminApi.uploadMultipleMedia(files, 'products');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const newUrls = res.data.map((item) => item.url).filter(Boolean);
        setFormData((prev) => {
          const currentImages = Array.isArray(prev.images) ? prev.images : [];
          const combinedImages = [...currentImages, ...newUrls];
          return {
            ...prev,
            images: combinedImages,
            primaryImage: prev.primaryImage || combinedImages[0],
          };
        });
        showNotice(`Uploaded ${newUrls.length} picture${newUrls.length > 1 ? 's' : ''} to storage`);
      } else {
        alert(res.message || 'Failed to upload pictures');
      }
    } catch (err) {
      console.error('Multiple image upload error:', err);
      alert('Error uploading pictures: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      const isRemovedPrimary = prev.images[indexToRemove] === prev.primaryImage;
      return {
        ...prev,
        images: newImages,
        primaryImage: isRemovedPrimary ? newImages[0] || '' : prev.primaryImage,
      };
    });
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const currentImages = Array.isArray(prev.images) ? prev.images : [];
      const updated = [...currentImages, trimmed];
      return {
        ...prev,
        images: updated,
        primaryImage: prev.primaryImage || trimmed,
      };
    });
    setImageUrlInput('');
    showNotice('Image URL added to gallery');
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    if (!formData.netWeights || formData.netWeights.length === 0) {
      alert('Please add at least one weight variation for the product');
      return;
    }

    const baseWeight = formData.netWeights[0] || { price: 0, originalPrice: 0 };
    const resolvedImages = (formData.images || []).filter(Boolean);
    const primaryImg = formData.primaryImage || resolvedImages[0] || '';

    const payload = {
      name: formData.name.trim(),
      subtitle: formData.subtitle.trim(),
      tagline: formData.subtitle.trim(),
      category: formData.category,
      price: Number(baseWeight.price || 0),
      originalPrice: Number(baseWeight.originalPrice || (baseWeight.price ? Math.round(baseWeight.price * 1.25) : 0)),
      origin: formData.origin,
      batchCode: formData.batchCode,
      stockQuantity: Number(formData.stockQuantity || 0),
      promotionalOfferTag: formData.promotionalOfferTag,
      isCombo: Boolean(formData.isCombo),
      primaryImage: primaryImg,
      images: resolvedImages,
      description: formData.description,
      netWeights: formData.netWeights.map((w) => ({
        weight: String(w.weight).trim(),
        price: Number(w.price),
        originalPrice: Number(w.originalPrice || Math.round(Number(w.price) * 1.25)),
        inStock: w.inStock !== false,
        stockQuantity: Number(w.stockQuantity ?? 50),
      })),
    };

    try {
      let res;
      if (editingProduct) {
        const editId = editingProduct._id || editingProduct.id || editingProduct.slug;
        res = await adminApi.updateProduct(editId, payload);
      } else {
        res = await adminApi.createProduct(payload);
      }

      if (res.success) {
        showNotice(editingProduct ? 'Product updated successfully' : 'Product created successfully');
        setShowProductModal(false);
        loadData();
      } else {
        alert(res.message || 'Failed to save product');
      }
    } catch (err) {
      console.error('Save product error:', err);
    }
  };

  const handleBulkPriceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminApi.bulkAdjustPrices(Number(bulkPercentage), bulkCategory);
      if (res.success) {
        showNotice(`Bulk price adjustment (${bulkPercentage}%) applied`);
        setShowBulkPriceModal(false);
        loadData();
      }
    } catch (err) {
      console.error('Bulk adjust error:', err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await adminApi.uploadMedia(file, 'products');
      if (res.success && res.data?.url) {
        setFormData((prev) => {
          const currentImages = Array.isArray(prev.images) ? prev.images : [];
          return {
            ...prev,
            primaryImage: res.data.url,
            images: currentImages.includes(res.data.url) ? currentImages : [res.data.url, ...currentImages],
          };
        });
        showNotice('Image uploaded to MinIO storage');
      }
    } catch (err) {
      console.error('Image upload error:', err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat =
      selectedCategory === 'All' ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.subtitle?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Product Catalog & Inventory"
        subtitle={`Total of ${products.length} harvest items catalogued`}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkPriceModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-sand bg-white hover:bg-brand-canvas text-xs font-medium text-brand-text-body transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-gold-dark" />
              <span>Bulk Price</span>
            </button>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-emerald hover:bg-brand-emerald-dark text-brand-gold text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Product</span>
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-brand-emerald-tint border border-brand-emerald/30 text-xs text-brand-emerald font-semibold">
            {toastMessage}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-brand-sand/70 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-brand-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or tagline..."
              className="w-full text-xs pl-10 pr-3.5 py-2 rounded-xl border border-brand-sand bg-white text-brand-text-display placeholder:text-brand-text-subtle focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-brand-emerald text-brand-gold font-bold shadow-xs'
                  : 'bg-brand-canvas text-brand-text-body hover:bg-brand-sand/50'
              }`}
            >
              All Categories ({products.length})
            </button>

            {categories.map((c) => (
              <button
                key={c._id || c.id}
                onClick={() => setSelectedCategory(c.id || c.slug || c.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory.toLowerCase() === (c.id || c.slug || c.name).toLowerCase()
                    ? 'bg-brand-emerald text-brand-gold font-bold shadow-xs'
                    : 'bg-brand-canvas text-brand-text-body hover:bg-brand-sand/50'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-brand-sand/70 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-canvas text-brand-text-muted uppercase text-[10px] tracking-wider border-b border-brand-sand/70">
                <tr>
                  <th className="py-3 px-4 font-bold">Product</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Base Price</th>
                  <th className="py-3 px-4 font-bold">Weights</th>
                  <th className="py-3 px-4 font-bold">Stock Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand/60">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-brand-text-muted">
                      {products.length === 0
                        ? 'No products found in inventory. Click "+ New Product" to add your first product.'
                        : 'No products matched your search or category filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p._id || p.id || p.slug} className="hover:bg-brand-canvas/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {p.primaryImage || (Array.isArray(p.images) && p.images[0]) ? (
                              <img
                                src={p.primaryImage || p.images[0]}
                                alt={p.name}
                                className="w-12 h-12 object-cover rounded-xl border border-brand-sand/70 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-brand-canvas border border-brand-sand/70 flex items-center justify-center shrink-0 text-brand-text-subtle">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                            {Array.isArray(p.images) && p.images.length > 1 && (
                              <span
                                className="absolute -top-1 -right-1 bg-brand-emerald text-brand-gold text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-xs border border-brand-gold/30"
                                title={`${p.images.length} pictures uploaded`}
                              >
                                {p.images.length}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-brand-text-display block truncate">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-brand-text-muted truncate block">
                              {p.subtitle || p.tagline}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 capitalize font-medium text-brand-text-body">
                        {p.category}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-brand-emerald">
                        ₹{p.price}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          {p.netWeights?.map((w, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                                w.inStock !== false
                                  ? 'bg-brand-canvas border-brand-sand text-brand-text-body'
                                  : 'bg-rose-50 border-rose-200 text-rose-500 line-through'
                              }`}
                              title={`Stock: ${w.stockQuantity ?? 50}`}
                            >
                              {w.weight}: ₹{w.price}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStock(p)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            p.inStock
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {p.inStock ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>In Stock</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Out of Stock</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-brand-text-subtle hover:text-brand-emerald hover:bg-brand-emerald-tint transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 rounded-lg text-brand-text-subtle hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-brand-sand my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-sand">
              <div>
                <h3 className="font-serif-brand text-lg sm:text-xl font-bold text-brand-text-display">
                  {editingProduct ? 'Edit Harvest Product' : 'Add New Harvest Product'}
                </h3>
                <p className="text-[11px] text-brand-text-muted mt-0.5">
                  Configure product details, multi-angle harvest photography, and tiered weight variations.
                </p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-brand-text-subtle hover:text-brand-text-display p-1 rounded-lg hover:bg-brand-canvas transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="pt-4 space-y-5 text-xs">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Extra-Bold Mamra Almonds"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald capitalize cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c._id || c.id} value={c.id || c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Single-Origin High Altitude Orchards, Shopian"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Origin
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pulwama & Shopian, Kashmir"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Batch Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KB-2026-B08"
                    value={formData.batchCode}
                    onChange={(e) => setFormData({ ...formData, batchCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Total Base Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>

              {/* 1. MULTIPLE PICTURES & GALLERY SECTION */}
              <div className="p-4 rounded-2xl bg-brand-canvas/50 border border-brand-sand/80 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-brand-sand/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-emerald-tint flex items-center justify-center text-brand-emerald">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif-brand text-sm font-bold text-brand-text-display flex items-center gap-2">
                        <span>Product Pictures & Gallery</span>
                        <span className="px-2 py-0.5 rounded-full bg-brand-emerald text-brand-gold text-[10px] font-bold">
                          {formData.images.length} {formData.images.length === 1 ? 'photo' : 'photos'}
                        </span>
                      </h4>
                      <p className="text-[10px] text-brand-text-muted">
                        Upload multiple high-res pictures. The picture marked ★ Cover is shown as the primary store thumbnail.
                      </p>
                    </div>
                  </div>

                  {/* Multi-Picture Upload Button */}
                  <label
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-emerald hover:bg-brand-emerald-dark text-brand-gold font-bold text-xs transition-all shadow-xs cursor-pointer shrink-0 ${
                      isUploadingImages ? 'opacity-70 cursor-wait' : ''
                    }`}
                  >
                    {isUploadingImages ? (
                      <span className="w-3.5 h-3.5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingImages ? 'Uploading Photos...' : 'Upload Pictures (Multiple)'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={isUploadingImages}
                      onChange={handleMultipleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Direct Image URL input */}
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Or paste direct image URL (e.g. /assets/... or https://...) and click + Add"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    className="flex-1 p-2 rounded-xl border border-brand-sand bg-white text-xs focus:outline-none focus:border-brand-emerald placeholder:text-brand-text-subtle"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={!imageUrlInput.trim()}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-brand-canvas border border-brand-sand text-brand-text-body font-semibold text-xs cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    + Add URL
                  </button>
                </div>

                {/* Uploaded Thumbnails Grid */}
                {formData.images.length === 0 ? (
                  <div className="py-6 text-center text-brand-text-muted border-2 border-dashed border-brand-sand rounded-xl bg-white">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 text-brand-text-subtle opacity-60" />
                    <p className="text-xs">No pictures uploaded yet. Click &quot;Upload Pictures&quot; above to add photos.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.images.map((imgUrl, idx) => {
                      const isPrimary = formData.primaryImage === imgUrl || (!formData.primaryImage && idx === 0);
                      return (
                        <div
                          key={idx}
                          className={`group relative rounded-xl overflow-hidden border-2 transition-all bg-white shadow-2xs ${
                            isPrimary
                              ? 'border-brand-gold ring-2 ring-brand-gold/30'
                              : 'border-brand-sand/80 hover:border-brand-emerald/60'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-24 sm:h-28 object-cover bg-brand-canvas"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />

                          {/* Primary Cover Badge or Action */}
                          {isPrimary ? (
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-brand-gold text-brand-emerald-deep font-bold text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-brand-emerald-deep" />
                              <span>Cover</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, primaryImage: imgUrl }))}
                              className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/70 hover:bg-brand-emerald text-white text-[9px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-medium shadow-xs"
                            >
                              Set as Cover
                            </button>
                          )}

                          {/* Remove Image Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                            title="Remove picture"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <div className="p-1.5 text-[10px] text-brand-text-muted truncate bg-brand-canvas/80 border-t border-brand-sand/50 flex items-center justify-between">
                            <span className="truncate">Photo #{idx + 1}</span>
                            {isPrimary && (
                              <span className="text-brand-gold-dark font-bold text-[9px]">Main</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. VARIATIONS (NET WEIGHTS & PRICING) SECTION */}
              <div className="p-4 rounded-2xl bg-brand-canvas/50 border border-brand-sand/80 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-brand-sand/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-gold-tint flex items-center justify-center text-brand-gold-dark">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif-brand text-sm font-bold text-brand-text-display flex items-center gap-2">
                        <span>Product Variations & Price Tiers</span>
                        <span className="px-2 py-0.5 rounded-full bg-brand-gold text-brand-emerald-deep text-[10px] font-bold">
                          {formData.netWeights.length} {formData.netWeights.length === 1 ? 'variation' : 'variations'}
                        </span>
                      </h4>
                      <p className="text-[10px] text-brand-text-muted">
                        Configure pack sizes (e.g. 250g, 500g, 1kg). Add or remove variations with individual prices and inventory.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-brand-emerald text-brand-emerald hover:bg-brand-emerald hover:text-white font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Variation</span>
                  </button>
                </div>

                {/* Column Headers for Desktop */}
                <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-text-muted px-2">
                  <div className="col-span-4">Weight / Pack Size *</div>
                  <div className="col-span-2">Price (₹) *</div>
                  <div className="col-span-2">Orig MRP (₹)</div>
                  <div className="col-span-2">Stock Qty</div>
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-1 text-right">Remove</div>
                </div>

                {/* Variations Rows */}
                <div className="space-y-2">
                  {formData.netWeights.map((nw, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-brand-sand bg-white shadow-2xs space-y-2 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center"
                    >
                      {/* Weight / Pack Label */}
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-brand-text-muted font-bold block sm:hidden mb-0.5">
                          Weight / Pack Size *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 500g, 1kg, 250g"
                          value={nw.weight}
                          onChange={(e) => {
                            const updated = [...formData.netWeights];
                            updated[idx] = { ...updated[idx], weight: e.target.value };
                            setFormData({ ...formData, netWeights: updated });
                          }}
                          className="w-full p-2 rounded-lg border border-brand-sand text-xs font-semibold text-brand-text-display focus:outline-none focus:border-brand-emerald"
                        />
                      </div>

                      {/* Selling Price */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-brand-text-muted font-bold block sm:hidden mb-0.5">
                          Price (₹) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-text-muted text-xs">₹</span>
                          <input
                            type="number"
                            min="1"
                            required
                            placeholder="Price"
                            value={nw.price}
                            onChange={(e) => {
                              const updated = [...formData.netWeights];
                              updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                              setFormData({ ...formData, netWeights: updated });
                            }}
                            className="w-full pl-6 pr-2 py-2 rounded-lg border border-brand-sand text-xs font-semibold focus:outline-none focus:border-brand-emerald"
                          />
                        </div>
                      </div>

                      {/* Original Price (MRP) */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-brand-text-muted font-bold block sm:hidden mb-0.5">
                          Orig MRP (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-text-muted text-xs">₹</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="Orig Price"
                            value={nw.originalPrice || ''}
                            onChange={(e) => {
                              const updated = [...formData.netWeights];
                              updated[idx] = { ...updated[idx], originalPrice: Number(e.target.value) };
                              setFormData({ ...formData, netWeights: updated });
                            }}
                            className="w-full pl-6 pr-2 py-2 rounded-lg border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                          />
                        </div>
                      </div>

                      {/* Stock Quantity */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-brand-text-muted font-bold block sm:hidden mb-0.5">
                          Stock Qty
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Stock"
                          value={nw.stockQuantity ?? 50}
                          onChange={(e) => {
                            const updated = [...formData.netWeights];
                            updated[idx] = { ...updated[idx], stockQuantity: Number(e.target.value) };
                            setFormData({ ...formData, netWeights: updated });
                          }}
                          className="w-full p-2 rounded-lg border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                        />
                      </div>

                      {/* In Stock Checkbox */}
                      <div className="sm:col-span-1 flex items-center justify-between sm:justify-center">
                        <label className="text-[10px] text-brand-text-muted font-bold block sm:hidden">
                          In Stock
                        </label>
                        <input
                          type="checkbox"
                          checked={nw.inStock !== false}
                          onChange={(e) => {
                            const updated = [...formData.netWeights];
                            updated[idx] = { ...updated[idx], inStock: e.target.checked };
                            setFormData({ ...formData, netWeights: updated });
                          }}
                          className="w-4 h-4 rounded border-brand-sand text-brand-emerald focus:ring-brand-emerald cursor-pointer"
                          title="Toggle in-stock status"
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariation(idx)}
                          disabled={formData.netWeights.length <= 1}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            formData.netWeights.length <= 1
                              ? 'opacity-25 cursor-not-allowed border-transparent text-gray-400'
                              : 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                          }`}
                          title={formData.netWeights.length <= 1 ? 'Product must have at least 1 variation' : 'Remove variation'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Add Helper */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleAddVariation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-brand-emerald/70 text-brand-emerald hover:bg-brand-emerald-tint/50 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Variation</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the provenance, orchard location, and harvest taste notes..."
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-brand-sand">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl border border-brand-sand text-xs font-semibold hover:bg-brand-canvas cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-emerald text-brand-gold font-bold text-xs shadow-md hover:bg-brand-emerald-dark transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Price Adjustment Modal */}
      {showBulkPriceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-sand">
            <h3 className="font-serif-brand text-lg font-bold text-brand-text-display mb-1">
              Bulk Price Adjustment
            </h3>
            <p className="text-xs text-brand-text-muted mb-4">
              Apply a percentage increase or decrease across products.
            </p>

            <form onSubmit={handleBulkPriceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Percentage (+ for markup, - for discount)
                </label>
                <input
                  type="number"
                  value={bulkPercentage}
                  onChange={(e) => setBulkPercentage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Target Category
                </label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id || c.id} value={c.id || c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBulkPriceModal(false)}
                  className="px-4 py-2 rounded-xl border border-brand-sand text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-emerald text-brand-gold font-bold text-xs shadow-md cursor-pointer"
                >
                  Apply Price Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;
