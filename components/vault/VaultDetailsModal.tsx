"use client";

import { Media, MediaStatus } from "@/types";
import { useMediaStore } from "@/store/mediaStore";
import { X, Calendar, User, Star, Settings2, Play, CheckCircle2, Clock } from "lucide-react";

interface Props {
  item: Media;
  onClose: () => void;
  onEdit: () => void;
}

export const VaultDetailsModal = ({ item, onClose, onEdit }: Props) => {
  const updateMedia = useMediaStore((state) => state.updateMedia);

  const formatStatus = (status: MediaStatus | string) => {
    return status.replace(/_/g, ' ');
  };

  const handleQuickContinue = () => {
    const isFinished = item.total > 0 && item.progress + 1 >= item.total;
    
    updateMedia(item.id, {
      progress: item.total > 0 ? Math.min(item.progress + 1, item.total) : item.progress + 1,
      status: isFinished ? 'completed' : item.status
    });
  };

  const isReading = item.type === 'manga' || item.type === 'book';

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl" 
      onClick={onClose}
    >
      <div 
        className="bg-neutral-950 border border-neutral-900 w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[48px] flex flex-col md:flex-row shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Poster */}
        <div className="w-full md:w-[45%] h-[40vh] md:h-auto relative">
          <img src={item.poster} className="w-full h-full object-cover" alt={item.title} />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-neutral-950 via-transparent to-transparent" />
        </div>

        {/* Right Side: Content */}
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
              <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
                {item.title}
              </h2>
            </div>
            <button onClick={onClose} className="p-3 bg-neutral-900 rounded-full text-neutral-500 hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="p-5 bg-neutral-900/40 rounded-[24px] border border-neutral-900">
              <Star className="text-yellow-500 mb-1" size={14} />
              <p className="text-[10px] font-black text-white">{item.rating?.toFixed(1) || "0.0"}</p>
            </div>
            <div className="p-5 bg-neutral-900/40 rounded-[24px] border border-neutral-900">
              <Calendar className="text-sky-500 mb-1" size={14} />
              <p className="text-[10px] font-black text-white">{item.year || "N/A"}</p>
            </div>
            <div className="p-5 bg-neutral-900/40 rounded-[24px] border border-neutral-900">
              <Clock className="text-emerald-500 mb-1" size={14} />
              <p className="text-[10px] font-black text-white">{item.progress}/{item.total || '?'}</p>
            </div>
            <div className="p-5 bg-neutral-900/40 rounded-[24px] border border-neutral-900">
              <User className="text-purple-500 mb-1" size={14} />
              <p className="text-[10px] font-black text-white truncate">{item.creator || "Unknown"}</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 mb-10">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-700">Synopsis</h4>
            <p className="text-neutral-400 text-sm leading-relaxed">{item.synopsis}</p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-auto pt-8 border-t border-neutral-900 flex gap-4">
            <button 
              onClick={onEdit}
              className="flex-[1] py-5 bg-neutral-900 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center gap-3"
            >
              <Settings2 size={16} /> Modify
            </button>

            <button 
              onClick={handleQuickContinue}
              className="flex-[2] py-5 bg-white text-black rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-3 group shadow-xl"
            >
              <Play size={16} className="fill-current" /> 
              Continue {isReading ? 'Reading' : 'Watching'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};