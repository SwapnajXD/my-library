"use client";

import { useState, useMemo } from 'react';
import { useMediaStore } from '@/store/mediaStore';
import { searchExternalMedia } from '@/services/mediaApi';
import { Search, X, Loader2, Plus, ImageOff, Star, BookOpen } from 'lucide-react';
import { MediaType, MediaStatus, Media } from '@/types';

interface AddSearchProps { 
  isOpen: boolean; 
  onClose: () => void; 
}

export default function AddSearch({ isOpen, onClose }: AddSearchProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MediaType>('movie');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const addMedia = useMediaStore((state) => state.addMedia);

  const normalizedResults = useMemo(() => {
    const map = new Map();
    
    results.forEach((item) => {
      let normalized: Partial<Media> = {};

      if (item.mal_id) {
        normalized = {
          id: `mal-${item.mal_id}`,
          title: item.title,
          poster: item.images?.jpg?.large_image_url || '',
          rating: item.score || 0,
          year: item.aired?.prop?.from?.year || item.published?.prop?.from?.year || 'N/A',
          total: item.episodes || item.chapters || 0,
        };
      } 
      else if (item.vote_count !== undefined) {
        normalized = {
          id: `tmdb-${item.id}`,
          title: item.title || item.name,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
          rating: item.vote_average || 0,
          year: (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A',
        };
      }
      else if (item.key) {
        normalized = {
          id: `ol-${item.key.replace('/works/', '')}`,
          title: item.title,
          poster: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : '',
          rating: item.ratings_average ? item.ratings_average * 2 : 0,
          year: item.first_publish_year || 'N/A',
          creator: item.author_name?.[0] || 'Unknown Author',
        };
      }

      if (normalized.id && !map.has(normalized.id)) map.set(normalized.id, normalized);
    });
    return Array.from(map.values());
  }, [results]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const apiResults = await searchExternalMedia(query, activeTab);
    setResults(apiResults);
    setLoading(false);
  };

  const handleAddItem = (item: any) => {
    const isPrintMedia = activeTab === 'manga' || activeTab === 'book';
    addMedia({
      ...item,
      type: activeTab,
      status: 'plan_to_watch', 
      progress: 0,
      total: item.total || item.episodes || item.chapters || 0,
    });
    onClose();
  };

  const tabs: MediaType[] = ['movie', 'tv', 'anime', 'manga', 'book'];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4" onClick={onClose}>
      <div className="bg-black w-full max-w-2xl h-[85vh] flex flex-col rounded-[40px] border border-neutral-900 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        
        <div className="px-8 py-6 flex justify-between items-center border-b border-neutral-900">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-neutral-900 rounded-lg text-white"><BookOpen size={14}/></div>
             <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-white">The Discovery</h2>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="px-8 pt-6 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setResults([]); setQuery(''); }}
              className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                activeTab === tab ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="px-8 py-4">
          <form onSubmit={handleSearch} className="relative">
            <input 
              autoFocus
              placeholder={`Search for a ${activeTab}...`} 
              className="w-full pl-14 pr-6 py-5 bg-neutral-900 border-none rounded-3xl outline-none text-sm font-bold text-white placeholder:text-neutral-700"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <Search className="w-5 h-5 text-neutral-700 absolute left-5 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-neutral-800" /></div>
          ) : (
            normalizedResults.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-4 p-4 hover:bg-neutral-900/40 rounded-[28px] cursor-pointer group border border-transparent hover:border-neutral-900 transition-all"
                onClick={() => handleAddItem(item)}
              >
                <div className="w-16 h-24 bg-neutral-900 rounded-xl overflow-hidden shrink-0 border border-neutral-800">
                  {item.poster ? (
                    <img src={item.poster} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" alt={item.title} />
                  ) : (
                    <div className="flex items-center justify-center h-full"><ImageOff size={20} className="text-neutral-800" /></div>
                  )}
                </div>

                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-neutral-200 group-hover:text-white line-clamp-1">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-neutral-600 font-bold uppercase">{item.year}</span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Star size={10} className="fill-yellow-600 text-yellow-600" />
                      <span className="text-[10px] font-black text-neutral-400">{item.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                  {item.creator && <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tighter mt-1 truncate">{item.creator}</p>}
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 text-neutral-500 group-hover:bg-white group-hover:text-black self-center transition-all shrink-0">
                  <Plus size={18} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}