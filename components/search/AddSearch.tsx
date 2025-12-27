"use client";

import { useState } from "react";
import { Media, MediaType, MediaStatus } from "@/types";
import { useMediaStore } from "@/store/mediaStore";
import { Search, X, Loader2, Star, Plus, PencilLine, Globe, Image as ImageIcon } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSearch({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<MediaType>("movie");
  const [isManual, setIsManual] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const addMedia = useMediaStore((state) => state.addMedia);

  // Manual Form State
  const [manualTitle, setManualTitle] = useState("");
  const [manualTotal, setManualTotal] = useState(0);
  const [manualPoster, setManualPoster] = useState("");

  const searchMedia = async () => {
    if (!query || isManual) return;
    setLoading(true);
    try {
      let url = "";
      const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

      if (activeTab === "movie" || activeTab === "tv") {
        url = `https://api.themoviedb.org/3/search/${activeTab}?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`;
      } else if (activeTab === "anime" || activeTab === "manga") {
        url = `https://api.jikan.moe/v4/${activeTab}?q=${encodeURIComponent(query)}`;
      } else if (activeTab === "book") {
        url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      let mappedResults = [];
      if (activeTab === "movie" || activeTab === "tv") {
        mappedResults = data.results?.map((item: any) => ({
          id: String(item.id),
          title: item.title || item.name,
          type: activeTab,
          status: "plan_to_watch",
          progress: 0,
          total: activeTab === "tv" ? (item.episode_count || 0) : 1,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
          rating: item.vote_average || 0,
          year: (item.release_date || item.first_air_date || "").split("-")[0],
          synopsis: item.overview,
          genres: [],
        })) || [];
      } else if (activeTab === "anime" || activeTab === "manga") {
        mappedResults = data.data?.map((item: any) => ({
          id: String(item.mal_id),
          title: item.title,
          type: activeTab,
          status: "plan_to_watch",
          progress: 0,
          total: activeTab === "anime" ? (item.episodes || 0) : (item.chapters || 0),
          poster: item.images?.jpg?.large_image_url || "",
          rating: item.score || 0,
          year: item.year || item.published?.prop?.from?.year || "N/A",
          synopsis: item.synopsis,
          creator: item.authors?.[0]?.name || item.studios?.[0]?.name || "Unknown",
          genres: item.genres?.map((g: any) => g.name) || [],
        })) || [];
      } else if (activeTab === "book") {
        mappedResults = data.items?.map((item: any) => ({
          id: item.id,
          title: item.volumeInfo.title,
          type: "book",
          status: "plan_to_watch",
          progress: 0,
          total: item.volumeInfo.pageCount || 0,
          poster: item.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:"),
          rating: item.volumeInfo.averageRating || 0,
          year: (item.volumeInfo.publishedDate || "").split("-")[0],
          synopsis: item.volumeInfo.description,
          creator: item.volumeInfo.authors?.[0] || "Unknown",
          genres: item.volumeInfo.categories || [],
        })) || [];
      }
      setResults(mappedResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = () => {
    if (!manualTitle) return;
    
    const newItem: Media = {
      id: crypto.randomUUID(),
      title: manualTitle,
      type: activeTab,
      status: "plan_to_watch",
      progress: 0,
      total: Number(manualTotal),
      poster: manualPoster || "https://images.unsplash.com/photo-1594908900066-3f47337549d8?q=80&w=2070&auto=format&fit=crop",
      year: new Date().getFullYear(),
      rating: 0,
      synopsis: "Manually added entry.",
      genres: []
    };

    addMedia(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-2xl p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center py-6">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Entry Manager</h2>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white"><X /></button>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setIsManual(false)}
            className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all border ${!isManual ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-500 border-neutral-800'}`}
          >
            <Globe size={14} /> Search Online
          </button>
          <button 
            onClick={() => setIsManual(true)}
            className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all border ${isManual ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-500 border-neutral-800'}`}
          >
            <PencilLine size={14} /> Manual Entry
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-neutral-900 rounded-2xl mb-8">
          {(['movie', 'tv', 'anime', 'manga', 'book'] as MediaType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-neutral-800 text-white shadow-lg" : "text-neutral-600 hover:text-neutral-400"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {!isManual ? (
          /* Search View */
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
              <input
                autoFocus
                type="text"
                placeholder={`Find ${activeTab}...`}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-sky-500 transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchMedia()}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-sky-500" size={32} />
                </div>
              ) : (
                results.map((item) => (
                  <div key={item.id} onClick={() => { addMedia(item); onClose(); }} className="flex gap-6 p-4 bg-neutral-900/40 border border-neutral-900 rounded-[32px] hover:border-neutral-700 transition-all cursor-pointer group">
                    <img src={item.poster} className="w-20 h-28 rounded-xl object-cover shrink-0" alt="" />
                    <div className="flex-1 py-1">
                      <h3 className="font-black text-white uppercase italic group-hover:text-sky-500 transition-colors">{item.title}</h3>
                      <p className="text-[10px] text-neutral-500 uppercase font-bold mt-1">{item.year} • {item.creator || 'Archive'}</p>
                      <p className="text-xs text-neutral-600 line-clamp-2 mt-2">{item.synopsis}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Manual Form View */
          <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 ml-4">Title</label>
              <input 
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Enter title..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-sky-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 ml-4">Total Count (Eps/Chaps)</label>
              <input 
                type="number"
                value={manualTotal}
                onChange={(e) => setManualTotal(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-sky-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 ml-4">Poster URL (Optional)</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                <input 
                  type="text"
                  value={manualPoster}
                  onChange={(e) => setManualPoster(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <button 
              onClick={handleManualAdd}
              className="w-full py-6 bg-sky-500 text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-xl mt-4"
            >
              Add to VAULt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}