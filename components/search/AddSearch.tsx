"use client";

import { useState, useCallback } from "react";
import { useMediaStore } from "@/store/mediaStore";
import { Search, X, Loader2, Plus } from "lucide-react";

export const AddSearch = ({ onClose }: { onClose: () => void }) => {
  const { addMedia, media } = useMediaStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchMovies = async (q: string) => {
    if (!q || q.length < 3) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${q}`);
      const data = await res.json();
      setResults(data.data || []);
    } catch (err) {
      console.error("Archive Access Denied:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#050505] border border-white/10 rounded-[40px] overflow-hidden flex flex-col max-h-[80vh] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Search Header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <Search className="text-sky-500" size={20} />
          <input 
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-white font-mono uppercase tracking-widest text-sm placeholder:text-white/20"
            placeholder="Search neural archives..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              searchMovies(e.target.value);
            }}
          />
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-sky-500" size={32} />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Syncing with MAL...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((item, index) => {
              // Fix for the mal-None duplicate key error
              const safeId = item.mal_id?.toString() || `fallback-${index}`;
              const alreadyInVault = media.some(m => m.id === safeId);

              return (
                <div 
                  key={`search-res-${safeId}`} 
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                >
                  <img src={item.images.jpg.image_url} alt="" className="w-12 h-16 object-cover rounded-lg bg-white/5 shadow-lg" />
                  <div className="flex-1">
                    <h4 className="text-[11px] font-black text-white uppercase line-clamp-1 tracking-tight">{item.title}</h4>
                    <p className="text-[9px] text-white/40 uppercase tracking-tighter mt-1 italic">
                      {item.type} • {item.year || 'Unknown Date'} • {item.episodes || '?'} EPS
                    </p>
                  </div>
                  
                  <button 
                    disabled={alreadyInVault}
                    onClick={() => {
                      addMedia({
                        id: safeId,
                        title: item.title,
                        poster: item.images.jpg.large_image_url,
                        creator: item.studios?.[0]?.name || "Unknown Studio",
                        type: 'anime',
                        // FIX: Ensure this value exists in your MediaStatus type
                        status: 'backlog', 
                        progress: 0,
                        total: item.episodes || 0,
                        genres: item.genres?.map((g: any) => g.name) || []
                      });
                    }}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      alreadyInVault 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                        : 'bg-white text-black hover:bg-sky-500 hover:text-white active:scale-95'
                    }`}
                  >
                    {alreadyInVault ? 'Stored' : 'Initialize'}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 italic">
                {query.length > 0 ? "No archive matches found" : "Ready for entry input"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};