import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, ShieldCheck, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Badge } from '../ui/index.js';

export const PackagingVideoModal = ({ product, packagingVideo, productName, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isMuted, setIsMuted] = useState(true);

  const video = product?.packagingVideo || packagingVideo;
  const name = product?.name || productName || 'KashBites Product';
  const images = product?.images || [];

  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        const next = prev + 1.5;
        if (next < 25) setCurrentStepIndex(0);
        else if (next < 55) setCurrentStepIndex(1);
        else if (next < 80) setCurrentStepIndex(2);
        else setCurrentStepIndex(3);
        return next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  if (!isOpen || !video) return null;

  const handleRestart = () => {
    setProgress(0);
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const selectStep = (index) => {
    setCurrentStepIndex(index);
    setProgress(index * 25 + 5);
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-brand-emerald-darker rounded-2xl shadow-2xl border-2 border-brand-gold/50 overflow-hidden text-brand-text-light">
        <div className="bg-brand-emerald-deep p-4 flex items-center justify-between border-b border-brand-emerald/40">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse"></span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold block">
                Srinagar Processing Hub · Live Quality Cam
              </span>
              <h3 className="font-serif-brand text-lg font-bold">
                {video.title}
              </h3>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative aspect-16/9 bg-black/90 overflow-hidden group">
          <div className="absolute inset-0 flex items-center justify-center">
            {images.length > 0 && (
              <img
                src={images[currentStepIndex % images.length] || images[0]}
                alt={name}
                className="w-full h-full object-cover opacity-90 transition-all duration-700 filter brightness-95"
                referrerPolicy="no-referrer"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

            <div className="absolute top-4 left-4 font-mono text-[11px] bg-black/60 px-3 py-1.5 rounded backdrop-blur-md border border-white/20 text-brand-gold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>HUB: SRINAGAR CLASS-10000 CLEANROOM</span>
              <span>· TEMP: 16°C · RH: 3.2%</span>
            </div>

            <div className="absolute bottom-16 left-6 right-6">
              <div className="bg-brand-emerald-dark/95 backdrop-blur-md p-3.5 rounded-xl border border-brand-gold/40 shadow-xl max-w-lg">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-brand-gold" />
                  Active Packaging Step {currentStepIndex + 1} of {video.steps.length}
                </span>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {video.steps[currentStepIndex]}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-brand-emerald/80 text-brand-gold border-2 border-brand-gold flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform backdrop-blur-sm cursor-pointer"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>
          </div>

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 to-transparent p-3 pt-6 flex flex-col gap-2">
            <div
              className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                setProgress(pos * 100);
              }}
            >
              <div className="bg-brand-gold h-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="flex items-center justify-between text-xs text-brand-sand-light">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white transition-colors cursor-pointer">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button onClick={handleRestart} className="hover:text-white transition-colors cursor-pointer" title="Replay">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white transition-colors cursor-pointer">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="font-mono text-[11px] text-brand-gold-tint">
                  0:{Math.floor((progress / 100) * 45).toString().padStart(2, '0')} / {video.duration}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-brand-text-subtle">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald-light" />
                <span>100% Sealed & Nitrogen Flushed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-brand-emerald-dark border-t border-brand-emerald/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold mb-3">
            Hygienic Process Steps (Click to inspect phase):
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {video.steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => selectStep(idx)}
                className={`p-2.5 rounded-lg text-left transition-all flex items-start gap-2 border cursor-pointer ${
                  currentStepIndex === idx
                    ? 'bg-brand-emerald border-brand-gold text-white font-semibold'
                    : 'bg-brand-emerald-deep border-brand-emerald/30 text-gray-300 hover:bg-brand-emerald/40'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-brand-gold text-brand-emerald-dark font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="line-clamp-2">{step}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-brand-emerald/30 flex flex-wrap items-center justify-between text-xs text-brand-sand">
            <span>Facility: <strong className="text-white">{video.facilityLocation}</strong></span>
            <span className="text-brand-gold font-medium">Standard: {video.cleanlinessStandard}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagingVideoModal;
