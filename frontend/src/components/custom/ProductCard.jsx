import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { Card, Badge, PriceTag, RatingStars, Button } from '../ui/index.js';
import { BuyNow } from './BuyNow.jsx';
import { ShoppingBag } from 'lucide-react';

export const ProductCard = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const [selectedWeight, setSelectedWeight] = useState(
    product.netWeights?.[0]?.weight || '500g'
  );

  const currentWeightObj =
    product.netWeights?.find((w) => w.weight === selectedWeight) ||
    product.netWeights?.[0];
  const currentPrice = currentWeightObj?.price ?? product.price ?? 0;
  const originalPrice = currentWeightObj?.originalPrice ||
    (currentPrice === product.price && product.originalPrice
      ? product.originalPrice
      : Math.round(currentPrice * 1.25));

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(product._id);
    }
  };

  const handleWeightClick = (e, weight) => {
    e.stopPropagation();
    setSelectedWeight(weight);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, selectedWeight, 1);
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      className="flex flex-col justify-between overflow-hidden cursor-pointer group"
    >
      <div>
        <div className="relative aspect-square overflow-hidden bg-white border-b border-brand-sand">
          <img
            src={product.primaryImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
            <Badge variant="origin" size="sm">
              {product.origin}
            </Badge>
          </div>

          {product.isFeatured && (
            <div className="absolute top-3 right-3">
              <Badge variant="gold" size="sm">
                Featured
              </Badge>
            </div>
          )}
        </div>

        <Card.Body className="space-y-3">
          <div>
            <RatingStars
              rating={product.rating}
              count={product.reviewsCount}
              size="sm"
              showScore
            />
            <h3 className="font-serif-brand text-lg font-bold text-brand-text-display group-hover:text-brand-emerald transition-colors line-clamp-1 mt-1">
              {product.name}
            </h3>
            <p className="text-xs text-brand-text-muted line-clamp-2 mt-0.5">
              {product.subtitle}
            </p>
          </div>

          {product.netWeights?.length > 1 && (
            <div className="flex gap-1.5 flex-wrap">
              {product.netWeights.map((nw) => (
                <button
                  key={nw.weight}
                  onClick={(e) => handleWeightClick(e, nw.weight)}
                  className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all cursor-pointer ${
                    selectedWeight === nw.weight
                      ? 'border-brand-emerald bg-brand-emerald text-white font-bold'
                      : 'border-brand-sand bg-white text-brand-text-body hover:border-brand-gold'
                  }`}
                >
                  {nw.weight}
                </button>
              ))}
            </div>
          )}

          <PriceTag
            price={currentPrice}
            currentPrice={currentPrice}
            originalPrice={originalPrice}
            size="md"
            showSavings
          />
        </Card.Body>
      </div>

      <Card.Footer className="pt-0 pb-4 px-4 gap-2 flex flex-col sm:flex-row">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddToCart}
          className="flex-1"
          leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
        >
          Add
        </Button>

        <BuyNow
          product={product}
          selectedWeight={selectedWeight}
          quantity={1}
          size="sm"
          variant="primary"
          className="flex-1"
          label="Buy Now"
          showIcon={false}
        />
      </Card.Footer>
    </Card>
  );
};

export default ProductCard;
