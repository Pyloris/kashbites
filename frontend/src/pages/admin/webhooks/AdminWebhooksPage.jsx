import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Send, ShieldCheck, Terminal, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminApi } from '../../../services/admin.api.js';
import { AdminHeader } from '../components/AdminHeader.jsx';

export const AdminWebhooksPage = () => {
  const [config, setConfig] = useState({
    providerName: 'Delhivery Air Express (Srinagar Hub)',
    outboundWebhookUrl: 'https://shipping-webhook.kashbites-logistics.io/v1/orders/push',
    secretToken: 'kb_whsec_srinagar_2026',
    isEnabled: true,
    autoPushOnNewOrder: true,
  });
  const [logs, setLogs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  // Manual Test Push Simulator
  const [simOrderId, setSimOrderId] = useState('KB-88219');

  const showNotice = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await adminApi.getShippingConfig();
      if (res.success && res.data) {
        if (res.data.config) setConfig(res.data.config);
        if (res.data.logs) setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Error loading webhook config:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await adminApi.updateShippingConfig(config);
      if (res.success) {
        showNotice('Shipping carrier webhook configuration saved');
        loadData();
      } else {
        alert(res.message || 'Failed to update configuration');
      }
    } catch (err) {
      console.error('Save webhook error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPush = async () => {
    if (!simOrderId.trim()) return;
    try {
      const res = await adminApi.pushOrderWebhook(simOrderId.trim());
      if (res.success) {
        showNotice(`Simulated webhook dispatched for order ${simOrderId}`);
        loadData();
      } else {
        alert(res.message || 'Test dispatch error');
      }
    } catch (err) {
      console.error('Test push error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Shipping Webhooks & Air Cargo Logs"
        subtitle="Manage logistics provider webhooks, secret tokens and audit logs for order manifests"
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-brand-emerald-tint border border-brand-emerald/30 text-xs text-brand-emerald font-semibold">
            {toastMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Configuration Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-brand-sand/70 p-6 shadow-2xs space-y-4">
            <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
              Carrier Webhook Configuration
            </h3>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Logistics Carrier Name
                </label>
                <input
                  type="text"
                  required
                  value={config.providerName}
                  onChange={(e) => setConfig({ ...config, providerName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Outbound Webhook URL
                </label>
                <input
                  type="url"
                  required
                  value={config.outboundWebhookUrl}
                  onChange={(e) => setConfig({ ...config, outboundWebhookUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Shared Webhook Secret Token
                </label>
                <input
                  type="text"
                  required
                  value={config.secretToken}
                  onChange={(e) => setConfig({ ...config, secretToken: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald font-mono font-bold"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-brand-sand/70">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.isEnabled}
                    onChange={(e) => setConfig({ ...config, isEnabled: e.target.checked })}
                    className="rounded text-brand-emerald focus:ring-brand-emerald"
                  />
                  <span className="font-bold text-brand-text-display">
                    Enable Webhook Integration
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoPushOnNewOrder}
                    onChange={(e) => setConfig({ ...config, autoPushOnNewOrder: e.target.checked })}
                    className="rounded text-brand-emerald focus:ring-brand-emerald"
                  />
                  <span className="font-bold text-brand-text-display">
                    Auto-Push Manifest on New Orders
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 rounded-xl bg-brand-emerald text-brand-gold font-bold text-xs shadow-md hover:bg-brand-emerald-dark transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>

          {/* Test Dispatch Tool */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-brand-sand/70 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-serif-brand text-lg font-bold text-brand-text-display mb-1 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-brand-emerald" />
                <span>Simulate Webhook Dispatch</span>
              </h3>
              <p className="text-xs text-brand-text-muted">
                Push an order manifest directly to the outbound carrier URL with authentic secret signature headers.
              </p>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Order # (e.g. KB-88219)"
                  value={simOrderId}
                  onChange={(e) => setSimOrderId(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-brand-sand text-xs focus:outline-none focus:border-brand-emerald font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={handleTestPush}
                  className="px-4 py-2.5 rounded-xl bg-brand-emerald-tint hover:bg-brand-emerald hover:text-white text-brand-emerald font-bold text-xs border border-brand-emerald/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Push</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-canvas border border-brand-sand/70 text-xs space-y-1">
              <span className="font-bold text-brand-emerald block">Inbound Endpoint</span>
              <p className="font-mono text-brand-text-body text-[11px]">
                POST {window.location.origin}/api/webhooks/shipping
              </p>
              <span className="text-[11px] text-brand-text-muted block mt-1">
                Accepts incoming AWB and status update events from Delhivery & BlueDart air couriers.
              </span>
            </div>
          </div>
        </div>

        {/* Webhook Audit Logs Table */}
        <div className="space-y-3">
          <h3 className="font-serif-brand text-lg font-bold text-brand-text-display">
            Webhook Event & Manifest Audit Logs ({logs.length})
          </h3>

          <div className="bg-white rounded-2xl border border-brand-sand/70 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-canvas text-brand-text-muted uppercase text-[10px] tracking-wider border-b border-brand-sand/70">
                <tr>
                  <th className="py-3 px-4 font-bold">Direction</th>
                  <th className="py-3 px-4 font-bold">Event Name</th>
                  <th className="py-3 px-4 font-bold">Order #</th>
                  <th className="py-3 px-4 font-bold">Status Code</th>
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                  <th className="py-3 px-4 font-bold text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand/60">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-brand-text-muted">
                      No webhook manifests logged yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((lg) => (
                    <tr key={lg.id || lg._id} className="hover:bg-brand-canvas/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            lg.direction === 'OUTBOUND'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {lg.direction}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-brand-text-display">
                        {lg.event}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-brand-emerald">
                        {lg.orderNumber || lg.orderId || '—'}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`font-bold ${
                            lg.statusCode === 200 ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {lg.statusCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-brand-text-muted">
                        {lg.timestamp ? new Date(lg.timestamp).toLocaleTimeString() : 'Just now'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(lg)}
                          className="px-2.5 py-1 rounded-lg bg-brand-canvas hover:bg-brand-sand/60 text-brand-text-body font-mono text-[11px] border border-brand-sand transition-colors cursor-pointer"
                        >
                          View JSON
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

      {/* JSON Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-sand max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-sand">
              <h3 className="font-serif-brand text-base font-bold text-brand-text-display">
                Webhook Payload: {selectedLog.event}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-brand-text-subtle hover:text-brand-text-display cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-4 space-y-3 text-xs">
              <div>
                <span className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                  Payload Sent
                </span>
                <pre className="p-3 rounded-xl bg-brand-emerald-darker text-brand-gold font-mono text-[11px] overflow-x-auto max-h-52">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>

              {selectedLog.response && (
                <div>
                  <span className="font-bold text-brand-emerald uppercase tracking-wider block mb-1">
                    Carrier Response
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-40">
                    {JSON.stringify(selectedLog.response, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-xl bg-brand-emerald text-brand-gold font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWebhooksPage;
