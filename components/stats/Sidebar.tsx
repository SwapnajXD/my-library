"use client";

import React from "react";
import { X, BookOpen, Activity } from "lucide-react";

export interface MediaItem {
  id: string;
  poster?: string;
  title?: string;
  type?: string;
  status?: string;
  progress?: number;
  total?: number;
  rating?: number;
  synopsis?: string;
  creator?: string;
}

interface Props {
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  items: MediaItem[];
}

export default function Sidebar({ selectedNodeId, setSelectedNodeId, items }: Props) {
  const selectedItem = items.find(m => String(m.id) === String(selectedNodeId));
  const isCreatorNode = selectedNodeId?.startsWith("creator-");
  const creatorName = isCreatorNode ? selectedNodeId?.replace("creator-", "").replace(/-/g, " ") : null;
  const creatorItems = isCreatorNode ? items.filter(m => (m.creator || 'Unknown').toLowerCase() === String(creatorName).toLowerCase()) : [];

  return (
    <div className="w-80 h-screen bg-[#050505]/95 backdrop-blur-xl border-l border-white/10 z-50 animate-in slide-in-from-right duration-300 p-6 overflow-y-auto shrink-0">
      <button onClick={() => setSelectedNodeId(null)} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors z-10">
        <X size={20} />
      </button>

      {selectedItem ? (
        <div className="space-y-6 pt-4">
          <img src={selectedItem.poster} alt="" className="w-full aspect-2/3 object-cover rounded-2xl border border-white/10 shadow-2xl" />
          <div>
            <h2 className="text-xl font-black italic tracking-tighter uppercase leading-tight">{selectedItem.title}</h2>
            <p className="text-sky-500 text-[10px] font-black uppercase tracking-widest mt-1">{selectedItem.type} // {selectedItem.status}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="text-[8px] text-white/30 uppercase font-bold">Progress</p>
              <p className="text-sm font-black italic">{selectedItem.progress} / {selectedItem.total || '∞'}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="text-[8px] text-white/30 uppercase font-bold">Rating</p>
              <p className="text-sm font-black italic text-yellow-500">★ {selectedItem.rating || 'N/A'}</p>
            </div>
          </div>
          <p className="text-xs text-white/50 leading-relaxed font-medium">{selectedItem.synopsis || "No data available in archives."}</p>
        </div>
      ) : isCreatorNode ? (
        <div className="space-y-6 pt-4">
          <div className="w-20 h-20 bg-sky-500/10 border border-sky-500/30 rounded-3xl flex items-center justify-center">
            <BookOpen className="text-sky-500" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black italic tracking-tighter uppercase leading-tight">{creatorName}</h2>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">Primary Creator // {creatorItems.length} Nodes</p>
          </div>
          <div className="space-y-2">
            <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">Contributions</p>
            {creatorItems.map(m => (
              <div key={m.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                <img src={m.poster} className="w-8 h-10 object-cover rounded-md" />
                <p className="text-[10px] font-bold uppercase truncate">{m.title}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
          <Activity size={48} className="mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Select_Node_To_Decrypt</p>
        </div>
      )}
    </div>
  );
}
