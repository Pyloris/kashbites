import React, { useState, useEffect } from 'react';
import { IProduct } from '../../types/index.js';
import { X, Play, Pause, RotateCcw, ShieldCheck, CheckCircle2, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface PackagingVideoModalProps {
  product: IProduct;
  isOpen: boolean;
  onClose: () => void;
}

export const PackagingVideoModal: React.FC<PackagingVideoModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isMuted, setIsMuted] = useState(true);

  const video = product.packagingVideo;

  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        const next = prev + 1.5;
        // Adjust step according to progress
        if (next < 25) setCurrentStepIndex(0);
        else if (next < 55) setCurrentStepIndex(1);
        else if (next < 80) setCurrentStepIndex(2);
        else setCurrentStepIndex(3);
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  const handleRestart = () => {
    setProgress(0);
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const selectStep = (index: number) => {
    setCurrentStepIndex(index);
    setProgress(index * 25 + 5);
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0D2418] rounded-2xl shadow-2xl border-2 border-[#C59432]/50 overflow-hidden text-[#FAF7F2]">
        
        {/* Modal Top Bar */}
        <div className="bg-[#071910] p-4 flex items-center justify-between border-b border-[#1A422B]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DFB248] animate-pulse"></span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#DFB248] block">
                Srinagar Processing Hub · Live Quality Cam
              </span>
              <h3 className="font-serif-brand text-lg font-bold">
                {video.title}
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

        {/* Video Canvas Container */}
        <div className="relative aspect-16/9 bg-[#040C07] overflow-hidden group">
          
          {/* Main Visual Packaging Simulation Screen */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={product.images[currentStepIndex % product.images.length] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover opacity-90 transition-all duration-700 filter brightness-95"
              referrerPolicy="no-referrer"
            />

            {/* Packaging Room Overlay Graphics */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

            {/* Digital Cleanroom HUD Stamp */}
            <div className="absolute top-4 left-4 font-mono text-[11px] bg-black/60 px-3 py-1.5 rounded backdrop-blur-md border border-white/20 text-[#DFB248] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>HUB: SRINAGAR CLASS-10000 CLEANROOM</span>
              <span>· TEMP: 16°C · RH: 3.2%</span>
            </div>

            {/* Active Step Indicator Pill in Video */}
            <div className="absolute bottom-16 left-6 right-6">
              <div className="bg-[#0F2F1E]/95 backdrop-blur-md p-3.5 rounded-xl border border-[#DFB248]/40 shadow-xl max-w-lg">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#DFB248] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#DFB248]" />
                  Active Packaging Step {currentStepIndex + 1} of {video.steps.length}
                </span>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {video.steps[currentStepIndex]}
                </p>
              </div>
            </div>

            {/* Play/Pause Large Center Trigger */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-[#143E26]/80 text-[#DFB248] border-2 border-[#DFB248] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform backdrop-blur-sm"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>
          </div>

          {/* Video Player Bottom Control Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 to-transparent p-3 pt-6 flex flex-col gap-2">
            
            {/* Progress Scrubber */}
            <div
              className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                setProgress(pos * 100);
              }}
            >
              <div
                className="bg-[#DFB248] h-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#E3DDD1]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:text-white transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button onClick={handleRestart} className="hover:text-white transition-colors" title="Replay">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white transition-colors">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="font-mono text-[11px] text-[#A08E73]">
                  0:{Math.floor((progress / 100) * 45).toString().padStart(2, '0')} / {video.duration}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#A2B5A8]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D7A46]" />
                <span>100% Sealed & Nitrogen Flushed</span>
              </div>
            </div>

          </div>

        </div>

        {/* Verification Checklist Steps */}
        <div className="p-4 sm:p-5 bg-[#0B2014] border-t border-[#1A422B]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#DFB248] mb-3">
            Hygienic Process Steps (Click to inspect phase):
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {video.steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => selectStep(idx)}
                className={`p-2.5 rounded-lg text-left transition-all flex items-start gap-2 border ${
                  currentStepIndex === idx
                    ? 'bg-[#153D25] border-[#DFB248] text-white font-semibold'
                    : 'bg-[#08180E] border-[#183B25] text-[#BDC7C0] hover:bg-[#112E1C]'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-[#DFB248] text-[#0A2416] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="line-clamp-2">{step}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#183B25] flex flex-wrap items-center justify-between text-xs text-[#8BA092]">
            <span>Facility: <strong className="text-white">{video.facilityLocation}</strong></span>
            <span className="text-[#DFB248] font-medium">Standard: {video.cleanlinessStandard}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
