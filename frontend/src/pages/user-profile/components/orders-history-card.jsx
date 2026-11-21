import React from 'react';
import { Card, Badge, Button } from '../../../components/ui/index.js';
import { Package, Truck } from 'lucide-react';

export const OrdersHistoryCard = ({
  orders = [],
  isLoading,
  onTrackOrder,
  onBackToShop,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-brand-sand">
        <div className="w-8 h-8 mx-auto rounded-full border-2 border-brand-emerald border-t-transparent animate-spin mb-3"></div>
        <p className="text-xs text-brand-text-muted">
          Retrieving your harvest orders from database...
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-brand-sand">
        <Package className="w-12 h-12 text-brand-text-subtle mx-auto mb-3" />
        <h4 className="font-serif-brand text-lg font-bold text-brand-text-display">
          No harvest orders yet
        </h4>
        <p className="text-xs text-brand-text-muted mt-1 mb-4">
          Taste the purest single-origin walnuts, almonds, and saffron from Srinagar.
        </p>
        <Button variant="primary" size="md" onClick={onBackToShop}>
          Explore Fresh 2026 Harvest
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.orderNumber} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-brand-sand gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-brand font-bold text-sm text-brand-text-display">
                  Order #{order.orderNumber}
                </span>
                <Badge
                  variant={
                    order.orderStatus === 'Delivered'
                      ? 'origin'
                      : order.orderStatus === 'Shipped'
                      ? 'blue'
                      : 'gold'
                  }
                  size="sm"
                >
                  {order.orderStatus}
                </Badge>
              </div>
              <span className="text-[11px] text-brand-text-subtle">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <Button
              variant="primary"
              size="xs"
              onClick={() => onTrackOrder(order.orderNumber)}
              leftIcon={<Truck className="w-3.5 h-3.5" />}
            >
              Track Air Transit
            </Button>
          </div>

          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded-lg border border-brand-sand"
                  />
                  <div>
                    <span className="font-bold text-brand-emerald block">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-brand-text-subtle">
                      {item.weight} × {item.quantity}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-brand-emerald">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-brand-sand flex items-center justify-between text-xs text-brand-text-muted">
            <div>
              <span>Payment: </span>
              <strong className="text-brand-emerald">
                {order.paymentMethod} ({order.paymentStatus})
              </strong>
              {order.trackingNumber && (
                <span className="ml-3 text-[11px] text-brand-gold-dark font-medium">
                  AWB: {order.trackingNumber} ({order.courierName})
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-[11px]">Total Paid: </span>
              <span className="font-bold text-sm text-brand-emerald">
                ₹{order.total}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default OrdersHistoryCard;
