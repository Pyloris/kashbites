import React from 'react';
export const Logo = ({ className = '', size = 'md', variant = 'dark', showTagline = true, }) => {
    const sizeClasses = {
        sm: 'h-9',
        md: 'h-12',
        lg: 'h-16',
    };
    return (<div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Brand Iconography Mark */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg viewBox="0 0 100 80" className={size === 'sm' ? 'w-8 h-7' : size === 'lg' ? 'w-14 h-12' : 'w-11 h-9'} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Mountain Peaks Silhouette */}
          <path d="M8 65L38 18L55 42L66 26L92 65H8Z" fill={variant === 'light' ? '#EFE6D5' : '#143E26'}/>
          {/* Snow Ridge Highlight */}
          <path d="M38 18L44 28L39 33L48 40L38 44L30 35L38 18Z" fill={variant === 'light' ? '#FFFFFF' : '#DFB248'} opacity="0.9"/>
          <path d="M66 26L71 34L67 38L74 44L65 48L61 40L66 26Z" fill={variant === 'light' ? '#FFFFFF' : '#DFB248'} opacity="0.85"/>
          {/* Kashmiri Chinar / Green Leaf Motif */}
          <path d="M72 15C76 9 84 10 88 15C87 23 79 26 72 24C68 22 69 17 72 15Z" fill="#2D7A46"/>
          <path d="M63 20C66 14 74 15 77 20C76 27 69 29 63 27C60 25 61 21 63 20Z" fill="#459A60"/>
          {/* Shelled Walnut Kernel */}
          <circle cx="82" cy="27" r="7.5" fill="#C59432" stroke="#FAF7F2" strokeWidth="1"/>
          <path d="M77 27C79 24 85 24 87 27C85 30 79 30 77 27Z" fill="#8B572A"/>
        </svg>
      </div>

      {/* Typography Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className={`font-serif-brand font-bold tracking-tight ${variant === 'light' ? 'text-[#FAF7F2]' : 'text-[#0E331E]'} ${size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl'}`}>
            Kash<span className="text-[#C59432]">Bites</span>
          </span>
          <span className={`text-[10px] ml-1 font-bold ${variant === 'light' ? 'text-[#DFB248]' : 'text-[#C59432]'}`}>
            ®
          </span>
        </div>

        {showTagline && (<div className="flex items-center gap-1.5 -mt-0.5">
            <span className="w-2.5 h-[1px] bg-[#C59432] opacity-70"></span>
            <span className={`text-[9px] tracking-[0.2em] font-semibold uppercase ${variant === 'light' ? 'text-[#D8CDBC]' : 'text-[#5C6E61]'}`}>
              A Taste of Kashmir
            </span>
            <span className="w-2.5 h-[1px] bg-[#C59432] opacity-70"></span>
          </div>)}
      </div>
    </div>);
};
