import React, { useState, useEffect, useCallback } from 'react';
import {
  Phone,
  Copy,
  Check,
  MessageCircle,
  Search,
  Users,
  UserCheck,
  UserX,
  Clock,
  Trash2,
  Download,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  Tag,
} from 'lucide-react';
import { adminApi } from '../../../services/admin.api.js';
import { AdminHeader } from '../components/AdminHeader.jsx';
import { AdminStatCard } from '../components/AdminStatCard.jsx';

export const AdminLeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    withName: 0,
    withoutName: 0,
    pending: 0,
    notified: 0,
    converted: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [leadToDelete, setLeadToDelete] = useState(null);

  const showNotice = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadLeads = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await adminApi.getLeads({ limit: 500 });
      if (res.success && res.data) {
        setLeads(res.data.leads || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Error loading prelaunch leads:', err);
      showNotice('Failed to fetch leads. Please check backend connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Copy single phone number
  const handleCopyPhone = (id, phone, e) => {
    if (e) e.stopPropagation();
    try {
      navigator.clipboard.writeText(phone);
      setCopiedId(id);
      showNotice(`Copied ${phone} to clipboard`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy phone:', err);
    }
  };

  // Copy all visible phone numbers
  const handleCopyAllPhones = () => {
    const phoneList = filteredLeads.map((l) => l.phone).filter(Boolean);
    if (phoneList.length === 0) return;

    try {
      const textToCopy = phoneList.join(', ');
      navigator.clipboard.writeText(textToCopy);
      setCopiedAll(true);
      showNotice(`Copied ${phoneList.length} phone numbers (comma-separated)`);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (err) {
      console.error('Failed to copy all phones:', err);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;

    const headers = ['Phone', 'Name', 'Coupon Code', 'Status', 'Source', 'Registered At'];
    const rows = filteredLeads.map((l) => [
      `"${l.phone || ''}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${l.couponCode || 'KASHLAUNCH20'}"`,
      `"${l.status || 'pending'}"`,
      `"${l.source || 'launching_screen'}"`,
      `"${l.createdAt ? new Date(l.createdAt).toLocaleString('en-IN') : ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `kashbites-vip-leads-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotice(`Exported ${filteredLeads.length} leads to CSV`);
  };

  // Update lead status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await adminApi.updateLeadStatus(id, newStatus);
      if (res.success) {
        setLeads((prev) =>
          prev.map((lead) => (lead._id === id ? { ...lead, status: newStatus } : lead))
        );
        showNotice(`Lead status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showNotice('Failed to update lead status');
    }
  };

  // Delete lead
  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    try {
      const res = await adminApi.deleteLead(leadToDelete._id);
      if (res.success) {
        setLeads((prev) => prev.filter((lead) => lead._id !== leadToDelete._id));
        showNotice(`Lead ${leadToDelete.phone} removed`);
        setLeadToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
      showNotice('Failed to delete lead');
    }
  };

  // WhatsApp click handler
  const getWhatsAppLink = (phone, name) => {
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    const greeting = name ? `Hello ${name}! ` : 'Hello! ';
    const text = encodeURIComponent(
      `${greeting}Greetings from KashBites 🏔️! Your VIP prelaunch coupon KASHLAUNCH20 gives you 20% off pure single-origin Kashmiri dry fruits.`
    );
    return `https://wa.me/${digitsOnly}?text=${text}`;
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !search ||
      lead.phone?.toLowerCase().includes(search.toLowerCase()) ||
      lead.name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.couponCode?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === 'All' ||
      (lead.status || 'pending').toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Prelaunch VIP Leads"
        subtitle={`Managing ${leads.length} early-access subscriber leads collected from the launch landing screen`}
        onRefresh={loadLeads}
        isRefreshing={isRefreshing}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-brand-emerald-tint border border-brand-emerald/30 text-xs text-brand-emerald font-semibold shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage('')}
              className="text-brand-emerald hover:text-brand-emerald-dark text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard
            title="Total VIP Leads"
            value={stats.totalLeads || leads.length}
            subtitle="Prelaunch registered subscribers"
            icon={Users}
            trend={`${stats.withName || 0} named leads`}
          />

          <AdminStatCard
            title="With Name Provided"
            value={stats.withName || leads.filter((l) => l.name?.trim()).length}
            subtitle="Full identity & WhatsApp profile"
            icon={UserCheck}
            trend={`${Math.round(((stats.withName || 1) / (stats.totalLeads || 1)) * 100)}% completeness`}
          />

          <AdminStatCard
            title="Pending Outreach"
            value={stats.pending || leads.filter((l) => !l.status || l.status === 'pending').length}
            subtitle="Awaiting WhatsApp / SMS broadcast"
            icon={Clock}
          />

          <AdminStatCard
            title="VIP Converted"
            value={(stats.converted || 0) + (stats.notified || 0)}
            subtitle="Notified or placed first order"
            icon={Sparkles}
          />
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-brand-sand/70 shadow-2xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-brand-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by phone number, customer name, or coupon..."
              className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-brand-sand bg-white text-brand-text-display placeholder:text-brand-text-subtle focus:outline-none focus:border-brand-emerald transition-all"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Pending', 'Notified', 'Converted'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-brand-emerald text-brand-gold shadow-xs'
                    : 'bg-brand-canvas text-brand-text-subtle hover:bg-brand-sand-light hover:text-brand-text-display border border-brand-sand/60'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAllPhones}
              disabled={filteredLeads.length === 0}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                copiedAll
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-brand-canvas hover:bg-white text-brand-emerald border-brand-emerald/30 hover:border-brand-emerald'
              }`}
              title="Copy all currently filtered phone numbers to clipboard (comma-separated)"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>All Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-brand-gold-dark" />
                  <span>Copy Numbers</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredLeads.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-emerald text-brand-gold hover:bg-brand-emerald-dark transition-all cursor-pointer shadow-2xs"
              title="Download prelaunch leads as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Leads Table Card */}
        <div className="bg-white rounded-2xl border border-brand-sand/70 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-canvas text-brand-text-muted uppercase text-[10px] tracking-wider border-b border-brand-sand/70 select-none">
                <tr>
                  <th className="py-3 px-4 font-bold text-center w-12">#</th>
                  <th className="py-3 px-4 font-bold">Phone Number</th>
                  <th className="py-3 px-4 font-bold">Name</th>
                  <th className="py-3 px-4 font-bold">Coupon Code</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Registered</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-brand-text-muted">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-brand-emerald border-t-transparent rounded-full animate-spin" />
                        <span>Loading prelaunch VIP leads...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-brand-text-muted">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-brand-canvas flex items-center justify-center text-brand-text-subtle">
                          <Users className="w-5 h-5 text-brand-sand-dark" />
                        </div>
                        <p className="font-semibold text-brand-text-display">No VIP leads found</p>
                        <p className="text-[11px] text-brand-text-muted">
                          {search
                            ? `No leads match your search query "${search}"`
                            : 'No customer phone numbers collected yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, idx) => {
                    const isCopied = copiedId === lead._id;
                    const hasName = Boolean(lead.name && lead.name.trim().length > 0);
                    const waLink = getWhatsAppLink(lead.phone, lead.name);

                    return (
                      <tr
                        key={lead._id}
                        className="hover:bg-brand-canvas/70 transition-colors group"
                      >
                        {/* Index */}
                        <td className="py-3.5 px-4 text-center font-mono text-[11px] text-brand-text-muted">
                          {idx + 1}
                        </td>

                        {/* Phone Number with One-Click Copy & WhatsApp */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-brand-text-display tracking-tight text-xs bg-brand-canvas px-2.5 py-1 rounded-lg border border-brand-sand/60 select-all">
                              {lead.phone}
                            </span>

                            {/* One-Click Copy Button */}
                            <button
                              onClick={(e) => handleCopyPhone(lead._id, lead.phone, e)}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                isCopied
                                  ? 'bg-emerald-500 text-white border-emerald-500 scale-105'
                                  : 'bg-white hover:bg-brand-emerald-tint text-brand-text-subtle hover:text-brand-emerald border-brand-sand'
                              }`}
                              title="Copy phone number to clipboard"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* WhatsApp Direct Chat Button */}
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                              title="Open direct WhatsApp conversation with lead"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>

                        {/* Name (or "Not Provided" indicator) */}
                        <td className="py-3.5 px-4">
                          {hasName ? (
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-brand-emerald-tint text-brand-emerald font-bold flex items-center justify-center shrink-0 text-xs">
                                {lead.name.trim().charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-brand-text-display capitalize">
                                {lead.name.trim()}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-brand-text-subtle italic">
                              <UserX className="w-3 h-3 text-brand-sand-dark" />
                              <span>Not provided</span>
                            </span>
                          )}
                        </td>

                        {/* Coupon Code */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-brand-gold-tint text-brand-gold-dark border border-brand-gold/30">
                            <Tag className="w-2.5 h-2.5" />
                            {lead.couponCode || 'KASHLAUNCH20'}
                          </span>
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-3.5 px-4">
                          <select
                            value={lead.status || 'pending'}
                            onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none transition-all ${
                              lead.status === 'converted'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : lead.status === 'notified'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="notified">Notified</option>
                            <option value="converted">Converted</option>
                          </select>
                        </td>

                        {/* Registered Timestamp */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="text-brand-text-display block font-medium">
                              {formatDate(lead.createdAt)}
                            </span>
                            <span className="text-[10px] text-brand-text-muted">
                              {getRelativeTime(lead.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setLeadToDelete(lead)}
                              className="p-1.5 rounded-lg text-brand-text-subtle hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                              title="Delete lead record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Summary */}
          {!isLoading && filteredLeads.length > 0 && (
            <div className="p-3.5 bg-brand-canvas/60 border-t border-brand-sand/70 flex items-center justify-between text-xs text-brand-text-muted">
              <span>
                Showing <strong className="text-brand-text-display">{filteredLeads.length}</strong>{' '}
                of <strong className="text-brand-text-display">{leads.length}</strong> total leads
              </span>
              <span className="text-[11px]">
                {leads.filter((l) => l.name?.trim()).length} subscribers provided their names
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-brand-sand space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-brand font-bold text-brand-text-display text-sm">
                  Delete Prelaunch Lead?
                </h3>
                <p className="text-[11px] text-brand-text-muted">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-brand-canvas rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-brand-text-muted">Phone:</span>
                <span className="font-mono font-bold text-brand-text-display">{leadToDelete.phone}</span>
              </div>
              {leadToDelete.name && (
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Name:</span>
                  <span className="font-semibold text-brand-text-display">{leadToDelete.name}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="px-4 py-2 rounded-xl border border-brand-sand text-xs font-semibold hover:bg-brand-canvas cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteLead}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeadsPage;
