import React from 'react';
import { Badge } from '../../components/ui/index.js';
import {
  AboutStory,
  AboutPillars,
  AboutCta,
} from './components/index.js';

export const AboutPage = () => {
  return (
    <div className="bg-brand-canvas min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold" size="md">
            Direct from Srinagar & Centennial Orchards
          </Badge>
          <h1 className="font-serif-brand text-3xl sm:text-5xl font-bold text-brand-text-display leading-tight">
            The KashBites Provenance Story
          </h1>
          <p className="text-sm sm:text-base text-brand-text-muted leading-relaxed">
            Born from generational orchard groves tucked beneath the Pir Panjal ranges, KashBites preserves the authentic, unadulterated botanical wealth of the Kashmir Valley.
          </p>
        </div>

        <AboutStory />
        <AboutPillars />
        <AboutCta />
      </div>
    </div>
  );
};

export default AboutPage;
