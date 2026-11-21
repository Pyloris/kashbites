import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, KeyRound, X, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../../../services/admin.api.js';
import { AdminHeader } from '../components/AdminHeader.jsx';

export const AdminUsersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Password reset modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const showNotice = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadUsers = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await adminApi.getUsers();
      if (res.success && Array.isArray(res.data)) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newPassword.trim()) return;

    try {
      const userId = selectedUser._id || selectedUser.id || selectedUser.email;
      const res = await adminApi.updateUserPassword(userId, newPassword.trim());
      if (res.success) {
        showNotice(`Password reset for ${selectedUser.name}`);
        setSelectedUser(null);
        setNewPassword('');
      } else {
        alert(res.message || 'Failed to update customer password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
    }
  };

  const filteredUsers = customers.filter((u) => {
    return (
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Customer Profiles & Loyalty Club"
        subtitle={`Managing ${customers.length} registered customers across India`}
        onRefresh={loadUsers}
        isRefreshing={isRefreshing}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-brand-emerald-tint border border-brand-emerald/30 text-xs text-brand-emerald font-semibold">
            {toastMessage}
          </div>
        )}

        {/* Search */}
        <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-brand-sand/70 shadow-2xs">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-brand-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer by name, email, or phone..."
              className="w-full text-xs pl-10 pr-3.5 py-2 rounded-xl border border-brand-sand bg-white text-brand-text-display placeholder:text-brand-text-subtle focus:outline-none focus:border-brand-emerald"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl border border-brand-sand/70 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-canvas text-brand-text-muted uppercase text-[10px] tracking-wider border-b border-brand-sand/70">
              <tr>
                <th className="py-3 px-4 font-bold">Customer</th>
                <th className="py-3 px-4 font-bold">Contact</th>
                <th className="py-3 px-4 font-bold">Membership Tier</th>
                <th className="py-3 px-4 font-bold">Addresses</th>
                <th className="py-3 px-4 font-bold">Joined Date</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sand/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-text-muted">
                    No customer accounts match your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id || u.email} className="hover:bg-brand-canvas/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-emerald-tint text-brand-emerald font-bold flex items-center justify-center shrink-0">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-brand-text-display block">
                            {u.name}
                          </span>
                          <span className="text-[11px] text-brand-text-muted font-mono">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-brand-text-body">
                      {u.phone || '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-gold-tint text-brand-gold-dark border border-brand-gold/30">
                        {u.memberTier || 'Chinar Club'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-brand-text-body font-medium">
                        {u.addresses?.length || 0} saved addresses
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-brand-text-muted">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active Member'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setNewPassword('kashbites@2026');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-brand-sand text-brand-text-subtle hover:text-brand-emerald hover:bg-brand-emerald-tint transition-colors cursor-pointer text-[11px] font-semibold"
                        title="Reset customer password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Reset PW</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-brand-sand">
            <div className="flex items-center justify-between pb-3 border-b border-brand-sand">
              <h3 className="font-serif-brand text-base font-bold text-brand-text-display">
                Reset Password for {selectedUser.name}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-brand-text-subtle hover:text-brand-text-display cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="pt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl border border-brand-sand text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-emerald text-brand-gold font-bold text-xs shadow-md cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
