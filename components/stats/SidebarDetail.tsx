"use client";

import React, { useEffect, useState } from "react";
import { X, Star, ExternalLink } from "lucide-react";

// --- DECRYPTION EFFECT COMPONENT ---
const DecryptedTitle = ({ text, isVisible }: { text: string; isVisible: boolean }) => {
  const [displayText, setDisplayText] = useState("");
  const chars = "!<>-_\\/[]{}—=+*^?#________";

  useEffect(() => {
    if (!isVisible) {
      setDisplayText("");
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) return char;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3; // Controls speed of decryption
    }, 30);

    return () => clearInterval(interval);
  }, [text, isVisible]);

  return <span>{displayText}</span>;
};

interface SidebarProps {
  data?: {
    id: string;
    title: string;
    poster?: string;
    rating?: number;
    type?: string;
    status?: string;
    creator?: string;
    genres?: string[];
  };
  onClose: () => void;
}

export const SidebarDetail = ({ data, onClose }: SidebarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (data) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [data]);

  const slideClass = (delay: string) => `
    transition-all duration-700 ease-out transform
    ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
    ${delay}
  `;

  return (
    <aside 
      className={`absolute top-0 right-0 h-full w-80 bg-black/90 border-l border-white/10 backdrop-blur-2xl z-50 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
        data ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {data && (
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar font-mono text-white">
          
          {/* Header Area */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-30 pointer-events-none">
            <span className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[7px] font-black text-sky-500 uppercase tracking-[0.3em] pointer-events-auto">
              ID_{data.id.split('-')[0]}
            </span>
            <button 
              onClick={() => { setIsVisible(false); onClose(); }} 
              className="p-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white/40 hover:text-white transition-colors pointer-events-auto"
            >
              <X size={16}/>
            </button>
          </div>

          {/* POSTER SECTION */}
          <div className={`relative w-full aspect-[3/4] bg-zinc-900 overflow-hidden border-b border-white/10 group shrink-0 ${slideClass('delay-0')}`}>
            <img 
              src={data.poster || "/placeholder-poster.png"} 
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-125" 
              alt=""
            />
            <img
              src={data.poster || "/placeholder-poster.png"}
              alt={data.title}
              className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
            
            {/* DECRYPTING TITLE */}
            <div className="absolute bottom-0 left-0 w-full p-5 z-30">
               <h3 className="text-lg font-black text-white uppercase leading-tight tracking-tighter italic drop-shadow-lg min-h-[1.5em]">
                <DecryptedTitle text={data.title} isVisible={isVisible} />
              </h3>
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="p-5 flex flex-col flex-grow bg-black">
            
            {/* Stats */}
            <div className={`grid grid-cols-2 gap-2 mb-6 ${slideClass('delay-100')}`}>
              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5 flex flex-col items-center">
                <div className="flex items-center gap-1 text-sky-500 mb-0.5">
                  <Star size={10} fill="currentColor" />
                  <span className="text-white text-sm font-black italic">{data.rating || 0}.0</span>
                </div>
                <span className="text-[6px] uppercase text-white/30 tracking-widest">Score</span>
              </div>
              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                <p className="text-[6px] uppercase font-black text-white/30 tracking-widest mb-0.5">Type</p>
                <p className="text-[9px] uppercase font-black text-sky-400">{data.type || 'N/A'}</p>
              </div>
            </div>

            {/* Metadata */}
            <div className={`space-y-3 mb-8 ${slideClass('delay-200')}`}>
              <div className="flex justify-between items-center text-[8px] border-b border-white/5 pb-2">
                <span className="font-black uppercase tracking-widest text-white/20">Status</span>
                <span className="font-bold text-white uppercase">{data.status}</span>
              </div>
              <div className="flex justify-between items-center text-[8px] border-b border-white/5 pb-2">
                <span className="font-black uppercase tracking-widest text-white/20">Source</span>
                <span className="font-bold text-sky-500 uppercase italic">{data.creator || 'N/A'}</span>
              </div>
              
              <div className="pt-1">
                 <div className="flex flex-wrap gap-1.5 mt-2">
                  {data.genres?.map((genre, idx) => (
                    <span 
                      key={genre} 
                      className={`px-2 py-1 bg-white/5 border border-white/10 rounded text-[6px] font-black text-white/50 uppercase transition-all duration-500`}
                      style={{ 
                        transitionDelay: `${300 + (idx * 50)}ms`, 
                        transform: isVisible ? 'translateY(0)' : 'translateY(10px)', 
                        opacity: isVisible ? 1 : 0 
                      }}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className={slideClass('delay-[400ms] mt-auto')}>
              <button className="w-full py-3.5 bg-white text-black font-black uppercase text-[9px] tracking-[0.3em] rounded-xl hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 group">
                View_Logs 
                <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};