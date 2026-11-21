import React from 'react';
import { Badge, Button } from '../../../components/ui/index.js';
import { ShieldCheck, PlayCircle } from 'lucide-react';

export const ProductGallery = ({
  product,
  selectedImageIndex,
  onSelectImage,
  onOpenCert,
  onOpenVideo,
}) => {
  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-brand-sand shadow-sm">
        <img
          src={product.images[selectedImageIndex] || product.primaryImage}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="origin">{product.origin}</Badge>
        </div>
      </div>

      {product.images?.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {product.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onSelectImage(idx)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                selectedImageIndex === idx
                  ? 'border-brand-emerald shadow-md scale-102'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          variant="outline"
          size="md"
          onClick={onOpenCert}
          leftIcon={<ShieldCheck className="w-4 h-4 text-brand-gold" />}
          className="w-full"
        >
          View Lab Purity Certificate
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onOpenVideo}
          leftIcon={<PlayCircle className="w-4 h-4 text-brand-gold" />}
          className="w-full"
        >
          Watch Packaging Video
        </Button>
      </div>
    </div>
  );
};

export default ProductGallery;
