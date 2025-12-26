"use client";

import { useState, useEffect } from 'react';
import { Media } from '@/types';
import { X, Star, Play, BookOpen, Tag, ExternalLink, Search, Youtube, Globe } from 'lucide-react';

interface MediaModalProps {
  item: Media;
  onClose: () => void;
  onEdit: () => void;
}

export default function MediaModal({ item, onClose, onEdit }: MediaModalProps) {
  const [showSources, setShowSources] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isReadingMaterial = item.type === 'manga' || item.type === 'book';

  const getSpecificSource = () => {
    if (item.type === 'manga') return { name: 'MangaDex', url: `https://mangadex.org/search?q=${encodeURIComponent(item.title)}` };
    if (item.type === 'book') return { name: 'Google Books', url: `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(item.title)}` };
    return { name: 'AnimeKai', url: `https://animekai.to/browser?keyword=${encodeURIComponent(item.title)}` };
  };

  const specificSource = getSpecificSource();
  const sources = [
    { name: 'Google Search', icon: <Search size={18} />, url: `https://www.google.com/search?q=${encodeURIComponent(item.title)}` },
    { name: 'YouTube', icon: <Youtube size={18} />, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title)}+${isReadingMaterial ? 'review' : 'trailer'}` },
    { name: specificSource.name, icon: <Globe size={18} />, url: specificSource.url },
  ];

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="bg-[#050505] w-full max-w-2xl border border-neutral-900 rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-2xl max-h-[90vh]">
        <div className="w-full md:w-72 h-80 md:h-auto bg-neutral-900 shrink-0">
          <img src={item.poster || '/placeholder.png'} className="w-full h-full object-cover" alt="" />
        </div>

        <div className="flex-1 flex flex-col p-8 overflow-y-auto text-left">
          {!showSources ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white leading-tight">{item.title}</h2>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">{item.creator || 'Unknown'}</p>
                </div>
                <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-black text-white">{item.rating?.toFixed(1)}</span>
                </div>
              </div>

              <div className="mb-8 flex-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-700 mb-3 flex items-center gap-2"><Tag size={10} /> Synopsis</h3>
                <p className="text-sm text-neutral-400 leading-relaxed line-clamp-6">{item.synopsis || "No description available."}</p>
              </div>

              <div className="mt-auto pt-6 border-t border-neutral-900 flex gap-3">
                <button onClick={onEdit} className="flex-1 h-14 rounded-2xl bg-neutral-900 text-white text-[10px] font-black uppercase tracking-[0.2em] border border-neutral-800 flex items-center justify-center">
                  Update
                </button>
                <button 
                  onClick={() => setShowSources(true)}
                  className="flex-1 h-14 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 transition-all active:scale-95"
                >
                  <div className="shrink-0">{isReadingMaterial ? <BookOpen size={16}/> : <Play size={16} fill="currentColor"/>}</div>
                  <span className="leading-none mt-px">Continue {isReadingMaterial ? 'Reading' : 'Watching'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-black text-white uppercase tracking-tighter">Select Source</h2>
                <button onClick={() => setShowSources(false)} className="text-neutral-500 hover:text-white text-[10px] font-black uppercase tracking-widest">Back</button>
              </div>
              <div className="space-y-3">
                {sources.map((source) => (
                  <a key={source.name} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-neutral-900/50 border border-neutral-800 rounded-3xl hover:bg-neutral-800 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="text-neutral-500 group-hover:text-white">{source.icon}</div>
                      <span className="text-[11px] font-black text-white uppercase tracking-widest">{source.name}</span>
                    </div>
                    <ExternalLink size={14} className="text-neutral-700 group-hover:text-white" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}