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

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    category: 'walnuts',
    origin: 'Shopian & Pulwama, Kashmir',
    batchCode: 'KB-2026-NEW',
    stockQuantity: 50,
    promotionalOfferTag: '',
    isCombo: false,
    primaryImage: '/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg',
    description: '',
    netWeights: [
      { weight: '250g', price: 299, originalPrice: 399, inStock: true },
      { weight: '500g', price: 499, originalPrice: 649, inStock: true },
      { weight: '1kg', price: 949, originalPrice: 1199, inStock: true },
    ],
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
    try {
      const res = await adminApi.toggleProductStock(product._id);
      if (res.success) {
        showNotice(`Updated stock for "${product.name}"`);
        loadData();
      }
    } catch (err) {
      console.error('Stock toggle error:', err);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      const res = await adminApi.deleteProduct(product._id);
      if (res.success) {
        showNotice(`Deleted "${product.name}"`);
        loadData();
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      subtitle: '',
      category: categories[0]?.id || 'walnuts',
      origin: 'Shopian & Pulwama, Kashmir',
      batchCode: `KB-2026-${Math.floor(100 + Math.random() * 900)}`,
      stockQuantity: 50,
      promotionalOfferTag: '',
      isCombo: false,
      primaryImage: '/assets/aistudio/WhatsApp_Image_2026-11-03_at_6.27.20_PM__1__737dbd41.jpeg',
      description: 'Handpicked pristine Kashmir harvest packed with pure mountain aroma.',
      netWeights: [
        { weight: '250g', price: 299, originalPrice: 399, inStock: true },
        { weight: '500g', price: 499, originalPrice: 649, inStock: true },
        { weight: '1kg', price: 949, originalPrice: 1199, inStock: true },
      ],
    });
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      subtitle: product.subtitle || product.tagline || '',
      category: product.category || 'walnuts',
      origin: product.origin || product.certificate?.originDistrict || 'Kashmir',
      batchCode: product.batchCode || 'KB-2026-BATCH',
      stockQuantity: product.stockQuantity ?? 50,
      promotionalOfferTag: product.promotionalOfferTag || '',
      isCombo: Boolean(product.isCombo),
      primaryImage: product.primaryImage || (product.images && product.images[0]) || '',
      description: product.description || '',
      netWeights: Array.isArray(product.netWeights) && product.netWeights.length > 0
        ? product.netWeights.map((nw) => ({
            weight: nw.weight,
            price: nw.price,
            originalPrice: nw.originalPrice || Math.round(nw.price * 1.25),
            inStock: nw.inStock !== false,
          }))
        : [{ weight: '500g', price: product.price, originalPrice: product.originalPrice, inStock: true }],
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const baseWeight = formData.netWeights[0] || { price: 499, originalPrice: 649 };
    const payload = {
      name: formData.name.trim(),
      subtitle: formData.subtitle.trim(),
      tagline: formData.subtitle.trim(),
      category: formData.category,
      price: Number(baseWeight.price),
      originalPrice: Number(baseWeight.originalPrice || Math.round(baseWeight.price * 1.25)),
      origin: formData.origin,
      batchCode: formData.batchCode,
      stockQuantity: Number(formData.stockQuantity),
      promotionalOfferTag: formData.promotionalOfferTag,
      isCombo: Boolean(formData.isCombo),
      primaryImage: formData.primaryImage,
      images: [formData.primaryImage],
      description: formData.description,
      netWeights: formData.netWeights,
    };

    try {
      let res;
      if (editingProduct) {
        res = await adminApi.updateProduct(editingProduct._id, payload);
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
        setFormData((prev) => ({ ...prev, primaryImage: res.data.url }));
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
                      No products matched your search or category filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p._id} className="hover:bg-brand-canvas/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.primaryImage || (p.images && p.images[0])}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-xl border border-brand-sand/70 shrink-0"
                          />
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
                        <div className="flex flex-wrap gap-1">
                          {p.netWeights?.map((w) => (
                            <span
                              key={w.weight}
                              className="px-2 py-0.5 rounded-md bg-brand-canvas text-[10px] font-mono border border-brand-sand text-brand-text-body"
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
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-brand-sand my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-sand">
              <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
                {editingProduct ? 'Edit Harvest Product' : 'Add New Harvest Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-brand-text-subtle hover:text-brand-text-display cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="pt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald capitalize"
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
                    value={formData.batchCode}
                    onChange={(e) => setFormData({ ...formData, batchCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>

              {/* Image Input & Upload */}
              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Product Image URL or Upload
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.primaryImage}
                    onChange={(e) => setFormData({ ...formData, primaryImage: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                  />
                  <label className="px-3.5 py-2 rounded-xl bg-brand-emerald-tint text-brand-emerald font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-brand-emerald hover:text-white transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Weight Variants */}
              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Weight & Price Tiers
                </label>
                <div className="space-y-2">
                  {formData.netWeights.map((nw, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Weight (e.g. 500g)"
                        value={nw.weight}
                        onChange={(e) => {
                          const updated = [...formData.netWeights];
                          updated[idx].weight = e.target.value;
                          setFormData({ ...formData, netWeights: updated });
                        }}
                        className="w-1/3 p-2 rounded-lg border border-brand-sand text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Price (₹)"
                        value={nw.price}
                        onChange={(e) => {
                          const updated = [...formData.netWeights];
                          updated[idx].price = Number(e.target.value);
                          setFormData({ ...formData, netWeights: updated });
                        }}
                        className="w-1/3 p-2 rounded-lg border border-brand-sand text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Orig Price (₹)"
                        value={nw.originalPrice || ''}
                        onChange={(e) => {
                          const updated = [...formData.netWeights];
                          updated[idx].originalPrice = Number(e.target.value);
                          setFormData({ ...formData, netWeights: updated });
                        }}
                        className="w-1/3 p-2 rounded-lg border border-brand-sand text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-sand">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl border border-brand-sand text-xs font-semibold hover:bg-brand-canvas cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-emerald text-brand-gold font-bold text-xs shadow-md hover:bg-brand-emerald-dark transition-all cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
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
