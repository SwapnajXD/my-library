"use client";

import { useState, useMemo } from 'react';
import { searchMedia, UnifiedMediaItem } from '@/services/unifiedApi';
import { useMediaStore } from '@/store/mediaStore';
import { Search, X, Loader2, Plus, ImageOff, Star } from 'lucide-react';
import { MediaType, MediaStatus } from '@/types';

interface AddSearchProps { isOpen: boolean; onClose: () => void; }

export default function AddSearch({ isOpen, onClose }: AddSearchProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MediaType>('movie');
  const [results, setResults] = useState<UnifiedMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const addMedia = useMediaStore((state) => state.addMedia);

  const uniqueResults = useMemo(() => {
    const map = new Map();
    results.forEach((item) => { if (!map.has(item.id)) map.set(item.id, item); });
    return Array.from(map.values());
  }, [results]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const apiResults = await searchMedia(query, activeTab);
      setResults(apiResults || []);
    } finally { setLoading(false); }
  };

  const handleAddItem = (item: UnifiedMediaItem) => {
    addMedia({
      ...item,
      title: item.title,
      type: activeTab,
      creator: item.creators?.[0] || 'Unknown', 
      status: (activeTab === 'manga' ? 'toread' : 'towatch') as MediaStatus,
      rating: item.rating, // Saves the float (e.g. 8.7)
      progress: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
      <div className="bg-black w-full max-w-2xl h-[80vh] flex flex-col rounded-[40px] border border-neutral-900 overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-8 py-6 flex justify-between items-center border-b border-neutral-900">
          <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-white">Discovery</h2>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-8 pt-6 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {(['movie', 'tv', 'anime', 'manga'] as MediaType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setResults([]); }}
              className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                activeTab === tab ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="px-8 py-4">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              className="w-full pl-14 pr-6 py-5 bg-neutral-900 border-none rounded-3xl outline-none text-sm font-bold text-white"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <Search className="w-5 h-5 text-neutral-700 absolute left-5 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-neutral-800" /></div>
          ) : (
            uniqueResults.map((item: UnifiedMediaItem) => (
              <div 
                key={item.id} 
                className="flex gap-4 p-4 hover:bg-neutral-900/40 rounded-[28px] cursor-pointer group border border-transparent hover:border-neutral-900 transition-all"
                onClick={() => handleAddItem(item)}
              >
                <div className="w-16 h-24 bg-neutral-900 rounded-xl overflow-hidden shrink-0 border border-neutral-800">
                  {item.poster ? <img src={item.poster} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" /> : <div className="flex items-center justify-center h-full"><ImageOff size={20} className="text-neutral-800" /></div>}
                </div>

                <div className="flex flex-col justify-center flex-1">
                  <h4 className="font-bold text-sm text-neutral-200 group-hover:text-white line-clamp-1">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {item.mediaTypeBadge && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-neutral-900 text-neutral-500 font-black uppercase">
                        {item.mediaTypeBadge}
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-600 font-bold uppercase">{item.year || 'N/A'}</span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Star size={10} className="fill-yellow-600 text-yellow-600" />
                      <span className="text-[10px] font-black text-neutral-400">{item.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mt-2">
                    {item.genres?.slice(0, 2).map((g: string) => (
                      <span key={g} className="text-[8px] font-black text-neutral-700 uppercase border border-neutral-900 px-1.5 py-0.5 rounded-md">{g}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 text-neutral-500 group-hover:bg-white group-hover:text-black self-center transition-all"><Plus size={18} /></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}