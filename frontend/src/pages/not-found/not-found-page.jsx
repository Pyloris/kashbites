import React from 'react';
import { NotFoundContent } from './components/index.js';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-brand-canvas">
      <NotFoundContent />
    </div>
  );
};

export default NotFoundPage;
