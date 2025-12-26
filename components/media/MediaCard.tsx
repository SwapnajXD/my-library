"use client";

import { Media } from '@/types';
import { useMediaStore } from '@/store/mediaStore';
import { Star, Plus, Minus, Info, PlayCircle, BookOpen, Hash } from 'lucide-react';

interface MediaCardProps { 
  item: Media; 
  onView: (item: Media) => void; 
  onEdit: (item: Media) => void;
  onDelete: (item: Media) => void; // Added this to match page.tsx
}

export default function MediaCard({ item, onView, onEdit, onDelete }: MediaCardProps) {
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
          <button onClick={() => onView(item)} className="w-32 flex items-center justify-center gap-2 bg-white text-black py-2.5 rounded-full text-[10px] font-black uppercase tracking-tighter hover:scale-105 transition-transform">
            <Info size={14} /> Info
          </button>
          <button onClick={() => onEdit(item)} className="w-32 flex items-center justify-center gap-2 bg-neutral-800 text-white py-2.5 rounded-full text-[10px] font-black uppercase tracking-tighter hover:bg-neutral-700 transition-colors">
            <Hash size={14} /> Progress
          </button>
          {/* Optional: Add a subtle delete button here if you want it visible on hover */}
          <button onClick={() => onDelete(item)} className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest hover:text-red-500 transition-colors mt-2">
            Remove
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-bold text-sm truncate text-neutral-100 text-left">{item.title}</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-neutral-800/40 px-2 py-0.5 rounded-md border border-neutral-800">
             <Star size={10} className="text-yellow-500 fill-yellow-500" />
             <span className="text-[11px] font-black text-neutral-200">{item.rating?.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-neutral-500">
            {item.type === 'manga' ? <BookOpen size={12} /> : <PlayCircle size={12} />}
            <span className="text-[10px] font-bold uppercase tracking-tighter">
                {item.progress || 0} / {item.episodes || '??'}
            </span>
          </div>
        </div>

        {item.type !== 'movie' && (
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/30">
            <div className="flex-1 h-1 bg-neutral-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500" 
                style={{ width: `${item.episodes ? Math.min(((item.progress || 0) / item.episodes) * 100, 100) : 0}%` }}
              />
            </div>
            <div className="flex gap-1">
              <button onClick={() => adjustProgress(-1)} className="p-1 hover:text-white text-neutral-500 transition-colors"><Minus size={12} /></button>
              <button onClick={() => adjustProgress(1)} className="p-1 hover:text-white text-neutral-500 transition-colors"><Plus size={12} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}