"use client";

import { useState } from 'react';
import { Media } from '@/types';
import { X, Star, Play, BookOpen, Tag, ExternalLink, Search, Youtube, Globe } from 'lucide-react';

interface MediaModalProps {
  item: Media;
  onClose: () => void;
  onEdit: () => void;
}

export default function MediaModal({ item, onClose, onEdit }: MediaModalProps) {
  const [showSources, setShowSources] = useState(false);

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
    <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="bg-[#050505] w-full max-w-2xl border border-neutral-900 rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-2xl max-h-[90vh]">
        
        {/* Poster */}
        <div className="w-full md:w-72 h-80 md:h-auto bg-neutral-900 shrink-0">
          <img src={item.poster || '/placeholder.png'} className="w-full h-full object-cover" alt={item.title} />
        </div>

        <div className="flex-1 flex flex-col p-8 overflow-y-auto text-left">
          {!showSources ? (
            <>
              {/* Main Info View */}
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white leading-tight">{item.title}</h2>
                  {item.creator && <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">{item.creator}</p>}
                </div>
                <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors p-1"><X size={24} /></button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-black text-white">{item.rating?.toFixed(1)}</span>
                </div>
                {item.genres?.map((genre) => (
                  <span key={genre} className="bg-neutral-900/50 border border-neutral-800 text-neutral-500 text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-[0.15em]">{genre}</span>
                ))}
              </div>

              <div className="mb-8 flex-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-700 mb-3 flex items-center gap-2">
                  <Tag size={10} /> Synopsis
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed font-medium line-clamp-6 md:line-clamp-none">
                  {item.synopsis || "No description available."}
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-neutral-900 flex gap-3">
                <button onClick={onEdit} className="flex-1 py-4 rounded-2xl bg-neutral-900 text-white text-[10px] font-black uppercase tracking-[0.2em] border border-neutral-800 hover:bg-neutral-800 transition-all">
                  Update
                </button>
                <button 
                  onClick={() => setShowSources(true)}
                  className="flex-1 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all"
                >
                  {item.type === 'manga' ? <BookOpen size={16}/> : <Play size={16}/>} Continue
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Source Selector View */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-black text-white uppercase tracking-tighter">Select Source</h2>
                <button onClick={() => setShowSources(false)} className="text-neutral-500 hover:text-white text-[10px] font-black uppercase tracking-widest">Back</button>
              </div>

              <div className="space-y-3 flex-1">
                {sources.map((source) => (
                  <a 
                    key={source.name}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 bg-neutral-900/50 border border-neutral-800 rounded-3xl hover:bg-neutral-800 hover:border-neutral-700 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-neutral-500 group-hover:text-white transition-colors">{source.icon}</div>
                      <span className="text-[11px] font-black text-white uppercase tracking-widest">{source.name}</span>
                    </div>
                    <ExternalLink size={14} className="text-neutral-700 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}