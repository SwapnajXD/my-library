"use client";

import { useMediaStore } from "@/store/mediaStore";
import { useMemo } from "react";
import { TIME_ESTIMATES } from "@/lib/constants";
import { RelationshipGraph } from "./RelationshipGraph";
import { Clock, CheckCircle2, Flame, Tv, Book, Hash, Film, Share2 } from "lucide-react";

export function StatsView() {
  const { media } = useMediaStore();

  const stats = useMemo(() => {
    const total = media.length;
    const completedCount = media.filter(m => m.status === 'completed').length;
    const completionRate = total ? Math.round((completedCount / total) * 100) : 0;
    
    // FIXED: Added toLowerCase() to ensure type comparison works regardless of casing
    const animeItems = media.filter(m => {
      const type = m.type.toLowerCase();
      return type === 'anime' || type === 'tv';
    });
    const mangaItems = media.filter(m => m.type.toLowerCase() === 'manga');
    const movieItems = media.filter(m => m.type.toLowerCase() === 'movie');
    const bookItems = media.filter(m => m.type.toLowerCase() === 'book');

    const totalEpisodes = animeItems.reduce((acc, m) => acc + (m.progress || 0), 0);
    const totalChapters = mangaItems.reduce((acc, m) => acc + (m.progress || 0), 0);
    const totalMovies = movieItems.filter(m => m.status === 'completed').length;
    
    // Time Calculation using centralized constants
    const animeMin = totalEpisodes * (TIME_ESTIMATES.ANIME_EPISODE || 24);
    const mangaMin = totalChapters * (TIME_ESTIMATES.MANGA_CHAPTER || 8);
    const movieMin = totalMovies * (TIME_ESTIMATES.MOVIE_AVG || 120);
    
    const totalMinutes = animeMin + mangaMin + movieMin;
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);

    // Genre Distribution
    const genres: Record<string, number> = {};
    media.forEach(m => m.genres?.forEach(g => {
      genres[g] = (genres[g] || 0) + 1;
    }));
    const topGenres = Object.entries(genres)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { 
      total, 
      completedCount, 
      completionRate, 
      totalEpisodes, 
      totalChapters, 
      totalMovies, 
      days, 
      hours, 
      topGenres 
    };
  }, [media]);

  if (media.length === 0) return (
    <div className="py-20 text-center border border-dashed border-[#1A1A1A] rounded-[40px] bg-black/20">
      <p className="text-[#333] font-black uppercase tracking-[0.6em] text-[11px] italic">VAULT EMPTY</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[32px] hover:border-sky-500 transition-all group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-black border border-[#1A1A1A] rounded-2xl text-sky-500">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-5xl font-black text-white italic tracking-tighter group-hover:text-sky-500 transition-colors">
              {stats.days}D {stats.hours}H
            </h3>
            <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest mt-2">Life Spent</p>
          </div>
        </div>

        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[32px] hover:border-emerald-500 transition-all group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-black border border-[#1A1A1A] rounded-2xl text-emerald-500">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-5xl font-black text-white italic tracking-tighter group-hover:text-emerald-500 transition-colors">
              {stats.completionRate}%
            </h3>
            <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest mt-2">Efficiency</p>
          </div>
        </div>

        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[32px] hover:border-purple-500 transition-all group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-black border border-[#1A1A1A] rounded-2xl text-purple-500">
              <Flame size={20} />
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-5xl font-black text-white italic tracking-tighter group-hover:text-purple-500 transition-colors">
              {stats.total}
            </h3>
            <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest mt-2">Total Vault</p>
          </div>
        </div>
      </div>

      {/* Relationship Graph Integration */}
      <RelationshipGraph />

      {/* Footer Stats Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[40px]">
          <div className="flex items-center gap-3 mb-8">
            <Hash size={16} className="text-sky-500" />
            <h2 className="text-[10px] font-black uppercase text-white tracking-widest">Segment Totals</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Tv, label: 'Episodes', val: stats.totalEpisodes },
              { icon: Book, label: 'Chapters', val: stats.totalChapters },
              { icon: Film, label: 'Movies', val: stats.totalMovies },
              { icon: Flame, label: 'Completed', val: stats.completedCount }
            ].map((stat, i) => (
              <div key={i} className="p-4 bg-black border border-[#1A1A1A] rounded-2xl flex items-center justify-between group/item hover:border-white/20 transition-colors">
                <stat.icon size={14} className="text-[#333] group-hover/item:text-white transition-colors" />
                <div className="text-right">
                  <p className="text-[7px] font-black uppercase text-[#444]">{stat.label}</p>
                  <p className="text-lg font-black italic text-white leading-none">{stat.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[40px]">
          <div className="flex items-center gap-3 mb-8">
            <Share2 size={16} className="text-sky-500" />
            <h2 className="text-[10px] font-black uppercase text-white tracking-widest">Genre Affinity</h2>
          </div>
          <div className="space-y-5">
            {stats.topGenres.map(([genre, count]) => (
              <div key={genre} className="group/genre">
                <div className="flex justify-between text-[9px] font-black uppercase mb-1.5">
                  <span className="text-[#555] group-hover/genre:text-white transition-colors">{genre}</span>
                  <span className="text-white italic">{count} units</span>
                </div>
                <div className="h-1 w-full bg-black rounded-full overflow-hidden border border-[#1A1A1A]">
                  <div 
                    className="h-full bg-white transition-all duration-1000 ease-out" 
                    style={{ width: `${(count / stats.total) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}