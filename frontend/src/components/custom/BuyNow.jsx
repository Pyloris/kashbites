import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { Button } from '../ui/index.js';
import { Zap } from 'lucide-react';

/**
 * BuyNow - Custom workflow component
 * Encapsulates the entire "Buy Now" flow:
 * Validates selected weight variant and quantity,
 * invokes direct instant checkout in CartContext, and transitions to checkout.
 */
export const BuyNow = ({
  product,
  selectedWeight,
  quantity = 1,
  className = '',
  variant = 'primary',
  size = 'lg',
  showIcon = true,
  label,
  onBeforeBuy,
  onSuccess,
}) => {
  const { buyNow } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuyNow = async (e) => {
    e?.stopPropagation?.();
    if (!product) return;

    if (onBeforeBuy) {
      const canProceed = onBeforeBuy();
      if (canProceed === false) return;
    }

    setIsProcessing(true);
    try {
      const weight = selectedWeight || product.netWeights?.[0]?.weight || '500g';
      buyNow(product, weight, quantity);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error during Buy Now flow:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayText = label || 'Instant Express Checkout (COD Available)';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBuyNow}
      loading={isProcessing}
      className={className}
      leftIcon={showIcon ? <Zap className="w-4 h-4 text-brand-gold fill-current" /> : undefined}
    >
      {displayText}
    </Button>
  );
};

export default BuyNow;
