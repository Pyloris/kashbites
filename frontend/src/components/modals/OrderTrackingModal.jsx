import React, { useState, useEffect } from 'react';
import { useGetOrdersQuery } from '../../services/orders.api.js';
import { X, Search, CheckCircle2, MapPin } from 'lucide-react';

export const OrderTrackingModal = ({ isOpen, onClose, initialOrderNumber, }) => {
    const { data: orders = [] } = useGetOrdersQuery(undefined, { skip: !isOpen });
    const [searchTerm, setSearchTerm] = useState(initialOrderNumber || '');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (isOpen && orders.length > 0) {
            const matched = initialOrderNumber
                ? orders.find((o) => o.orderNumber === initialOrderNumber)
                : orders[0];
            setSelectedOrder((prev) => (prev ? prev : (matched || orders[0])));
        }
    }, [isOpen, orders, initialOrderNumber]);

    if (!isOpen)
        return null;
    const handleSearch = (e) => {
        e.preventDefault();
        const found = orders.find((o) => o.orderNumber.toLowerCase() === searchTerm.trim().toLowerCase());
        if (found)
            setSelectedOrder(found);
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
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
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

          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#5B6E60]"/>
              <input type="text" placeholder="Enter Order # (e.g. KB-8273)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8DEC8] rounded-xl focus:outline-none focus:border-[#103822]"/>
            </div>
            <button type="submit" className="px-4 py-2 bg-[#103822] text-white text-xs font-bold rounded-xl hover:bg-[#0a2315] transition-colors cursor-pointer">
              Find Order
            </button>
          </form>

          {selectedOrder ? (<div className="space-y-6">
              {/* Order Quick Specs */}
              <div className="bg-[#F2ECE1] p-4 rounded-xl border border-[#C59432]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#103822]">
                    Order #{selectedOrder.orderNumber}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#103822] text-[#DFB248]">
                    Status: {selectedOrder.orderStatus}
                  </span>
                </div>

                <div className="text-[11px] text-[#5B6E60] flex items-center justify-between pt-1 border-t border-[#C59432]/20">
                  <span>Destination: {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</span>
                  <span>Courier: Air Cargo Express</span>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#103822]">
                  Freshness & Handling Journey
                </h4>

                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#C59432]/40">
                  {stages.map((st, i) => (<div key={i} className="relative">
                      <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-white ${st.done ? 'border-[#103822] text-[#103822]' : 'border-gray-300 text-transparent'}`}>
                        <div className={`w-2 h-2 rounded-full ${st.done ? 'bg-[#103822]' : 'bg-transparent'}`}/>
                      </div>
                      <h5 className={`text-xs font-bold ${st.done ? 'text-[#103822]' : 'text-gray-400'}`}>
                        {st.title}
                      </h5>
                      <p className="text-[11px] text-[#5B6E60]">{st.desc}</p>
                    </div>))}
                </div>
              </div>

              {/* Delivery Destination Snippet */}
              <div className="p-4 bg-white rounded-xl border border-[#E8DEC8] flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C59432] shrink-0 mt-0.5"/>
                <div className="text-xs">
                  <span className="font-bold text-[#103822] block">
                    Shipping to: {selectedOrder.shippingAddress.fullName}
                  </span>
                  <p className="text-[#5B6E60] text-[11px] mt-0.5">
                    {selectedOrder.shippingAddress.addressLine1}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                  </p>
                </div>
              </div>
            </div>) : (<div className="text-center py-8 text-xs text-[#5B6E60]">
              No order found matching "{searchTerm}". Please check your order confirmation email or SMS.
            </div>)}
        </div>
      </div>
    </div>);
};
