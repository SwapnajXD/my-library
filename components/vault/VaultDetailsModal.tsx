"use client";

import { useState } from 'react';
import { Media, MediaStatus } from '@/types';
import { useMediaStore } from '@/store/mediaStore';
import { 
  X, Star, Play, BookOpen, Tag, ExternalLink, 
  Search, Youtube, Globe, Settings2, Clock, Hash
} from 'lucide-react';

interface Props {
  item: Media;
  onClose: () => void;
  onEdit: () => void;
  onGenreClick: (genre: string) => void; // Added this line
}

export const VaultDetailsModal = ({ item, onClose, onEdit, onGenreClick }: Props) => {
  const [showSources, setShowSources] = useState(false);
  const updateMedia = useMediaStore((state) => state.updateMedia);

  const sources = [
    { 
      name: 'Google Search', 
      icon: <Search size={18} />, 
      url: `https://www.google.com/search?q=watch+${encodeURIComponent(item.title)}` 
    },
    { 
      name: 'YouTube', 
      icon: <Youtube size={18} />, 
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title)}+trailer` 
    },
    { 
      name: item.type === 'manga' ? 'MangaDex' : 'AnimeKai', 
      icon: <Globe size={18} />, 
      url: item.type === 'manga' 
        ? `https://mangadex.org/search?q=${encodeURIComponent(item.title)}` 
        : `https://animekai.to/browser?keyword=${encodeURIComponent(item.title)}` 
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl" onClick={onClose}>
      <div 
        className="bg-[#050505] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[48px] flex flex-col md:flex-row shadow-2xl border border-neutral-900 animate-in fade-in zoom-in duration-300" 
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Poster */}
        <div className="w-full md:w-[40%] h-72 md:h-auto relative shrink-0">
          <img src={item.poster || '/placeholder.png'} className="w-full h-full object-cover" alt={item.title} />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col bg-[#050505]">
          {!showSources ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500">{item.type}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-800" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600">
                        {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white leading-none">{item.title}</h2>
                </div>
                <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="flex items-center gap-3 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-black text-white">{item.rating?.toFixed(1) || "0.0"}</span>
                </div>
                <div className="flex items-center gap-3 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
                  <Clock size={16} className="text-emerald-500" />
                  <span className="text-sm font-black text-white">{item.progress}/{item.total || '?'}</span>
                </div>
              </div>

              {/* Clickable Genres */}
              {item.genres && item.genres.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-700 mb-3 flex items-center gap-2">
                    <Hash size={10} /> Tags (Filter)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {item.genres.map((genre) => (
                      <button 
                        key={genre} 
                        onClick={() => onGenreClick(genre)}
                        className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-[9px] font-black uppercase text-neutral-400 tracking-widest hover:bg-sky-500 hover:text-white transition-all active:scale-95"
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Synopsis */}
              <div className="mb-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-700 mb-4 flex items-center gap-2">
                  <Tag size={10} /> Full Synopsis
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed font-medium whitespace-pre-wrap">
                  {item.synopsis || "No description available."}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="mt-auto pt-6 border-t border-neutral-900 flex gap-4 bg-[#050505]">
                <button 
                  onClick={onEdit} 
                  className="flex-1 py-4 rounded-[20px] bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest border border-neutral-800 hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
                >
                  <Settings2 size={16} /> Modify
                </button>
                <button 
                  onClick={() => setShowSources(true)}
                  className="flex-1 py-4 rounded-[20px] bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-sky-500 hover:text-white transition-all shadow-xl"
                >
                  {item.type === 'manga' ? <BookOpen size={16}/> : <Play size={16}/>} Continue
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Source View */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Select Source</h2>
                <button onClick={() => setShowSources(false)} className="text-neutral-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] border border-neutral-800 px-4 py-2 rounded-full">Back</button>
              </div>
              <div className="space-y-3 flex-1">
                {sources.map((source) => (
                  <a 
                    key={source.name} 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between p-5 bg-neutral-900/40 border border-neutral-800 rounded-3xl hover:bg-neutral-800/60 hover:border-neutral-700 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-neutral-500 group-hover:text-white">{source.icon}</div>
                      <span className="text-[11px] font-black text-white uppercase tracking-widest">{source.name}</span>
                    </div>
                    <ExternalLink size={14} className="text-neutral-700 group-hover:text-white" />
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};