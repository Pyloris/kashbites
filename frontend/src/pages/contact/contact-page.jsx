import React from 'react';
import { SectionHeader } from '../../components/ui/index.js';
import {
  ContactChannels,
  ContactForm,
  FacilityInfo,
} from './components/index.js';

export const ContactPage = () => {
  return (
    <div className="bg-brand-canvas min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <SectionHeader
            eyebrow="Direct Assistance from Srinagar"
            title="Contact the KashBites Team"
            subtitle="Have questions about our current 2026 harvest, custom royal gift hampers, or parcel tracking? We're here to help."
            align="center"
          />
        </div>

        <ContactChannels />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ContactForm />
          <FacilityInfo />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
