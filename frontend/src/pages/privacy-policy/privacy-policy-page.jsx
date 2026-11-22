import React from 'react';
import { Badge } from '../../components/ui/index.js';
import { PrivacySections } from './components/index.js';
import { appConfig } from '../../config/app-config.js';

export const PrivacyPolicyPage = () => {
  return (
    <div className="bg-brand-canvas min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3 pb-6 border-b border-brand-sand">
          <Badge variant="origin" size="md">
            Customer Trust & Data Protection
          </Badge>
          <h1 className="font-serif-brand text-3xl sm:text-4xl font-bold text-brand-text-display">
            Privacy Policy
          </h1>
          <p className="text-xs text-brand-text-muted">
            Last Updated: November 2026 · {appConfig.brand.companyName}, {appConfig.brand.originCity}
          </p>
        </div>

        <PrivacySections />
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
