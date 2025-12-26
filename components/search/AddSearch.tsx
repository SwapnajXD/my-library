"use client";

import { useState, useMemo } from 'react';
import { searchManga, MediaItem } from '@/services/malApi';

interface AddSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (item: MediaItem) => void;
  onManualAdd: (query: string) => void;
}

export default function AddSearch({ isOpen, onClose, onImport, onManualAdd }: AddSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

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
    setResults([]); 

    const apiResults = await searchManga(query);
    setResults(apiResults);
    
    setLoading(false);
  };

  const handleManualClick = () => {
    onManualAdd(query);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/70 dark:bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl border border-white/20 dark:border-slate-700 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Add to Collection</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Search APIs or add manually</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 rounded-full p-2 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form onSubmit={handleSearch} className="relative group">
            <input 
              type="text" 
              placeholder="Search Books, Manga, Manhwas..." 
              className="w-full pl-12 pr-32 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-lg shadow-inner text-slate-900 dark:text-white"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <svg className="w-6 h-6 text-slate-400 dark:text-slate-500 absolute left-4 top-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            
            <button 
              type="submit" 
              className="absolute right-2 top-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 relative">
          
          {/* State: Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
              <svg className="animate-spin h-8 w-8 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Scanning libraries...</p>
            </div>
          )}

          {/* State: No Results / Initial */}
          {!loading && uniqueResults.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-center">
               <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                 <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               </div>
               <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Start a search above</p>
               <p className="text-sm mt-1">Or add manually below.</p>
             </div>
          )}
          
          {/* State: Results Found */}
          {uniqueResults.map((item) => (
            <div 
              key={item.id} 
              className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all duration-200 group"
              onClick={() => onImport(item)}
            >
              <div className="relative w-20 h-28 shrink-0">
                 <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl blur-sm"></div>
                 <img 
                  src={item.cover} 
                  alt={item.title} 
                  className="relative w-full h-full object-cover rounded-xl shadow-md"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300 uppercase tracking-wide border border-slate-200 dark:border-slate-600">
                    {item.source}
                  </span>
                  <span className="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-md text-xs font-bold border border-amber-100 dark:border-amber-800">★ {item.rating}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{item.authors.join(', ')}</p>
                <div className="text-indigo-500 dark:text-indigo-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Import to Library <span className="text-lg">→</span>
                </div>
              </div>
            </div>
          ))}

          {/* Footer: Manual Entry Option */}
          <div className="mt-auto pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
            <button 
              onClick={handleManualClick}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold hover:border-indigo-400 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Add Manually
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}