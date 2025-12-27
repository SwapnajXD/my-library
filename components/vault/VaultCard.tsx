"use client";

import { Star, Trash2, BookOpen, Film, Tv, ScrollText, Library } from "lucide-react";
import { type MediaItem } from "@/store/mediaStore";

interface VaultCardProps {
  item: MediaItem;
  onView: (item: MediaItem) => void;
  onDelete: (id: string) => void;
}

export const VaultCard = ({ item, onView, onDelete }: VaultCardProps) => {
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'movie': return <Film size={10} />;
      case 'tv': return <Tv size={10} />;
      case 'anime': return <Tv size={10} className="text-sky-400" />;
      case 'manga': return <ScrollText size={10} className="text-orange-400" />;
      case 'book': return <Library size={10} className="text-emerald-400" />;
      default: return <BookOpen size={10} />;
    }
  };

  return (
    <div 
      onClick={() => onView(item)}
      className="group relative bg-neutral-950 border border-neutral-900 rounded-4xl overflow-hidden hover:border-neutral-700 transition-all duration-500 cursor-pointer active:scale-[0.98]"
    >
      <div className="aspect-2/3 overflow-hidden bg-neutral-900">
        <img 
          src={item.poster || "/placeholder.png"} 
          alt={item.title}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
        />
      </div>

      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          onDelete(item.id); 
        }}
        className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md text-neutral-500 rounded-2xl hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
      >
        <Trash2 size={14} />
      </button>

      <div className="absolute inset-0 flex flex-col justify-end p-5 bg-linear-to-t from-black via-black/40 to-transparent pointer-events-none">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-md rounded-lg">
            {getTypeIcon(item.type)}
            <span className="text-[8px] font-black uppercase tracking-widest text-white/90">
              {item.type}
            </span>
          </div>
          <span className="text-[9px] font-bold text-neutral-400">
            {item.year || 'N/A'}
          </span>
        </div>
        
        <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-sky-400 transition-colors duration-300">
          {item.title}
        </h3>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-yellow-500 text-yellow-500" />
            <span className="text-[10px] font-black text-neutral-300">
              {item.rating?.toFixed(1) || "0.0"}
            </span>
          </div>
          
          <span className="text-[9px] font-black uppercase tracking-tighter text-neutral-500 group-hover:text-white transition-colors">
            View Details
          </span>
        </div>

        <div className="mt-3 w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-sky-500 transition-all duration-1000 shadow-[0_0_10px_#0ea5e9]"
            style={{ width: `${item.total > 0 ? (item.progress / item.total) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};