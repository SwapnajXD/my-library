"use client";

import { motion } from 'framer-motion';
import { Media } from '@/types';
import { Edit2, Trash2, Star, ImageOff } from 'lucide-react';

interface MediaCardProps {
  item: Media;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MediaCard({ item, onDelete, onEdit }: MediaCardProps) {
  const posterSrc = item.poster && item.poster.trim() !== "" ? item.poster : null;

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-900 overflow-hidden flex flex-col h-full transition-colors"
    >
      <div className="relative aspect-[2/3] bg-neutral-100 dark:bg-neutral-950 w-full">
        {posterSrc ? (
          <img 
            src={posterSrc} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
            <ImageOff size={24} className="opacity-20" />
          </div>
        )}

        {/* AMOLED Hover Overlay - Using Pure Black with Opacity */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
          <button 
            onClick={onEdit}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all active:scale-90"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={onDelete}
            className="p-3 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md rounded-full text-red-500 transition-all active:scale-90"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-xs dark:text-neutral-200 truncate mb-2">
          {item.title}
        </h3>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-[9px] text-neutral-500 uppercase font-black tracking-tighter">
            {item.status}
          </span>
          {item.rating > 0 && (
            <div className="flex items-center gap-1 text-neutral-400">
              <Star size={10} fill="currentColor" />
              <span className="text-[10px] font-bold">{item.rating}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}