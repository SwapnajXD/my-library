"use client";

import { useMediaStore } from "@/store/mediaStore";
import { Media } from "@/types";
import { Clock, CheckCircle2, PlayCircle, ListPlus, Book } from "lucide-react";

export default function StatsView() {
  const { media } = useMediaStore();

  const getProgress = (item: Media) => Number(item.progress || 0);

  // --- TIME CALCULATIONS ---
  const watchables = media.filter(m => ['anime', 'tv', 'movie'].includes(m.type));
  const totalEpisodes = watchables.reduce((acc, item) => acc + getProgress(item), 0);
  const watchMinutes = totalEpisodes * 24;

  const readables = media.filter(m => ['manga', 'book'].includes(m.type));
  const totalChapters = readables.reduce((acc, item) => acc + getProgress(item), 0);
  const readMinutes = totalChapters * 1.2;
  
  const totalDays = ((watchMinutes + readMinutes) / 1440).toFixed(1);

  // --- STATUS CATEGORIZATION (FIXED) ---
  
  // Ongoing includes everything currently being consumed (Watching + Reading)
  const ongoingItems = media.filter(m => 
    m.status === 'watching' || 
    m.status === 'reading'
  ).length;

  // Completed includes everything finished
  const completedItems = media.filter(m => m.status === 'completed').length;

  // Planned: Specifically checking for 'plan_to_watch' to match your type definition
  const plannedItems = media.filter(m => m.status === 'plan_to_watch').length;

  const statCards = [
    { label: "Total Days", value: totalDays, icon: Clock, color: "text-blue-500" },
    { label: "Completed", value: completedItems, icon: CheckCircle2, color: "text-green-500" },
    { label: "Ongoing", value: ongoingItems, icon: PlayCircle, color: "text-yellow-500" },
    { label: "Planned", value: plannedItems, icon: ListPlus, color: "text-neutral-500" },
    { label: "Entries", value: media.length, icon: Book, color: "text-white" },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-4xl">
            <stat.icon size={16} className={`${stat.color} mb-4`} />
            <div className="text-2xl font-black tracking-tighter">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Watch Stats Detail */}
        <div className="bg-neutral-900/30 border border-neutral-800 p-8 rounded-[40px]">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-8">Video Time</h3>
          <div className="flex items-end gap-4 mb-2">
            <span className="text-5xl font-black tracking-tighter">{(watchMinutes / 1440).toFixed(1)}</span>
            <span className="text-sm font-bold text-neutral-600 mb-2 italic text-blue-400">DAYS WATCHED</span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Logged across {watchables.length} titles including Anime and TV.
          </p>
        </div>

        {/* Read Stats Detail */}
        <div className="bg-neutral-900/30 border border-neutral-800 p-8 rounded-[40px]">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-8">Reading Time</h3>
          <div className="flex items-end gap-4 mb-2">
            <span className="text-5xl font-black tracking-tighter">{(readMinutes / 1440).toFixed(1)}</span>
            <span className="text-sm font-bold text-neutral-600 mb-2 italic text-green-400">DAYS READ</span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
             Based on {totalChapters} chapters/pages across {readables.length} books and manga.
          </p>
        </div>
      </div>
    </div>
  );
}