import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mountain, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../../components/ui/index.js';

export const NotFoundContent = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-brand-sand shadow-sm">
      <div className="w-16 h-16 mx-auto rounded-full bg-brand-emerald-tint text-brand-emerald flex items-center justify-center">
        <Mountain className="w-8 h-8 text-brand-emerald" />
      </div>
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold block mb-1">
          404 Error · Lost in the Valley
        </span>
        <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-brand-text-display">
          Valley Path Not Found
        </h1>
        <p className="text-xs sm:text-sm text-brand-text-muted mt-2 leading-relaxed">
          The page or harvest collection you are looking for has been moved or does not exist. Let's guide you back to our orchard harvest.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          variant="outline"
          size="md"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          className="w-full sm:w-auto"
        >
          Go Back
        </Button>
        <Link to="/prelaunch" className="w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Home className="w-3.5 h-3.5 text-brand-gold" />}
            className="w-full"
          >
            Back to Storefront
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundContent;
