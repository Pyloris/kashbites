import React from 'react';
import { Button } from '../../../components/ui/index.js';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AboutCta = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-brand-emerald-dark text-brand-text-light p-8 sm:p-12 rounded-3xl border-2 border-brand-gold text-center space-y-4 shadow-xl">
      <Sparkles className="w-8 h-8 text-brand-gold mx-auto" />
      <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold">
        Experience the Authentic Taste of the Valley
      </h2>
      <p className="text-xs sm:text-sm text-brand-sand-light max-w-xl mx-auto">
        Order fresh 2026 autumn crop Kagzi walnuts, Mamra almonds, and royal festive hampers with complimentary express air delivery over ₹999.
      </p>
      <div className="pt-2">
        <Button
          variant="gold"
          size="lg"
          onClick={() => navigate('/prelaunch/catalog')}
        >
          Explore Fresh Harvest Catalog
        </Button>
      </div>
    </div>
  );
};

export default AboutCta;
