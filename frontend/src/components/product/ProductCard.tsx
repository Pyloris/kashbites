import React, { useState } from 'react';
import { IProduct } from '../../types/index.js';
import { useCart } from '../../context/CartContext.js';
import { Star, ShoppingBag, Zap, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ProductCardProps {
  product: IProduct;
  onSelect: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, buyNow } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState(
    product.netWeights[0]?.weight || '500g'
  );
  const [addedJustNow, setAddedJustNow] = useState(false);

  // Current weight pricing
  const currentWeightObj =
    product.netWeights.find((w) => w.weight === selectedWeight) || product.netWeights[0];
  const currentPrice = currentWeightObj?.price || product.price;

  // Handle picture navigation
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedWeight, 1);
    setAddedJustNow(true);
    setTimeout(() => setAddedJustNow(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    buyNow(product, selectedWeight, 1);
  };

  return (
    <div
      onClick={() => onSelect(product._id)}
      className="group bg-white rounded-xl border border-[#E8DEC8] hover:border-[#C59432]/60 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image Area with Multi-Picture Carousel & Badges */}
      <div className="relative bg-[#F5EFE6] aspect-4/3 overflow-hidden">
        <img
          src={product.images[activeImageIndex] || product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Carousel controls if multiple pictures exist */}
        {product.images.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              aria-label="Previous picture"
              className="p-1 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next picture"
              className="p-1 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Image index dots */}
        {product.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
            {product.images.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeImageIndex === idx ? 'bg-[#DFB248] w-3' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Kashmiri Origin Stamp / Tag */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-wider uppercase bg-[#143E26] text-[#FAF7F2] px-2 py-0.5 rounded shadow-sm">
            100% Kashmir Origin
          </span>
          {product.promotionalOfferTag && (
            <span className="text-[10px] font-bold tracking-wider uppercase bg-[#DFB248] text-[#0E331E] px-2 py-0.5 rounded shadow-sm">
              {product.promotionalOfferTag}
            </span>
          )}
        </div>

        {/* Combo / Discount Pill */}
        {!product.inStock ? (
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[10px] font-bold bg-[#B91C1C] text-white px-2.5 py-0.5 rounded shadow-xs uppercase">
              Out of Stock
            </span>
          </div>
        ) : (
          product.originalPrice > product.price && (
            <div className="absolute top-2.5 right-2.5">
              <span className="text-[10px] font-bold bg-[#C59432] text-[#0A2416] px-2 py-0.5 rounded shadow-xs">
                Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            </div>
          )
        )}
      </div>

      {/* Card Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Origin Micro-strip */}
          <div className="flex items-center justify-between gap-2 text-xs text-[#637568] mb-1.5">
            <div className="flex items-center gap-1 text-[#C59432] font-semibold">
              <Star className="w-3.5 h-3.5 fill-[#C59432]" />
              <span className="text-slate-800 font-bold">{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount})</span>
            </div>

            <span className="text-[11px] text-[#7A8E7F] font-medium">
              Shopian · Pulwama
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif-brand text-base sm:text-lg font-bold text-[#0E331E] leading-snug line-clamp-1 mb-1 group-hover:text-[#143E26]">
            {product.name}
          </h3>

          {/* Short tagline */}
          <p className="text-xs text-[#526356] line-clamp-1 mb-3">
            {product.tagline}
          </p>

          {/* Weight variant options */}
          <div className="mb-3">
            <span className="text-[11px] text-[#7A8E7F] font-medium block mb-1">
              Select Pack Size:
            </span>
            <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
              {product.netWeights.map((w) => (
                <button
                  key={w.weight}
                  onClick={() => setSelectedWeight(w.weight)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    selectedWeight === w.weight
                      ? 'bg-[#143E26] text-white font-semibold'
                      : 'bg-[#F2ECE1] text-[#2F4435] hover:bg-[#E5DCCF]'
                  }`}
                >
                  {w.weight}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-3 border-t border-[#EFE8DC] mt-2">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-lg sm:text-xl font-bold text-[#0E331E] font-mono tabular-nums">
                ₹{currentPrice}
              </span>
              {product.originalPrice > currentPrice && (
                <span className="text-xs text-[#8C9C90] line-through ml-2 font-mono tabular-nums">
                  ₹{Math.round(currentPrice * 1.25)}
                </span>
              )}
            </div>
            {product.inStock ? (
              <span className="text-[11px] text-[#2D7A46] font-semibold">In Stock</span>
            ) : (
              <span className="text-[11px] text-[#B91C1C] font-semibold">Sold Out</span>
            )}
          </div>

          {/* Direct CTA Buttons: Add to Cart & Buy Now */}
          {product.inStock ? (
            <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleAddToCart}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  addedJustNow
                    ? 'bg-[#2D7A46] text-white'
                    : 'bg-[#EBF2ED] text-[#143E26] hover:bg-[#D9E7DC] active:scale-95'
                }`}
              >
                {addedJustNow ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-[#143E26]" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="py-2 px-2.5 rounded-lg text-xs font-semibold bg-[#143E26] hover:bg-[#0D2D1B] text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-[#DFB248]" />
                <span>Buy Now</span>
              </button>
            </div>
          ) : (
            <button
              disabled
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2 px-2.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            >
              Currently Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

