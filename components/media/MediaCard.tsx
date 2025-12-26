"use client";

import { motion } from 'framer-motion';
import { Media } from '@/types';
import { Edit2, Trash2, Star, ImageOff } from 'lucide-react';

interface MediaCardProps {
  item: Media;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MediaCard({ item, onEdit, onDelete }: MediaCardProps) {
  const posterSrc = item.poster && item.poster.trim() !== "" ? item.poster : null;

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl shadow-sm border dark:border-slate-800 overflow-hidden flex flex-col h-full"
    >
      <div className="relative aspect-2/3 bg-slate-100 dark:bg-slate-800 w-full">
        {posterSrc ? (
          <img 
            src={posterSrc} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <ImageOff size={32} className="opacity-20" />
          </div>
        )}

        {/* Hover Controls */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white cursor-pointer transition-transform active:scale-95"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-3 bg-red-500/50 hover:bg-red-500/70 backdrop-blur-md rounded-full text-white cursor-pointer transition-transform active:scale-95"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm flex-1">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 text-yellow-500 shrink-0">
            <Star size={10} fill="currentColor" />
            <span className="text-[10px] font-bold">{item.rating}</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            {item.status}
          </span>
        </div>
      </div>
    </motion.div>
  );
}