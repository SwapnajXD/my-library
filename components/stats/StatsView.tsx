"use client";

import { useMediaStore } from "@/store/mediaStore";
import { useMemo } from "react";
import { BarChart3, PieChart, Clock, CheckCircle2, Flame, Tv, Book } from "lucide-react";

export function StatsView() {
  const { media } = useMediaStore();

  const stats = useMemo(() => {
    const total = media.length;
    const completed = media.filter(m => m.status === 'completed').length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    
    const animeCount = media.filter(m => m.type === 'anime').length;
    const mangaCount = media.filter(m => m.type === 'manga').length;
    
    // Calculate total progress units (Episodes/Chapters)
    const totalProgress = media.reduce((acc, m) => acc + (m.progress || 0), 0);

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

    return { total, completed, completionRate, animeCount, mangaCount, totalProgress, topGenres };
  }, [media]);

  if (media.length === 0) {
    return (
      <div className="py-32 text-center border border-dashed border-[#1A1A1A] rounded-[40px]">
        <p className="text-[#1A1A1A] font-black uppercase tracking-[0.6em] text-[11px] italic">NO DATA TO ANALYZE</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[32px] flex flex-col justify-between group hover:border-sky-500/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-black border border-[#1A1A1A] rounded-2xl text-sky-500"><Flame size={20} /></div>
            <span className="text-[10px] font-black text-[#222222] uppercase tracking-widest">Efficiency</span>
          </div>
          <div className="mt-8">
            <h3 className="text-5xl font-black text-white italic tracking-tighter">{stats.completionRate}%</h3>
            <p className="text-[10px] font-bold text-[#444444] uppercase tracking-[0.2em] mt-2 text-sky-500">Completion Protocol</p>
          </div>
        </div>

        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[32px] flex flex-col justify-between group hover:border-sky-500/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-black border border-[#1A1A1A] rounded-2xl text-emerald-500"><CheckCircle2 size={20} /></div>
            <span className="text-[10px] font-black text-[#222222] uppercase tracking-widest">Archived</span>
          </div>
          <div className="mt-8">
            <h3 className="text-5xl font-black text-white italic tracking-tighter">{stats.completed}</h3>
            <p className="text-[10px] font-bold text-[#444444] uppercase tracking-[0.2em] mt-2">Finished Units</p>
          </div>
        </div>

        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[32px] flex flex-col justify-between group hover:border-sky-500/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-black border border-[#1A1A1A] rounded-2xl text-purple-500"><Clock size={20} /></div>
            <span className="text-[10px] font-black text-[#222222] uppercase tracking-widest">Total Volume</span>
          </div>
          <div className="mt-8">
            <h3 className="text-5xl font-black text-white italic tracking-tighter">{stats.totalProgress}</h3>
            <p className="text-[10px] font-bold text-[#444444] uppercase tracking-[0.2em] mt-2">Logged Segments</p>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Type Distribution */}
        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[40px]">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 size={16} className="text-sky-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Media Type Logic</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black border border-[#1A1A1A] rounded-xl flex items-center justify-center text-white"><Tv size={16} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">Motion Pictures</p>
                  <p className="text-[9px] font-bold text-[#444444]">Anime / Series</p>
                </div>
              </div>
              <span className="text-xl font-black italic">{stats.animeCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black border border-[#1A1A1A] rounded-xl flex items-center justify-center text-white"><Book size={16} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">Written Records</p>
                  <p className="text-[9px] font-bold text-[#444444]">Manga / Books</p>
                </div>
              </div>
              <span className="text-xl font-black italic">{stats.mangaCount}</span>
            </div>
          </div>
        </div>

        {/* Top Genres */}
        <div className="bg-[#050505] border border-[#1A1A1A] p-8 rounded-[40px]">
          <div className="flex items-center gap-3 mb-8">
            <PieChart size={16} className="text-sky-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Genre Frequency</h2>
          </div>
          <div className="space-y-4">
            {stats.topGenres.map(([genre, count]) => (
              <div key={genre} className="group">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                  <span className="text-[#444444] group-hover:text-white transition-colors">{genre}</span>
                  <span className="text-white">{count}</span>
                </div>
                <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-[#1A1A1A]">
                  <div 
                    className="h-full bg-sky-500 transition-all duration-1000" 
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