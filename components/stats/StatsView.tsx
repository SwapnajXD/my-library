"use client";

import { useMediaStore } from "@/store/mediaStore";
import { useMemo } from "react";
import { BarChart3, PieChart, Clock, CheckCircle2, Flame, Tv, Book, Hash } from "lucide-react";

export function StatsView() {
  const { media } = useMediaStore();

  const stats = useMemo(() => {
    const total = media.length;
    const completed = media.filter(m => m.status === 'completed').length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    
    const animeItems = media.filter(m => m.type === 'anime');
    const mangaItems = media.filter(m => m.type === 'manga' || m.type === 'book');

    const totalEpisodes = animeItems.reduce((acc, m) => acc + (m.progress || 0), 0);
    const totalChapters = mangaItems.reduce((acc, m) => acc + (m.progress || 0), 0);

    // Time Calculation: 
    // Anime: ~24 mins per episode | Manga: ~10 mins per chapter
    const animeMinutes = totalEpisodes * 24;
    const mangaMinutes = totalChapters * 10;
    const totalMinutes = animeMinutes + mangaMinutes;

    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);

    // Genre Distribution
    const genres: Record<string, number> = {};
    media.forEach(m => {
      m.genres?.forEach(g => {
        genres[g] = (genres[g] || 0) + 1;
      });
    });
    const topGenres = Object.entries(genres)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { 
      total, 
      completed, 
      completionRate, 
      totalEpisodes, 
      totalChapters, 
      days, 
      hours, 
      topGenres 
    };
  }, [media]);

  if (media.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-[#1A1A1A] rounded-[40px]">
        <p className="text-[#1A1A1A] font-black uppercase tracking-[0.6em] text-[11px] italic">NO DATA TO ANALYZE</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Time & Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[32px] flex flex-col justify-between hover:border-sky-500/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-black border border-[#1A1A1A] rounded-2xl text-sky-500"><Clock size={20} /></div>
            <span className="text-[10px] font-black text-[#222222] uppercase tracking-widest">Time Invested</span>
          </div>
          <div className="mt-8">
            <h3 className="text-5xl font-black text-white italic tracking-tighter">
              {stats.days}<span className="text-xl text-[#222222] not-italic ml-2">D</span> {stats.hours}<span className="text-xl text-[#222222] not-italic ml-2">H</span>
            </h3>
            <p className="text-[10px] font-bold text-[#444444] uppercase tracking-[0.2em] mt-2">Life Consumption Protocol</p>
          </div>
        </div>

        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[32px] flex flex-col justify-between hover:border-sky-500/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-black border border-[#1A1A1A] rounded-2xl text-emerald-500"><CheckCircle2 size={20} /></div>
            <span className="text-[10px] font-black text-[#222222] uppercase tracking-widest">Efficiency</span>
          </div>
          <div className="mt-8">
            <h3 className="text-5xl font-black text-white italic tracking-tighter">{stats.completionRate}%</h3>
            <p className="text-[10px] font-bold text-[#444444] uppercase tracking-[0.2em] mt-2">Database Cleanliness</p>
          </div>
        </div>

        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[32px] flex flex-col justify-between hover:border-sky-500/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-black border border-[#1A1A1A] rounded-2xl text-purple-500"><Flame size={20} /></div>
            <span className="text-[10px] font-black text-[#222222] uppercase tracking-widest">Total Units</span>
          </div>
          <div className="mt-8">
            <h3 className="text-5xl font-black text-white italic tracking-tighter">{stats.total}</h3>
            <p className="text-[10px] font-bold text-[#444444] uppercase tracking-[0.2em] mt-2">Active Entries</p>
          </div>
        </div>
      </div>

      {/* Volume Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Counts */}
        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[40px]">
          <div className="flex items-center gap-3 mb-8">
            <Hash size={16} className="text-sky-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Volume Totals</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-black/40 border border-[#1A1A1A] rounded-2xl">
              <div className="flex items-center gap-4">
                <Tv size={18} className="text-[#444444]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white">Episodes Logged</p>
              </div>
              <span className="text-2xl font-black italic text-sky-500">{stats.totalEpisodes}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-black/40 border border-[#1A1A1A] rounded-2xl">
              <div className="flex items-center gap-4">
                <Book size={18} className="text-[#444444]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white">Chapters Logged</p>
              </div>
              <span className="text-2xl font-black italic text-sky-500">{stats.totalChapters}</span>
            </div>
          </div>
        </div>

        {/* Genre Affinity */}
        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[40px]">
          <div className="flex items-center gap-3 mb-8">
            <PieChart size={16} className="text-sky-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Genre Affinity</h2>
          </div>
          <div className="space-y-5">
            {stats.topGenres.map(([genre, count]) => (
              <div key={genre}>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                  <span className="text-[#444444]">{genre}</span>
                  <span className="text-white">{count}</span>
                </div>
                <div className="h-1 w-full bg-black rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-1000" 
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