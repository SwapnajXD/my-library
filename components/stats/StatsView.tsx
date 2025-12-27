"use client";

import { useMediaStore } from "@/store/mediaStore";
import { useMemo, useState } from "react";
import { RelationshipGraph } from "./RelationshipGraph";
import { SidebarDetail } from "./SidebarDetail";
import { Search } from "lucide-react";

export function StatsView() {
  const { media } = useMediaStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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
    <div className="space-y-6 pb-12 font-mono">
      {/* 1. METRICS HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#050505] border border-white/5 p-6 rounded-[24px]">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Total_Nodes</p>
          <h3 className="text-3xl font-black text-white italic">{stats.total}</h3>
        </div>
        <div className="bg-[#050505] border border-white/5 p-6 rounded-[24px]">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Completion_Rate</p>
          <h3 className="text-3xl font-black text-sky-500 italic">{stats.rate}%</h3>
        </div>
      </div>

      {/* 2. PROJECTION MAP CONTAINER */}
      <div className="relative bg-[#010101] border border-white/10 rounded-[40px] h-[750px] overflow-hidden shadow-2xl">
        
        {/* TOP RIGHT: SEARCH BAR */}
        <div className="absolute top-6 right-6 z-30 w-64 sm:w-80">
          <div className="relative group">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-sky-500 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="FILTER_DATABASE..."
              className="w-full bg-black/80 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[10px] font-black tracking-widest uppercase focus:border-sky-500/50 outline-none backdrop-blur-xl text-white shadow-2xl"
            />
          </div>
        </div>

        {/* THE GRAPH */}
        <div className="absolute inset-0 z-10">
          <RelationshipGraph 
            searchQuery={searchQuery}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
          />
        </div>

        {/* SIDEBAR (Slides in over the graph) */}
        <SidebarDetail 
          data={selectedData} 
          onClose={() => setSelectedNodeId(null)} 
        />
      </div>
    </div>
  );
}