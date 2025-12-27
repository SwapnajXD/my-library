"use client";

import { useState } from "react";
import { useMediaStore, type MediaItem, type MediaType } from "@/store/mediaStore";
import { Search, X, Loader2, Star, Plus, PencilLine, Globe, Image as ImageIcon } from "lucide-react";

interface Props {
  onClose: () => void;
}

export const AddSearch = ({ onClose }: Props) => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<MediaType>("Movie");
  const [isManual, setIsManual] = useState(false);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const addMedia = useMediaStore((state) => state.addMedia);

  const [manualTitle, setManualTitle] = useState("");
  const [manualTotal, setManualTotal] = useState(0);
  const [manualPoster, setManualPoster] = useState("");

  const searchMedia = async () => {
    if (!query || isManual) return;
    setLoading(true);
    try {
      let url = "";
      const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const typeLower = activeTab.toLowerCase();

      if (activeTab === "Anime" || activeTab === "Manga") {
        url = `https://api.jikan.moe/v4/${typeLower}?q=${encodeURIComponent(query)}`;
      } else if (activeTab === "Movie" || activeTab === "TV") {
        url = `https://api.themoviedb.org/3/search/${typeLower}?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`;
      } else if (activeTab === "Book") {
        url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      let mappedResults: MediaItem[] = [];

      if (activeTab === "Anime" || activeTab === "Manga") {
        mappedResults = data.data?.map((item: any) => ({
          id: `mal-${item.mal_id}`,
          title: item.title,
          type: activeTab,
          status: "plan_to_watch",
          progress: 0,
          total: activeTab === "Anime" ? (item.episodes || 0) : (item.chapters || 0),
          poster: item.images?.jpg?.large_image_url || "",
          rating: item.score || 0,
          year: item.year || item.published?.prop?.from?.year || "N/A",
          genres: item.genres?.map((g: any) => g.name) || [],
          creator: item.authors?.[0]?.name || item.studios?.[0]?.name || "Unknown",
          synopsis: item.synopsis
        })) || [];
      } else if (activeTab === "Movie" || activeTab === "TV") {
        mappedResults = data.results?.map((item: any) => ({
          id: `tmdb-${item.id}`,
          title: item.title || item.name,
          type: activeTab,
          status: "plan_to_watch",
          progress: 0,
          total: 0,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
          rating: item.vote_average || 0,
          year: (item.release_date || item.first_air_date || "").split("-")[0],
          genres: [],
          creator: "Studio",
          synopsis: item.overview
        })) || [];
      } else if (activeTab === "Book") {
        mappedResults = data.items?.map((item: any) => ({
          id: `book-${item.id}`,
          title: item.volumeInfo.title,
          type: "Book",
          status: "plan_to_watch",
          progress: 0,
          total: item.volumeInfo.pageCount || 0,
          poster: item.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:"),
          rating: item.volumeInfo.averageRating || 0,
          year: (item.volumeInfo.publishedDate || "").split("-")[0],
          genres: item.volumeInfo.categories || [],
          creator: item.volumeInfo.authors?.[0] || "Unknown",
          synopsis: item.volumeInfo.description
        })) || [];
      }

      // --- THE FIX: FILTER FOR UNIQUE IDS ---
      const uniqueResults = mappedResults.filter(
        (value, index, self) => index === self.findIndex((t) => t.id === value.id)
      );

      setResults(uniqueResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = () => {
    if (!manualTitle) return;
    const newItem: MediaItem = {
      id: crypto.randomUUID(),
      title: manualTitle,
      type: activeTab,
      status: "plan_to_watch",
      progress: 0,
      total: Number(manualTotal),
      poster: manualPoster || "https://images.unsplash.com/photo-1594908900066-3f47337549d8?q=80&w=2070&auto=format&fit=crop",
      year: new Date().getFullYear(),
      rating: 0,
      genres: [],
      creator: "Manual Entry"
    };
    addMedia(newItem);
    onClose();
  };

  return (
    <div className="bg-[#050505] w-full max-w-2xl flex flex-col h-[85vh] rounded-[48px] border border-neutral-900 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
      <div className="p-8 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Vault Link</h2>
          <button onClick={onClose} className="p-3 bg-neutral-900 text-neutral-500 hover:text-white rounded-2xl transition-all"><X size={20}/></button>
        </div>

        <div className="flex gap-2 mb-6 bg-neutral-950 p-1.5 rounded-3xl border border-neutral-900 overflow-x-auto no-scrollbar shrink-0">
          {(['Movie', 'TV', 'Anime', 'Manga', 'Book'] as MediaType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setResults([]); }}
              className={`flex-1 min-w-[80px] py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-black shadow-xl" : "text-neutral-600 hover:text-neutral-400"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {!isManual ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="relative mb-6 shrink-0">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
              <input
                autoFocus
                type="text"
                placeholder={`Query ${activeTab} Records...`}
                className="w-full bg-neutral-950 border border-neutral-900 rounded-3xl py-5 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-sky-500 transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchMedia()}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-sky-500" size={32} />
                </div>
              ) : (
                results.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => { addMedia(item); onClose(); }} 
                    className="flex gap-5 p-4 bg-neutral-950 border border-neutral-900 rounded-[28px] hover:border-sky-500 hover:bg-neutral-900 transition-all cursor-pointer group"
                  >
                    <img src={item.poster} className="w-16 h-24 rounded-xl object-cover shrink-0" alt="" />
                    <div className="flex-1">
                      <h3 className="font-black text-white uppercase italic text-sm group-hover:text-sky-400 transition-colors">{item.title}</h3>
                      <p className="text-[9px] text-neutral-600 uppercase font-black tracking-widest mt-1">{item.year} • {item.creator}</p>
                      <div className="flex items-center gap-1 mt-3 text-sky-500">
                        <Star size={10} className="fill-current" />
                        <span className="text-[10px] font-black">{item.rating}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-700 ml-4">Identifier / Title</label>
              <input 
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="ENTRY NAME"
                className="w-full bg-neutral-950 border border-neutral-900 rounded-2xl py-4 px-6 text-white focus:border-sky-500 transition-all uppercase font-bold text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-700 ml-4">Unit Count</label>
                 <input 
                   type="number"
                   value={manualTotal}
                   onChange={(e) => setManualTotal(Number(e.target.value))}
                   className="w-full bg-neutral-950 border border-neutral-900 rounded-2xl py-4 px-6 text-white focus:border-sky-500 transition-all"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-700 ml-4">Category</label>
                 <select 
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value as MediaType)}
                    className="w-full bg-neutral-950 border border-neutral-900 rounded-2xl py-4 px-6 text-white focus:border-sky-500 transition-all appearance-none"
                 >
                    <option value="Movie">MOVIE</option>
                    <option value="TV">TV</option>
                    <option value="Anime">ANIME</option>
                    <option value="Manga">MANGA</option>
                    <option value="Book">BOOK</option>
                 </select>
               </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-700 ml-4">Visual Link (Poster)</label>
              <div className="relative">
                <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-700" size={16} />
                <input 
                  type="text"
                  value={manualPoster}
                  onChange={(e) => setManualPoster(e.target.value)}
                  placeholder="HTTPS://IMAGE-PATH"
                  className="w-full bg-neutral-950 border border-neutral-900 rounded-2xl py-4 pl-14 pr-6 text-white focus:border-sky-500 transition-all text-xs"
                />
              </div>
            </div>
            <button onClick={handleManualAdd} className="w-full py-6 bg-white text-black rounded-[32px] font-black uppercase text-[11px] tracking-[0.4em] hover:bg-sky-500 hover:text-white transition-all">Initialize Entry</button>
          </div>
        )}

        <div className="mt-6 flex justify-center shrink-0">
            <button onClick={() => setIsManual(!isManual)} className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 hover:text-white transition-colors">
                {isManual ? "Switch to Search" : "Switch to Manual"}
            </button>
        </div>
      </div>
    </div>
  );
}