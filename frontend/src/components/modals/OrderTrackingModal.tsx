import React, { useState, useEffect } from 'react';
import { fetchOrders } from '../../services/api.js';
import { IOrder } from '../../types/index.js';
import { X, Search, CheckCircle2, PackageCheck, Truck, ShieldCheck, MapPin } from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber,
}) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialOrderNumber || '');
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOrders().then((data) => {
        setOrders(data);
        if (data.length > 0) {
          const matched = initialOrderNumber
            ? data.find((o) => o.orderNumber === initialOrderNumber)
            : data[0];
          setSelectedOrder(matched || data[0]);
        }
      });
    }
  }, [isOpen, initialOrderNumber]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(
      (o) => o.orderNumber.toLowerCase() === searchTerm.trim().toLowerCase()
    );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#FCFAF5] rounded-2xl shadow-2xl border-2 border-[#C59432]/40 overflow-hidden text-[#1E2E21] max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#103822] text-[#FAF7F2] p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#C59432] shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#DFB248] block">
              Direct-from-Kashmir Provenance
            </span>
            <h3 className="font-serif-brand text-xl font-bold">
              Track Order & Batch Authentication
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9C8F7A] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. KB-88219)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#D5CABB] bg-white uppercase font-mono tracking-wider outline-none focus:border-[#143E26]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#143E26] text-white text-xs font-bold hover:bg-[#0D2D1B]"
            >
              Track
            </button>
          </form>

          {selectedOrder ? (
            <div className="space-y-6">
              {/* Order Meta Box */}
              <div className="bg-white p-4 rounded-xl border border-[#E6DECF] text-xs">
                <div className="flex justify-between items-start pb-2 mb-2 border-b border-[#EFE8DC]">
                  <div>
                    <span className="text-[#8C9C90] block">Order Tracking ID:</span>
                    <strong className="font-mono text-base text-[#143E26]">
                      {selectedOrder.orderNumber}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[#8C9C90] block">Total Amount:</span>
                    <strong className="font-mono text-sm text-[#0E331E]">
                      ₹{selectedOrder.total} ({selectedOrder.paymentMethod})
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[#4F6354]">
                  <MapPin className="w-3.5 h-3.5 text-[#C59432] shrink-0" />
                  <span>
                    Destination: {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} ({selectedOrder.shippingAddress.pincode})
                  </span>
                </div>
              </div>

              {/* Step Tracking Timeline */}
              <div>
                <h4 className="font-serif-brand text-base font-bold text-[#0E331E] mb-4">
                  Harvest & Delivery Journey
                </h4>

                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[#E2D8C7] before:z-0">
                  {stages.map((st, idx) => (
                    <div key={idx} className="relative z-10 flex items-start gap-3.5 text-xs">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white ${
                          st.done
                            ? 'bg-[#2D7A46] shadow-xs ring-4 ring-[#FAF7F2]'
                            : 'bg-[#C5BBAA] ring-4 ring-[#FAF7F2]'
                        }`}
                      >
                        {st.done ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>

                      <div className="pt-0.5">
                        <h5 className={`font-bold ${st.done ? 'text-[#0E331E]' : 'text-[#8C9C90]'}`}>
                          {st.title}
                        </h5>
                        <p className="text-[#5B6E60] text-[11px] mt-0.5">{st.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="bg-[#FAF4E6] p-4 rounded-xl border border-[#E5D7BE] text-xs">
                <span className="font-bold text-[#645028] block mb-2">Package Contents:</span>
                <div className="space-y-1">
                  {selectedOrder.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-[#3C4D40]">
                      <span>{it.quantity}x {it.name} ({it.weight})</span>
                      <span className="font-mono">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#7A8E7F]">
              No order found with that ID. Enter an order number like KB-88219.
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
