import React, { useState, useEffect } from 'react';
import { useGetOrdersQuery } from '../../services/orders.api.js';
import { Modal, Input, Button, Badge } from '../ui/index.js';
import { Search, MapPin } from 'lucide-react';

export const OrderTrackingModal = ({ isOpen, onClose, initialOrderNumber }) => {
  const { data: orders = [] } = useGetOrdersQuery(undefined, { skip: !isOpen });
  const [searchTerm, setSearchTerm] = useState(initialOrderNumber || '');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (isOpen && orders.length > 0) {
      const matched = initialOrderNumber
        ? orders.find((o) => o.orderNumber === initialOrderNumber)
        : orders[0];
      setSelectedOrder((prev) => (prev ? prev : matched || orders[0]));
    }
  }, [isOpen, orders, initialOrderNumber]);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    const found = orders.find((o) => o.orderNumber.toLowerCase() === searchTerm.trim().toLowerCase());
    if (found) setSelectedOrder(found);
  };

  const stages = [
    {
      title: 'Order Confirmed',
      desc: 'Orchard batch allocated from Shopian / Pulwama cooperative',
      done: true,
    },
    {
      title: 'Lab Quality & Moisture QC',
      desc: 'Passed certified <4% moisture and nil chemical residue test',
      done: true,
    },
    {
      title: 'Srinagar Cold Vacuum Packaging',
      desc: 'Hermetic nitrogen displacement packing in Sanat Nagar facility',
      done: true,
    },
    {
      title: 'Dispatched via Air Courier',
      desc: 'Priority air courier transit from Srinagar Airport (SXR)',
      done: selectedOrder?.orderStatus === 'Shipped' || selectedOrder?.orderStatus === 'Delivered',
    },
    {
      title: 'Out for Delivery',
      desc: 'Arriving at your doorstep with Cash on Delivery / UPI verification',
      done: selectedOrder?.orderStatus === 'Delivered',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      title="Track Order & Batch Authentication"
      subtitle="Direct-from-Kashmir Provenance"
    >
      <div className="space-y-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter Order # (e.g. KB-8273)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-brand-text-subtle" />}
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Find Order
          </Button>
        </form>

        {selectedOrder ? (
          <div className="space-y-6">
            <div className="bg-brand-canvas p-4 rounded-xl border border-brand-sand space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-emerald">
                  Order #{selectedOrder.orderNumber}
                </span>
                <Badge variant={selectedOrder.orderStatus === 'Delivered' ? 'origin' : 'gold'}>
                  Status: {selectedOrder.orderStatus}
                </Badge>
              </div>

              <div className="text-[11px] text-brand-text-muted flex items-center justify-between pt-1 border-t border-brand-sand">
                <span>Destination: {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</span>
                <span>Courier: Air Cargo Express</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-emerald">
                Freshness & Handling Journey
              </h4>

              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-gold/40">
                {stages.map((st, i) => (
                  <div key={i} className="relative">
                    <div
                      className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-white ${
                        st.done ? 'border-brand-emerald text-brand-emerald' : 'border-gray-300 text-transparent'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${st.done ? 'bg-brand-emerald' : 'bg-transparent'}`} />
                    </div>
                    <h5 className={`text-xs font-bold ${st.done ? 'text-brand-emerald' : 'text-gray-400'}`}>
                      {st.title}
                    </h5>
                    <p className="text-[11px] text-brand-text-muted">{st.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-brand-sand flex items-start gap-3">
              <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-brand-emerald block">
                  Shipping to: {selectedOrder.shippingAddress.fullName}
                </span>
                <p className="text-brand-text-muted text-[11px] mt-0.5">
                  {selectedOrder.shippingAddress.addressLine1}, {selectedOrder.shippingAddress.city},{' '}
                  {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-brand-text-muted">
            No order found matching "{searchTerm}". Please check your order confirmation email or SMS.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OrderTrackingModal;
