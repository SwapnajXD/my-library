"use client";

import { Media } from "@/types";
import { X, Play, BookOpen, Star, Calendar } from "lucide-react";
import { useEffect } from "react";

interface MediaModalProps {
  item: Media;
  onClose: () => void;
  onEdit: () => void;
}

export default function MediaModal({ item, onClose, onEdit }: MediaModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const isReading = item.type === 'book' || item.type === 'manga';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-[#0A0A0A] w-full max-w-3xl h-full max-h-[600px] rounded-[32px] border border-neutral-800 overflow-hidden flex flex-col md:flex-row shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Left: Poster */}
        <div className="hidden md:block w-[260px] shrink-0 relative bg-neutral-900 border-r border-neutral-900">
          <img 
            src={item.poster || "/api/placeholder/400/600"} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A]">
          {/* Header */}
          <div className="p-6 pb-2 flex justify-between items-start shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">
                  {item.type}
                </span>
                {item.rating && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-md">
                    <Star size={10} fill="currentColor" />
                    {item.rating}
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight truncate">
                {item.title}
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-neutral-600 hover:text-white transition-colors shrink-0 p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Mid-section with FADE EFFECT */}
          <div className="relative flex-1 min-h-0">
            <div 
              className="h-full overflow-y-auto p-6 pt-2 space-y-6 scrollbar-hide"
              style={{
                /* This creates the fade out effect at the bottom */
                maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
              }}
            >
              <div className="flex gap-4 text-neutral-500">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                  <Calendar size={12} />
                  {item.year || 'N/A'}
                </div>
              </div>

              {item.genres && item.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.genres.map((genre) => (
                    <span key={genre} className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <div className="pb-10"> {/* Extra padding so text doesn't end exactly at the fade */}
                <h3 className="text-[9px] font-black uppercase tracking-widest text-neutral-600 mb-2">About</h3>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  {item.synopsis || "No description available."}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-6 border-t border-neutral-900 flex gap-3 shrink-0">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onEdit();
              }}
              className="flex-[2] bg-white text-black py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
            >
              {isReading ? <BookOpen size={14} /> : <Play size={14} />}
              Update
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="flex-1 bg-neutral-900 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-neutral-800 hover:bg-neutral-800 transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}