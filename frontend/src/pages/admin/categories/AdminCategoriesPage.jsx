import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, Trash2, X } from 'lucide-react';
import { adminApi } from '../../../services/admin.api.js';
import { AdminHeader } from '../components/AdminHeader.jsx';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const showNotice = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadCategories = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await adminApi.getCategories();
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!id.trim() || !name.trim()) return;

    try {
      const res = await adminApi.createCategory({
        id: id.trim().toLowerCase(),
        name: name.trim(),
        description: description.trim(),
      });

      if (res.success) {
        showNotice(`Category "${name}" added successfully`);
        setShowAddModal(false);
        setId('');
        setName('');
        setDescription('');
        loadCategories();
      } else {
        alert(res.message || 'Failed to create category');
      }
    } catch (err) {
      console.error('Create category error:', err);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const catId = cat.id || cat._id;
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;

    try {
      const res = await adminApi.deleteCategory(catId);
      if (res.success) {
        showNotice(`Deleted category "${cat.name}"`);
        loadCategories();
      } else {
        alert(res.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Delete category error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Category Architecture"
        subtitle="Manage product classification, descriptions and harvest collection groupings"
        onRefresh={loadCategories}
        isRefreshing={isRefreshing}
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-emerald hover:bg-brand-emerald-dark text-brand-gold text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        }
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-brand-emerald-tint border border-brand-emerald/30 text-xs text-brand-emerald font-semibold">
            {toastMessage}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-brand-sand/70 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-canvas text-brand-text-muted uppercase text-[10px] tracking-wider border-b border-brand-sand/70">
              <tr>
                <th className="py-3 px-4 font-bold">Category Identifier</th>
                <th className="py-3 px-4 font-bold">Display Name</th>
                <th className="py-3 px-4 font-bold">Description</th>
                <th className="py-3 px-4 font-bold">Products Count</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sand/60">
              {categories.map((c) => (
                <tr key={c._id || c.id} className="hover:bg-brand-canvas/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-emerald">
                    {c.id || c.slug}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-brand-text-display">
                    {c.name}
                  </td>
                  <td className="py-3.5 px-4 text-brand-text-muted max-w-md">
                    {c.description || '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-brand-text-display">
                    {c.productCount ?? c.count ?? 0} items
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteCategory(c)}
                      className="p-1.5 rounded-lg text-brand-text-subtle hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete category"
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

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-sand">
            <div className="flex items-center justify-between pb-3 border-b border-brand-sand">
              <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
                Create New Category
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-brand-text-subtle hover:text-brand-text-display cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="pt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Category ID / Slug
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. saffron or dry-fruits"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald lowercase"
                />
              </div>

              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Display Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kashmiri Mongra Saffron"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short provenance or product highlight description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-brand-sand text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-emerald text-brand-gold font-bold text-xs shadow-md cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
