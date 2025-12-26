"use client";

import { Media } from '@/types';
import { useMediaStore } from '@/store/mediaStore';
import { Star, Plus, Minus } from 'lucide-react';

interface MediaCardProps { 
  item: Media; 
  onView: (item: Media) => void; 
  onDelete: (item: Media) => void;
}

export default function MediaCard({ item, onView, onDelete }: MediaCardProps) {
  const updateProgress = useMediaStore(state => state.updateProgress);

  const adjustProgress = (amount: number) => {
    const next = (item.progress || 0) + amount;
    const max = item.episodes || Infinity;
    if (next >= 0 && next <= max) {
      updateProgress(item.id, next);
    }
  };

  return (
    <div className="group relative bg-neutral-900/40 rounded-4xl border border-neutral-800/50 overflow-hidden flex flex-col transition-all hover:border-neutral-700 hover:bg-neutral-900/60 shadow-2xl">
      <div className="relative aspect-2/3 overflow-hidden bg-black text-left">
        <img 
          src={item.poster || '/placeholder.png'} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
          alt={item.title}
        />
        
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-20 backdrop-blur-[2px]">
          <button onClick={() => onView(item)} className="w-32 py-2.5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform">
            Details
          </button>
          <button onClick={() => onDelete(item)} className="text-[9px] text-neutral-600 font-bold uppercase tracking-[0.2em] hover:text-red-500 transition-colors mt-2">
            Remove
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <h3 className="font-bold text-sm truncate text-neutral-100 text-left">{item.title}</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-neutral-800/40 px-2 py-0.5 rounded-lg border border-neutral-800">
             <Star size={10} className="text-yellow-500 fill-yellow-500" />
             <span className="text-[11px] font-black text-neutral-200">{item.rating?.toFixed(1)}</span>
          </div>
          <span className="text-[10px] font-black text-neutral-500 tracking-tighter">
            {item.progress} <span className="text-neutral-700 mx-0.5">/</span> {item.episodes || '??'}
          </span>
        </div>

        {item.type !== 'movie' && (
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-1 bg-neutral-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500 ease-out" 
                style={{ width: `${item.episodes ? Math.min(((item.progress || 0) / item.episodes) * 100, 100) : 0}%` }}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => adjustProgress(-1)} className="text-neutral-600 hover:text-white transition-colors"><Minus size={14} /></button>
              <button onClick={() => adjustProgress(1)} className="text-neutral-600 hover:text-white transition-colors"><Plus size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}