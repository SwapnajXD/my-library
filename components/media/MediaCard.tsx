"use client";

import { Media } from "@/types";
import { Play, BookOpen, Trash2, Edit3, Star } from "lucide-react";

interface MediaCardProps {
  item: Media;
  onView: (item: Media) => void;
  onDelete: (id: string) => void; // Changed to accept ID for consistency
}

export default function MediaCard({ item, onView, onDelete }: MediaCardProps) {
  // --- Data Normalization ---
  // Ensures we handle both 'total' and 'episodes' naming from different APIs
  // @ts-ignore
  const total = Number(item.total || item.episodes || 0);
  const progress = Number(item.progress || 0);
  const percentage = total > 0 ? (progress / total) * 100 : 0;
  
  // Safely handle optional rating
  const rating = item.rating ?? 0;
  
  const isReading = item.type === 'book' || item.type === 'manga';

  return (
    <div className="group relative bg-[#0D0D0D] rounded-4xl overflow-hidden border border-neutral-900 transition-all duration-500 hover:border-neutral-700 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
      
      {/* --- Poster Section --- */}
      <div className="aspect-2/3 relative overflow-hidden">
        <img 
          src={item.poster || "/api/placeholder/400/600"} 
          alt={item.title}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Glassmorphism Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
            {isReading ? (
              <BookOpen size={10} className="text-emerald-400" />
            ) : (
              <Play size={10} className="text-sky-400" />
            )}
            <span className="text-[8px] font-black uppercase tracking-widest text-white/90">
              {item.status === 'plan_to_watch' ? 'Queue' : item.status}
            </span>
          </div>
        </div>

        {/* Action Overlay (Visible on Hover) */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onView(item);
            }}
            className="p-3 bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-transform shadow-xl"
            title="Edit Progress"
          >
            <Edit3 size={18} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-3 bg-red-500 text-white rounded-full hover:scale-110 active:scale-95 transition-transform shadow-xl"
            title="Delete Entry"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Bottom Progress Bar (Slim & Glowing) */}
        {total > 0 && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-10">
            <div 
              className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,255,255,0.8)]"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>

      {/* --- Content Section --- */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-sky-400 transition-colors">
            {item.title}
          </h3>
          
          {/* Safe Rating Check */}
          {rating > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-black text-yellow-500 shrink-0">
              <Star size={10} fill="currentColor" />
              {rating.toFixed(1)}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-col">
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
              {isReading ? 'Chapter' : 'Episode'}
            </p>
            <p className="text-xs font-bold text-neutral-200">
              {progress} <span className="text-neutral-600 font-medium">/ {total > 0 ? total : '?'}</span>
            </p>
          </div>
          
          <div className="text-[9px] font-black px-2 py-1 rounded-lg bg-neutral-900 text-neutral-500 border border-neutral-800 uppercase tracking-tighter">
            {item.year || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}