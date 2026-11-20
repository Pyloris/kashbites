import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mountain, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#FAF7F2]">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-[#E8DEC8] shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#143E26]/10 text-[#143E26] flex items-center justify-center">
          <Mountain className="w-8 h-8 text-[#143E26]" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C59432] block mb-1">
            404 Error · Lost in the Valley
          </span>
          <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#0E331E]">
            Valley Path Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6E60] mt-2 leading-relaxed">
            The page or harvest collection you are looking for has been moved or does not exist. Let's guide you back to our orchard harvest.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-[#143E26]/30 text-[#143E26] hover:bg-[#EAF2EC] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#143E26] hover:bg-[#0E331E] text-[#FAF7F2] font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Home className="w-3.5 h-3.5 text-[#DFB248]" />
            <span>Back to Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
