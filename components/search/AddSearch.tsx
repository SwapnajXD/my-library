"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMediaStore, type MediaItem, type MediaType } from "@/store/mediaStore";
import { searchMedia } from "@/services"; 
import { 
  Search, 
  X, 
  Loader2, 
  Star, 
  Plus, 
  ChevronDown,
  Image as ImageIcon,
  Check,
  Zap,
  Command
} from "lucide-react";

interface Props {
  onClose: () => void;
}

const CATEGORIES: MediaType[] = ["Movie", "TV", "Anime", "Manga", "Book"];

export const AddSearch = ({ onClose }: Props) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MediaType>("Movie");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const addMedia = useMediaStore((state) => state.addMedia);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const executeSearch = useCallback(async (searchQuery: string, searchCat: MediaType) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchMedia(searchQuery, searchCat.toLowerCase() as any);
      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(query, category);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, category, executeSearch]);

  const handleAdd = (item: any) => {
    const newItem: MediaItem = {
      ...item,
      type: category,
      status: 'plan_to_watch',
      progress: 0,
    };
    addMedia(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Ultra Dark Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl bg-black border border-white/5 rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className="p-8 pb-6 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Command size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Neural_Search</span>
                <span className="text-[9px] text-neutral-600 uppercase tracking-widest mt-0.5">Global Database Sync Active</span>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="group p-3 rounded-full bg-neutral-900/50 hover:bg-white hover:text-black transition-all duration-300"
            >
              <X size={16} />
            </button>
          </div>

          {/* MAIN INPUT GROUP */}
          <div className="group relative flex items-center bg-[#0A0A0A] border border-white/5 rounded-[28px] p-2 focus-within:border-white/20 focus-within:bg-neutral-900/20 transition-all duration-500">
            
            <div className="relative flex-1">
              <Search 
                className={`absolute left-5 top-1/2 -translate-y-1/2 transition-all duration-500 ${loading ? 'text-white rotate-90' : 'text-neutral-700'}`} 
                size={18} 
              />
              <input 
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Query database..."
                className="w-full bg-transparent border-none py-4 pl-14 pr-4 text-white text-sm font-medium outline-none placeholder:text-neutral-800 tracking-tight"
              />
            </div>

            <div className="w-px h-8 bg-white/5 mx-2" />

            {/* REFINED CUSTOM DROPDOWN */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-4 bg-white/5 hover:bg-white/10 px-6 py-3.5 rounded-[20px] transition-all min-w-[150px] group/btn border border-white/5"
              >
                <span className="text-[10px] font-black tracking-[0.25em] uppercase text-neutral-400 group-hover/btn:text-white transition-colors">
                  {category}
                </span>
                <ChevronDown size={14} className={`text-neutral-600 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-[#0A0A0A] border border-white/10 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,1)] py-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-3xl">
                  <div className="px-5 pb-2 mb-2 border-b border-white/5">
                    <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em]">Select_Node_Type</span>
                  </div>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white hover:bg-white/[0.03] transition-all group/item"
                    >
                      {cat}
                      {category === cat ? (
                        <Check size={12} className="text-white" />
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-transparent group-hover/item:bg-white/20 transition-all" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RESULTS AREA */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar min-h-[400px]">
          {loading && results.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-6 py-20">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center">
                  <Loader2 className="text-white animate-spin-slow" size={24} strokeWidth={1} />
                </div>
                <div className="absolute inset-0 border border-white/20 rounded-full animate-ping opacity-20" />
              </div>
              <p className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.5em] animate-pulse">Syncing_Neural_Network</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {results.map((item, index) => (
                <div 
                  key={`${item.id}-${index}`}
                  className="group flex items-center gap-6 p-4 bg-white/[0.01] border border-white/[0.03] rounded-[32px] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 cursor-pointer"
                  onClick={() => handleAdd(item)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative w-20 h-28 rounded-2xl overflow-hidden bg-black shrink-0 shadow-2xl">
                    <img 
                      src={item.poster} 
                      alt="" 
                      className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[8px] font-black bg-white/5 border border-white/5 px-2.5 py-1 rounded-full text-neutral-400 uppercase tracking-widest">{category}</span>
                      <span className="text-[9px] font-bold text-neutral-700 tracking-tighter">{item.year}</span>
                    </div>
                    <h4 className="text-xl font-black text-white/80 truncate uppercase italic tracking-tighter leading-tight group-hover:text-white transition-colors duration-300">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-5 mt-3">
                      <div className="flex items-center gap-2">
                        <Star size={12} className="text-neutral-700 group-hover:text-white group-hover:fill-white transition-all" />
                        <span className="text-[10px] font-black text-neutral-500">{item.rating || '0.0'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap size={10} className="text-neutral-800" />
                        <span className="text-[9px] text-neutral-700 uppercase tracking-widest font-bold truncate">ID: {item.creator.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-14 h-14 rounded-3xl bg-neutral-900 flex items-center justify-center text-neutral-600 group-hover:bg-white group-hover:text-black group-hover:rotate-90 transition-all duration-500 ease-in-out">
                    <Plus size={24} strokeWidth={1.5} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-24 opacity-[0.03] grayscale">
              <Command size={100} strokeWidth={0.5} className="text-white animate-pulse" />
              <p className="mt-8 text-[12px] font-black uppercase tracking-[1em] text-white">System_Idle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};