"use client";

import { useState, useMemo } from 'react';
import { searchMedia, UnifiedMediaItem } from '@/services/unifiedApi';
import { useMediaStore } from '@/store/mediaStore';
import { Search, X, Loader2, Plus, ImageOff } from 'lucide-react';
import { MediaType } from '@/types';

interface AddSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="bg-white dark:bg-neutral-950 w-full max-w-2xl h-[80vh] flex flex-col rounded-[32px] border border-neutral-200 dark:border-neutral-900 overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="px-8 py-6 flex justify-between items-center">
          <h2 className="text-xl font-black tracking-tighter uppercase">Search Library</h2>
          <button onClick={onClose} className="p-2 bg-neutral-100 dark:bg-neutral-900 rounded-full text-neutral-500">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-8 pb-4 flex gap-3">
          {(['movie', 'tv', 'anime', 'manga'] as MediaType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setResults([]); }}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div className="px-8 py-4">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              placeholder={`Find ${activeTab}...`} 
              className="w-full pl-12 pr-6 py-4 bg-neutral-100 dark:bg-neutral-900 border-none rounded-2xl outline-none text-sm font-medium focus:ring-1 ring-neutral-400"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-neutral-400" /></div>
          ) : (
            uniqueResults.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-4 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
                onClick={() => {
                  addMedia({...item, rating: 0, status: 'towatch', creator: item.creators?.[0] || 'N/A'});
                  onClose();
                }}
              >
                <div className="w-14 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden shrink-0">
                  {item.poster ? <img src={item.poster} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><ImageOff size={16}/></div>}
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-xs text-neutral-500 mt-1">{item.year || 'Unknown Year'}</p>
                </div>
                <Plus size={18} className="ml-auto self-center text-neutral-300" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}