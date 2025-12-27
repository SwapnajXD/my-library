"use client";

import { Media, MediaStatus } from "@/types";
import { X, Calendar, User, Star, Edit3, Clock } from "lucide-react";

interface Props {
  item: Media;
  onClose: () => void;
  onEdit: () => void;
}

export const VaultDetailsModal = ({ item, onClose, onEdit }: Props) => {
  const formatStatus = (status: MediaStatus | string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div 
      className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl" 
      onClick={onClose}
    >
      <div 
        className="bg-neutral-950 border border-neutral-900 w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[48px] flex flex-col md:flex-row shadow-[0_0_100px_-20px_rgba(0,0,0,1)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Large Poster */}
        <div className="w-full md:w-[45%] h-[40vh] md:h-auto relative">
          <img 
            src={item.poster} 
            className="w-full h-full object-cover" 
            alt={item.title} 
          />
          <div className="absolute inset-0 bg-linear-to-t md:bg-linear-to-r from-neutral-950 via-transparent to-transparent" />
          
          <div className="absolute bottom-8 left-8 flex flex-wrap gap-2">
            {item.genres?.slice(0, 3).map(genre => (
              <span key={genre} className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black uppercase text-white/70 tracking-widest">
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side: Metadata Content */}
        <div className="flex-1 p-8 md:p-14 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500">{item.type}</span>
                <span className="w-1 h-1 rounded-full bg-neutral-800" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600">
                  {formatStatus(item.status)}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white leading-none">
                {item.title}
              </h2>
            </div>
            <button onClick={onClose} className="p-3 bg-neutral-900 rounded-full text-neutral-500 hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="p-5 bg-neutral-900/40 rounded-3xl border border-neutral-900">
              <Star className="text-yellow-500 mb-2" size={16} />
              <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Score</p>
              <p className="text-lg font-black text-white">{item.rating?.toFixed(1) || "0.0"}</p>
            </div>
            <div className="p-5 bg-neutral-900/40 rounded-3xl border border-neutral-900">
              <Calendar className="text-sky-500 mb-2" size={16} />
              <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Year</p>
              <p className="text-lg font-black text-white">{item.year || "N/A"}</p>
            </div>
            <div className="p-5 bg-neutral-900/40 rounded-3xl border border-neutral-900">
              <Clock className="text-emerald-500 mb-2" size={16} />
              <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Progress</p>
              <p className="text-lg font-black text-white">
                {item.progress}<span className="text-neutral-700 text-sm">/{item.total || '?'}</span>
              </p>
            </div>
            <div className="p-5 bg-neutral-900/40 rounded-3xl border border-neutral-900">
              <User className="text-purple-500 mb-2" size={16} />
              <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Creator</p>
              <p className="text-sm font-black text-white truncate">{item.creator || "Unknown"}</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 mb-10">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-700 border-b border-neutral-900 pb-2">Synopsis</h4>
            <p className="text-neutral-400 text-sm leading-relaxed font-medium">
              {item.synopsis || "Information for this entry has not been fully indexed in the digital vault yet."}
            </p>
          </div>

          <div className="mt-auto pt-8 border-t border-neutral-900">
            <button 
              onClick={onEdit}
              className="w-full py-6 bg-white text-black rounded-[28px] font-black uppercase text-xs tracking-[0.2em] hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-4 group"
            >
              <Edit3 size={18} className="group-hover:rotate-12 transition-transform" />
              Modify Entry Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};