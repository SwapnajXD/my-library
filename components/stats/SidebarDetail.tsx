"use client";

import React from "react";
import { X, Star, Play, Info, ExternalLink } from "lucide-react";

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
  return (
    <aside 
      className={`absolute top-0 right-0 h-full w-80 bg-black/95 border-l border-white/5 backdrop-blur-2xl z-50 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        data ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {data && (
        <div className="p-8 flex flex-col h-full overflow-y-auto no-scrollbar font-mono text-white">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[8px] font-black text-sky-500 uppercase tracking-[0.4em]">Node_Identity</span>
            <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
              <X size={20}/>
            </button>
          </div>
          
          <h3 className="text-xl font-black text-white uppercase mb-6 leading-tight tracking-tighter italic">
            {data.title}
          </h3>

          <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl mb-8">
            <img 
              src={data.poster || "/placeholder-poster.png"} 
              className="w-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt={data.title} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center">
              <Star className="text-sky-500 mb-1" size={14} />
              <p className="text-white text-lg font-black italic">{data.rating || 0}.0</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
              <p className="text-[7px] uppercase font-black text-white/30 tracking-widest mb-1">Class</p>
              <p className="text-[9px] uppercase font-black text-white">{data.type || 'Unknown'}</p>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Status</span>
              <span className="text-[9px] font-bold text-white uppercase">{data.status}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Origin</span>
              <span className="text-[9px] font-bold text-sky-500 uppercase">{data.creator || 'N/A'}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {data.genres?.map((genre) => (
                <span key={genre} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[7px] font-black text-white/60 uppercase">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          <button className="mt-auto w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-xl hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95">
            Access_Full_Log <ExternalLink size={12} />
          </button>
        </div>
      )}
    </aside>
  );
}