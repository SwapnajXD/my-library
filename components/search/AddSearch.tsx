"use client";

import { useState, useEffect } from "react";
import { Media, MediaType } from "@/types";
import { useMediaStore } from "@/store/mediaStore";
import { Search, X, Film, Tv, BookOpen, Loader2, Star, Calendar } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSearch({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<MediaType>("movie");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const addMedia = useMediaStore((state) => state.addMedia);

  const searchMedia = async () => {
    if (!query) return;
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

      // MAPPING LOGIC FOR MISSING METADATA
      let mappedResults = [];

      if (activeTab === "movie" || activeTab === "tv") {
        mappedResults = data.results.map((item: any) => ({
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
          genres: [], // TMDB uses IDs, would require extra fetch for names
        }));
      } else if (activeTab === "anime" || activeTab === "manga") {
        mappedResults = data.data.map((item: any) => ({
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
        }));
      } else if (activeTab === "book") {
        mappedResults = data.items.map((item: any) => ({
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
        }));
      }

      setResults(mappedResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (item: Media) => {
    addMedia(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-2xl p-4 flex flex-col items-center">
      <div className="w-full max-w-3xl flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center py-6">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Find Content</h2>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white"><X /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-neutral-900 rounded-2xl mb-6">
          {(['movie', 'tv', 'anime', 'manga', 'book'] as MediaType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? "bg-white text-black" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
          <input
            autoFocus
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-sky-500 transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchMedia()}
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-4">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest">Searching the archives...</p>
            </div>
          ) : (
            results.map((item) => (
              <div 
                key={item.id}
                className="group flex gap-6 p-4 bg-neutral-900/40 border border-neutral-900 rounded-[32px] hover:border-neutral-700 transition-all cursor-pointer"
                onClick={() => handleAdd(item)}
              >
                <div className="w-24 h-36 rounded-2xl overflow-hidden shrink-0 bg-neutral-800">
                  <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-lg text-white leading-tight uppercase italic group-hover:text-sky-500 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg">
                      <Star size={10} className="fill-yellow-500 text-yellow-500" />
                      <span className="text-[10px] font-bold">{item.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">
                    {item.year} • {item.creator || "Unknown Creator"}
                  </p>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {item.synopsis || "No description available."}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}