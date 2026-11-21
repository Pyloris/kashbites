import React from 'react';
import { Star } from 'lucide-react';

/**
 * RatingStars component for consistent Kashmiri gold review stars
 */
export const RatingStars = ({
  rating = 5,
  reviewCount,
  size = 'sm',
  showNumber = true,
  className = '',
}) => {
  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    xs: 'text-[11px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const sSize = starSizes[size] || starSizes.sm;
  const tSize = textSizes[size] || textSizes.sm;

  return (
    <div className={`inline-flex items-center gap-1 text-brand-gold ${className}`}>
      <Star className={`${sSize} fill-brand-gold text-brand-gold shrink-0`} />
      {showNumber && (
        <span className={`${tSize} font-bold text-slate-800 ml-0.5`}>
          {rating}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={`${tSize} text-slate-400 font-normal`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
