import React from 'react';
import { IProduct } from '../../types/index.js';
import { X, ShieldCheck, CheckCircle2, Download, Printer, Award } from 'lucide-react';

interface CertificateModalProps {
  product: IProduct;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const cert = product.certificate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FCFAF5] rounded-2xl shadow-2xl border-4 border-[#C59432]/40 overflow-hidden text-[#1E2D22]">
        
        {/* Certificate Top Header Ribbon */}
        <div className="bg-[#103822] text-[#FAF7F2] p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#C59432]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[#1B4B30] border border-[#DFB248]">
              <Award className="w-6 h-6 text-[#DFB248]" />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.25em] text-[#DFB248] uppercase font-bold block">
                Certificate of Origin & Lab Verification
              </span>
              <h3 className="font-serif-brand text-xl font-bold">
                KashBites Quality Authentication
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body (Parchment Style) */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* Certificate Header Stamp */}
          <div className="text-center pb-4 border-b border-[#E6DECF]">
            <span className="text-xs font-semibold text-[#8C7A60] uppercase tracking-wider block">
              Issued by Analytical Testing Authority
            </span>
            <p className="font-serif-brand text-lg font-bold text-[#0E331E]">
              {cert.issuedBy}
            </p>
            <div className="flex justify-center items-center gap-4 mt-2 text-xs text-[#526356]">
              <span>Cert No: <strong className="font-mono text-[#143E26]">{cert.certificateNumber}</strong></span>
              <span>·</span>
              <span>Test Date: <strong>{cert.labTestDate}</strong></span>
            </div>
          </div>

          {/* Product Tested Details */}
          <div className="bg-[#F5EFE4] p-4 rounded-xl border border-[#DFD5C3]">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#8C7A60] block">Product Tested:</span>
                <span className="font-bold text-[#143E26] text-sm">{product.name}</span>
              </div>
              <div>
                <span className="text-[#8C7A60] block">Harvest Provenance:</span>
                <span className="font-semibold text-[#143E26]">{cert.originDistrict}</span>
              </div>
              <div>
                <span className="text-[#8C7A60] block">Season Crop:</span>
                <span className="font-semibold text-[#143E26]">{cert.harvestSeason}</span>
              </div>
              <div>
                <span className="text-[#8C7A60] block">Verification Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-[#2D7A46]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Passed All Standards
                </span>
              </div>
            </div>
          </div>

          {/* Analytical Laboratory Test Matrix */}
          <div>
            <h4 className="font-serif-brand text-base font-bold text-[#0E331E] mb-3">
              Certified Laboratory Assay Parameters
            </h4>

            <div className="border border-[#E0D5C3] rounded-xl overflow-hidden divide-y divide-[#E0D5C3] text-xs">
              <div className="grid grid-cols-3 p-2.5 bg-[#EDE4D5] font-bold text-[#3B4D3F]">
                <span>Parameter</span>
                <span>Observed Reading</span>
                <span className="text-right">Safety Standard</span>
              </div>

              <div className="grid grid-cols-3 p-2.5 bg-white">
                <span className="font-medium text-[#1A2E20]">Single-Origin Purity</span>
                <span className="font-mono font-bold text-[#2D7A46]">{cert.purityScore}</span>
                <span className="text-right text-[#5A6E5F]">Min 99.0%</span>
              </div>

              <div className="grid grid-cols-3 p-2.5 bg-[#FAF7F2]">
                <span className="font-medium text-[#1A2E20]">Moisture Concentration</span>
                <span className="font-mono font-bold text-[#143E26]">{cert.moistureLevel}</span>
                <span className="text-right text-[#5A6E5F]">Max 5.0% (Crunch Seal)</span>
              </div>

              <div className="grid grid-cols-3 p-2.5 bg-white">
                <span className="font-medium text-[#1A2E20]">Aflatoxin Toxicity</span>
                <span className="font-mono font-bold text-[#2D7A46]">{cert.aflatoxinStatus}</span>
                <span className="text-right text-[#5A6E5F]">Max 10 ppb (Zero Found)</span>
              </div>

              <div className="grid grid-cols-3 p-2.5 bg-[#FAF7F2]">
                <span className="font-medium text-[#1A2E20]">Chemical Bleaching Agents</span>
                <span className="font-mono font-bold text-[#2D7A46]">0.0% (Completely Untreated)</span>
                <span className="text-right text-[#5A6E5F]">Strict Zero Tolerance</span>
              </div>
            </div>
          </div>

          {/* Seal & Signatures */}
          <div className="pt-4 border-t border-[#E6DECF] flex items-center justify-between text-xs text-[#6F8073]">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-[#C59432] p-1 flex items-center justify-center text-center text-[9px] font-bold text-[#C59432] uppercase leading-tight bg-[#FAF4E6]">
                Kashmir Verified Origin
              </div>
              <div>
                <p className="font-bold text-[#143E26]">Dr. Bashir A. Dar</p>
                <p>Chief Quality Officer, Agri-Testing Hub</p>
                <p className="font-mono text-[10px] text-[#A08E73]">Hash: 7f9b8c2a9918</p>
              </div>
            </div>

            <div className="text-right">
              <ShieldCheck className="w-10 h-10 text-[#2D7A46] ml-auto mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D7A46]">
                Cryptographically Sealed
              </span>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-[#EDE5D8] px-6 py-4 flex items-center justify-between border-t border-[#DFD5C3]">
          <span className="text-xs text-[#5C6E61]">
            Valid for Harvest Batch: <strong className="text-[#143E26]">Autumn 2026</strong>
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#C59432]/50 text-[#143E26] hover:bg-[#FAF7F2] transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#143E26] text-white hover:bg-[#0D2D1B] transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
