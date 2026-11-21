import React from 'react';
import { useCart } from '../../../context/CartContext.jsx';
import {
  PriceTag,
  RatingStars,
  QuantityStepper,
  Button,
} from '../../../components/ui/index.js';
import { BuyNow } from '../../../components/custom/index.js';
import { ShoppingBag, Truck, RotateCcw } from 'lucide-react';

export const ProductInfo = ({
  product,
  selectedWeight,
  onSelectWeight,
  quantity,
  onQuantityChange,
  avgRating,
  reviewsCount,
}) => {
  const { addToCart } = useCart();

  const currentWeightObj =
    product.netWeights?.find((w) => w.weight === selectedWeight) ||
    product.netWeights?.[0];
  const unitPrice = currentWeightObj?.price || product.price;
  const currentPrice = unitPrice * quantity;
  const originalPriceCalculated = Math.round(currentPrice * 1.25);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-gold block mb-1">
          {product.tagline}
        </span>
        <h1 className="font-serif-brand text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-text-display leading-tight">
          {product.name}
        </h1>
        <p className="text-xs text-brand-text-muted mt-1">{product.subtitle}</p>

        <div className="flex items-center gap-3 mt-3">
          <RatingStars rating={avgRating} count={reviewsCount} size="sm" showScore />
          <span className="text-xs text-brand-text-muted">
            ({reviewsCount} certified customer reviews)
          </span>
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl border border-brand-sand shadow-2xs">
        <PriceTag
          currentPrice={currentPrice}
          originalPrice={originalPriceCalculated}
          size="lg"
          taxesNote="Taxes Included · Free Delivery over ₹999"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-brand-emerald block mb-2">
          Select Nitrogen-Sealed Net Weight:
        </label>
        <div className="grid grid-cols-3 gap-3">
          {product.netWeights?.map((nw) => (
            <button
              key={nw.weight}
              onClick={() => onSelectWeight(nw.weight)}
              className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                selectedWeight === nw.weight
                  ? 'border-brand-emerald bg-brand-emerald-tint text-brand-emerald font-bold shadow-2xs'
                  : 'border-brand-sand bg-white text-brand-text-body hover:border-brand-gold'
              }`}
            >
              <span className="block text-sm">{nw.weight}</span>
              <span className="block text-xs text-brand-gold-dark font-medium">₹{nw.price}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          <QuantityStepper
            value={quantity}
            onChange={onQuantityChange}
            min={1}
            max={20}
            size="md"
          />

          <Button
            variant="outline"
            size="md"
            onClick={() => addToCart(product, selectedWeight, quantity)}
            className="flex-1"
            leftIcon={<ShoppingBag className="w-4 h-4" />}
          >
            Add to Harvest Box
          </Button>
        </div>

        <BuyNow
          product={product}
          selectedWeight={selectedWeight}
          quantity={quantity}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-brand-sand">
        <div className="flex items-center gap-2 text-xs text-brand-text-muted">
          <Truck className="w-4 h-4 text-brand-gold shrink-0" />
          <span>Express 2-3 Day Air Delivery</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-brand-text-muted">
          <RotateCcw className="w-4 h-4 text-brand-gold shrink-0" />
          <span>100% Purity Replacement Guarantee</span>
        </div>
      </div>

      <div className="pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-emerald mb-1">
          Valley Heritage & Nutrition
        </h3>
        <p className="text-xs text-brand-text-muted leading-relaxed">
          {product.description}
        </p>
      </div>
    </div>
  );
};

export default ProductInfo;
