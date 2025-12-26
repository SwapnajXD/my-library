"use client";

import { useState, useMemo } from 'react';
import { searchMedia, UnifiedMediaItem } from '@/services/unifiedApi';
import { useMediaStore } from '@/store/mediaStore';
import { Search, X, Plus, Loader2, Star, Edit3, ImageOff } from 'lucide-react';
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

  // Logic: Filter out duplicates from API responses based on ID
  const uniqueResults = useMemo(() => {
    const map = new Map();
    results.forEach((item) => { 
      if (!map.has(item.id)) map.set(item.id, item); 
    });
    return Array.from(map.values());
  }, [results]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults([]); 

    try {
      const apiResults = await searchMedia(query, activeTab);
      setResults(apiResults || []);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (item: UnifiedMediaItem) => {
    addMedia({
      title: item.title,
      type: item.type,
      creator: item.creators?.[0] || 'Unknown',
      poster: item.poster,
      rating: 0,
      status: 'towatch',
      year: item.year ? Number(item.year) : undefined,
      synopsis: item.synopsis || ''
    });
    onClose(); // Close modal after adding
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/70 dark:bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl border border-white/20 dark:border-slate-700 animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Add to Collection</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Search APIs or add manually</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-full p-2 shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-8 pt-4 flex gap-2 bg-white dark:bg-slate-900">
          {(['movie', 'tv', 'anime', 'manga'] as MediaType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setResults([]); }}
              className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form onSubmit={handleSearch} className="relative group">
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              className="w-full pl-12 pr-32 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg text-slate-900 dark:text-white"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button 
              type="submit" 
              className="absolute right-2 top-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md"
            >
              Search
            </button>
          </form>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 className="animate-spin h-10 w-10 text-indigo-500 mb-4" />
              <p className="font-medium">Scanning libraries...</p>
            </div>
          )}

          {!loading && uniqueResults.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center opacity-40">
               <Search size={64} className="mb-4" />
               <p className="text-lg font-bold">Start a search above</p>
               <p className="text-sm">Find your favorite media across all platforms</p>
             </div>
          )}
          
          {uniqueResults.map((item) => (
            <div 
              key={item.id} 
              className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all group active:scale-[0.98]"
              onClick={() => handleImport(item)}
            >
              <div className="relative w-20 h-28 shrink-0 bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden shadow-md">
                {/* FIX: Conditional rendering to prevent empty string src error */}
                {item.poster ? (
                  <img 
                    src={item.poster} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff size={24} className="text-slate-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 uppercase tracking-tighter border border-slate-200 dark:border-slate-600">
                    {item.type}
                  </span>
                  {item.rating > 0 && (
                    <span className="text-amber-500 text-xs font-bold flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> {item.rating}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {item.year || 'Unknown Date'}
                </p>
                <div className="text-indigo-500 dark:text-indigo-400 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">
                  Import <Plus size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Manual Entry */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2">
            <Edit3 size={18} />
            Add Manually to Collection
          </button>
        </div>
      </div>
    </div>
  );
}