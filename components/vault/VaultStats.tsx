"use client";

import { useMediaStore } from "@/store/mediaStore";
import { ProgressBar } from "@/components/ui";

export const VaultStats = () => {
  const { media } = useMediaStore();
  
  // Logic remains same...
  const stats = media.reduce((acc, item) => {
    if (item.status === 'completed') acc.completed += 1;
    if (['watching', 'reading'].includes(item.status)) acc.ongoing += 1;
    return acc;
  }, { completed: 0, ongoing: 0 });

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-20">
      {/* Hero Stat Card */}
      <div className="bg-[#000000] border border-neutral-900 rounded-4xl p-10 flex flex-col items-center">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-700 mb-2">Completion Rate</span>
        <div className="text-7xl font-light tracking-tighter text-white">
          {media.length > 0 ? Math.round((stats.completed / media.length) * 100) : 0}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#050505] border border-neutral-900 rounded-3xl p-8">
          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 block mb-1">Active</span>
          <div className="text-3xl font-medium">{stats.ongoing}</div>
        </div>
        <div className="bg-[#050505] border border-neutral-900 rounded-3xl p-8">
          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 block mb-1">Finished</span>
          <div className="text-3xl font-medium">{stats.completed}</div>
        </div>
      </div>

      {/* Progress Bars Section */}
      <div className="bg-[#000000] border border-neutral-900 rounded-4xl p-10 space-y-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-700">Distribution</h3>
        <div className="space-y-6">
          {['anime', 'manga', 'movie', 'tv', 'book'].map(type => {
            const count = media.filter(m => m.type === type).length;
            if (count === 0) return null;
            return (
              <div key={type} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-neutral-500">{type}</span>
                  <span className="text-white">{count}</span>
                </div>
                <div className="h-0.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                  <div className="h-full bg-neutral-400" style={{ width: `${(count / media.length) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};