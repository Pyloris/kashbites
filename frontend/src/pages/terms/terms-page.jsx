import React from 'react';
import { Badge } from '../../components/ui/index.js';
import { TermsSections } from './components/index.js';

export const TermsPage = () => {
  return (
    <div className="bg-brand-canvas min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3 pb-6 border-b border-brand-sand">
          <Badge variant="gold" size="md">
            Harvest Authenticity & Commercial Terms
          </Badge>
          <h1 className="font-serif-brand text-3xl sm:text-4xl font-bold text-brand-text-display">
            Terms of Service & Harvest Guarantee
          </h1>
          <p className="text-xs text-brand-text-muted">
            Effective as of 2026 Autumn Harvest · KashBites Agro Pvt Ltd
          </p>
        </div>

        <TermsSections />
      </div>
    </div>
  );
};

export default TermsPage;
