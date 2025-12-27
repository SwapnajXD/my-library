"use client";

import { useMediaStore } from "@/store/mediaStore";
import { useMemo, useState } from "react";
import { RelationshipGraph } from "./RelationshipGraph";
import { SidebarDetail } from "./SidebarDetail";
import { Search, Clock, Zap, Target } from "lucide-react";
import { TIME_ESTIMATES } from "@/lib/constants";

export function StatsView() {
  const { media } = useMediaStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // --- NEURAL PROJECTION LOGIC ---
  const projection = useMemo(() => {
    let totalMinutes = 0;

    media.forEach((item) => {
      // Only count items not yet completed
      if (item.status === 'completed') return;

      const remainingUnits = Math.max(0, (item.total || 0) - (item.progress || 0));
      
      switch (item.type.toLowerCase()) {
        case 'anime':
          totalMinutes += remainingUnits * TIME_ESTIMATES.ANIME_EPISODE;
          break;
        case 'tv':
          totalMinutes += remainingUnits * TIME_ESTIMATES.TV_EPISODE;
          break;
        case 'movie':
          // If movie is not completed, it usually means 1 unit remaining
          totalMinutes += remainingUnits * TIME_ESTIMATES.MOVIE_AVG;
          break;
        case 'manga':
          totalMinutes += remainingUnits * TIME_ESTIMATES.MANGA_CHAPTER;
          break;
        case 'book':
          totalMinutes += remainingUnits * TIME_ESTIMATES.BOOK_PAGE;
          break;
      }
    });

    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const mins = Math.round(totalMinutes % 60);

    return { days, hours, mins, raw: totalMinutes };
  }, [media]);

  const stats = useMemo(() => {
    const total = media.length;
    const completed = media.filter(m => m.status === 'completed').length;
    const rate = total ? Math.round((completed / total) * 100) : 0;
    return { total, rate };
  }, [media]);

  const selectedData = useMemo(() => 
    media.find(m => m.id === selectedNodeId), 
  [media, selectedNodeId]);

  return (
    <div className="space-y-6 pb-12 font-mono bg-black text-white">
      
      {/* 1. NEURAL PROJECTION HUD (AMOLED BLACK) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TIME FORECAST CARD */}
        <div className="lg:col-span-2 bg-[#050505] border border-white/5 p-8 rounded-[40px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={80} strokeWidth={1} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Neural_Projection_Time</span>
            </div>
            
            <div className="flex items-baseline gap-6">
              <div className="flex items-baseline gap-2">
                <h3 className="text-6xl font-black italic tracking-tighter">{projection.days}</h3>
                <span className="text-xs font-black text-neutral-600 uppercase tracking-widest">Days</span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-6xl font-black italic tracking-tighter text-neutral-400">{projection.hours}</h3>
                <span className="text-xs font-black text-neutral-600 uppercase tracking-widest">Hrs</span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-6xl font-black italic tracking-tighter text-neutral-700">{projection.mins}</h3>
                <span className="text-xs font-black text-neutral-600 uppercase tracking-widest">Min</span>
              </div>
            </div>
            
            <p className="mt-6 text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] max-w-md">
              Estimated temporal requirement to synchronize all pending data nodes within the current vault.
            </p>
          </div>
        </div>

        {/* COMPLETION RATE HUD */}
        <div className="bg-[#050505] border border-white/5 p-8 rounded-[40px] flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
          <Target className="text-neutral-900 absolute -bottom-4 -left-4" size={120} />
          
          <span className="text-[10px] text-neutral-500 uppercase tracking-[0.4em] mb-2 relative z-10">Efficiency</span>
          <h3 className="text-7xl font-black text-white italic tracking-tighter relative z-10">
            {stats.rate}<span className="text-2xl text-neutral-700">%</span>
          </h3>
          <div className="w-32 h-1 bg-neutral-900 rounded-full mt-4 relative z-10 overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-1000" 
              style={{ width: `${stats.rate}%` }} 
            />
          </div>
        </div>
      </div>

      {/* 2. SECONDARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#050505] border border-white/5 p-6 rounded-[32px] flex items-center justify-between group hover:border-white/10 transition-all">
          <div>
            <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Active_Nodes</p>
            <h3 className="text-3xl font-black text-white italic tracking-tight">{stats.total}</h3>
          </div>
          <Zap size={24} className="text-neutral-800 group-hover:text-white transition-colors" />
        </div>
        
        <div className="bg-[#050505] border border-white/5 p-6 rounded-[32px] flex items-center justify-between group hover:border-white/10 transition-all">
          <div>
            <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Database_Load</p>
            <h3 className="text-3xl font-black text-white italic tracking-tight">
              {(projection.raw / 60).toFixed(1)}<span className="text-sm ml-1 text-neutral-600 tracking-normal">G-Hours</span>
            </h3>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4].map(i => <div key={i} className="w-1 h-6 bg-neutral-800 rounded-full" />)}
          </div>
        </div>
      </div>

      {/* 3. PROJECTION MAP (Existing Graph) */}
      <div className="relative bg-[#000000] border border-white/5 rounded-[48px] h-[600px] overflow-hidden shadow-2xl">
        <div className="absolute top-8 left-8 z-30">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Neural_Map</span>
            <span className="text-[9px] text-neutral-700 uppercase tracking-widest mt-1">Spatial Relationship Visualizer</span>
          </div>
        </div>

        <div className="absolute top-8 right-8 z-30 w-64">
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="FILTER_NODES..."
              className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black tracking-widest uppercase focus:border-white/30 outline-none backdrop-blur-md text-white transition-all"
            />
          </div>
        </div>

        <div className="absolute inset-0 z-10">
          <RelationshipGraph 
            searchQuery={searchQuery}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
          />
        </div>

        {selectedData && (
          <SidebarDetail 
            data={selectedData as any} 
            onClose={() => setSelectedNodeId(null)} 
          />
        )}
      </div>
    </div>
  );
}