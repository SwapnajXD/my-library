"use client";

import { useState, useMemo } from "react";
import { AnalyticsDashboard } from "@/components/stats";
import { useMediaStore } from "@/store/mediaStore";

export default function NeuralMapPage() {
  const media = useMediaStore(s => s.media);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery) return media;
    const q = searchQuery.toLowerCase();
    return media.filter(m => (m.title || '').toLowerCase().includes(q) || (m.creator || '').toLowerCase().includes(q));
  }, [media, searchQuery]);

  const selectedNodeData = useMemo(() => {
    if (!selectedNodeId) return null;
    if (selectedNodeId.startsWith('creator-')) {
      const creatorName = selectedNodeId.replace(/^creator-/, '').replace(/-/g, ' ');
      const children = media.filter(m => (m.creator || 'Unknown').toLowerCase() === creatorName.toLowerCase());
      return { type: 'creator', id: selectedNodeId, label: creatorName, children };
    }
    const found = media.find(m => String(m.id) === String(selectedNodeId));
    if (found) return { type: 'media', item: found };
    return null;
  }, [selectedNodeId, media]);

  return (
    <main className="min-h-screen p-6 bg-black text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black uppercase italic">Neural Map</h1>
          <div className="flex items-center gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="px-4 py-2 rounded-2xl bg-[#050505] border border-[#111] text-sm outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="h-[80vh] rounded-3xl border border-[#111] overflow-hidden">
              <AnalyticsDashboard items={filtered} onSelectNode={(id) => setSelectedNodeId(id)} />
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="p-4 bg-[#050505] border border-[#111] rounded-[20px]">
              <h2 className="text-sm font-black mb-3">Node Details</h2>
              {!selectedNodeData && (
                <div className="text-sm text-neutral-400">No node selected. Click a node on the map to inspect details.</div>
              )}

              {selectedNodeData?.type === 'creator' && (
                <div>
                  <p className="text-xs font-bold uppercase mb-2">Creator</p>
                  <p className="text-sm mb-3">{selectedNodeData.label}</p>
                  <p className="text-xs font-bold uppercase mb-2">Children</p>
                  <div className="space-y-2 max-h-[50vh] overflow-auto">
                    {selectedNodeData.children?.map((c: any) => (
                      <div key={c.id} className="p-2 rounded-lg bg-black border border-[#111]">
                        <p className="text-[13px] font-black">{c.title}</p>
                        <p className="text-[11px] text-neutral-400">{c.type} • {c.year || '—'}</p>
                      </div>
                    )) || <p className="text-xs text-neutral-500">No children</p>}
                  </div>
                </div>
              )}

              {selectedNodeData?.type === 'media' && selectedNodeData.item && (
                <div>
                  <p className="text-xs font-bold uppercase mb-2">Media</p>
                  <div className="flex gap-3">
                    <img src={selectedNodeData.item?.poster || ''} className="w-20 h-28 object-cover rounded" alt="poster" />
                    <div>
                      <h3 className="text-sm font-black">{selectedNodeData.item?.title}</h3>
                      <p className="text-[11px] text-neutral-400">{selectedNodeData.item?.creator}</p>
                      <p className="text-[11px] text-neutral-400 mt-2">{selectedNodeData.item?.year || ''}</p>
                    </div>
                  </div>

                  <div className="mt-4 text-[12px] text-neutral-300 max-h-[30vh] overflow-auto">
                    {selectedNodeData.item.synopsis || <em className="text-neutral-500">No synopsis available.</em>}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
