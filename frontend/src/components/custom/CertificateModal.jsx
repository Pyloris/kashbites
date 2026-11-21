import React from 'react';
import { Modal, Button, Badge } from '../ui/index.js';
import { ShieldCheck, CheckCircle2, Printer } from 'lucide-react';

export const CertificateModal = ({ product, certificate, productName, isOpen, onClose }) => {
  if (!isOpen) return null;

  const cert = product?.certificate || certificate;
  const name = product?.name || productName || 'Kashmir Harvest';

  if (!cert) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title="KashBites Quality Authentication"
      subtitle="Certificate of Origin & Lab Verification"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-brand-text-muted">
            Valid for Harvest Batch: <strong className="text-brand-emerald">Autumn 2026</strong>
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="text-center pb-4 border-b border-brand-sand">
          <span className="text-xs font-semibold text-brand-gold-dark uppercase tracking-wider block">
            Issued by Analytical Testing Authority
          </span>
          <p className="font-serif-brand text-lg font-bold text-brand-text-display mt-0.5">
            {cert.issuedBy}
          </p>
          <div className="flex justify-center items-center gap-4 mt-2 text-xs text-brand-text-muted">
            <span>Cert No: <strong className="font-mono text-brand-emerald">{cert.certificateNumber}</strong></span>
            <span>·</span>
            <span>Test Date: <strong>{cert.labTestDate}</strong></span>
          </div>
        </div>

        <div className="bg-brand-canvas p-4 rounded-xl border border-brand-sand">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-brand-text-subtle block">Product Tested:</span>
              <span className="font-bold text-brand-emerald text-sm">{name}</span>
            </div>
            <div>
              <span className="text-brand-text-subtle block">Harvest Provenance:</span>
              <span className="font-semibold text-brand-emerald">{cert.originDistrict}</span>
            </div>
            <div>
              <span className="text-brand-text-subtle block">Season Crop:</span>
              <span className="font-semibold text-brand-emerald">{cert.harvestSeason}</span>
            </div>
            <div>
              <span className="text-brand-text-subtle block">Verification Status:</span>
              <Badge variant="origin" size="sm" className="mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 100% Passed All Standards
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-serif-brand text-base font-bold text-brand-text-display mb-3">
            Certified Laboratory Assay Parameters
          </h4>

          <div className="border border-brand-sand rounded-xl overflow-hidden divide-y divide-brand-sand text-xs">
            <div className="grid grid-cols-3 p-2.5 bg-brand-gold-tint font-bold text-brand-text-display">
              <span>Parameter</span>
              <span>Observed Reading</span>
              <span className="text-right">Safety Standard</span>
            </div>

            <div className="grid grid-cols-3 p-2.5 bg-white">
              <span className="font-medium text-brand-text-body">Single-Origin Purity</span>
              <span className="font-mono font-bold text-brand-emerald">{cert.purityScore}</span>
              <span className="text-right text-brand-text-muted">Min 99.0%</span>
            </div>

            <div className="grid grid-cols-3 p-2.5 bg-brand-canvas">
              <span className="font-medium text-brand-text-body">Moisture Concentration</span>
              <span className="font-mono font-bold text-brand-emerald">{cert.moistureLevel}</span>
              <span className="text-right text-brand-text-muted">Max 5.0% (Crunch Seal)</span>
            </div>

            <div className="grid grid-cols-3 p-2.5 bg-white">
              <span className="font-medium text-brand-text-body">Aflatoxin Toxicity</span>
              <span className="font-mono font-bold text-brand-emerald">{cert.aflatoxinStatus}</span>
              <span className="text-right text-brand-text-muted">Max 10 ppb (Zero Found)</span>
            </div>

            <div className="grid grid-cols-3 p-2.5 bg-brand-canvas">
              <span className="font-medium text-brand-text-body">Chemical Bleaching Agents</span>
              <span className="font-mono font-bold text-brand-emerald">0.0% (Completely Untreated)</span>
              <span className="text-right text-brand-text-muted">Strict Zero Tolerance</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-brand-sand flex items-center justify-between text-xs text-brand-text-muted">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full border-2 border-brand-gold p-1 flex items-center justify-center text-center text-[9px] font-bold text-brand-gold-dark uppercase leading-tight bg-brand-gold-tint">
              Kashmir Verified Origin
            </div>
            <div>
              <p className="font-bold text-brand-emerald">Dr. Bashir A. Dar</p>
              <p>Chief Quality Officer, Agri-Testing Hub</p>
              <p className="font-mono text-[10px] text-brand-text-subtle">Hash: 7f9b8c2a9918</p>
            </div>
          </div>

          <div className="text-right">
            <ShieldCheck className="w-10 h-10 text-brand-emerald ml-auto mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-emerald">
              Cryptographically Sealed
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CertificateModal;
