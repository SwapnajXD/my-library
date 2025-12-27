"use client";

import { useState } from "react";
import { useMediaStore } from "@/store/mediaStore";
import { Media, MediaStatus } from "@/types";
import { X, ChevronUp, ChevronDown, CheckCircle2, Play, BookOpen, Clock, Trash2 } from "lucide-react";

interface Props {
  itemId: string;
  onClose: () => void;
}

// REMOVED 'default' keyword here
export function VaultEditModal({ itemId, onClose }: Props) {
  const { media, updateMedia } = useMediaStore();
  const item = media.find((m) => m.id === itemId);

  const [progress, setProgress] = useState(item?.progress || 0);
  const [status, setStatus] = useState<MediaStatus>(item?.status || "plan_to_watch");

  if (!item) return null;

  const isReading = item.type === 'manga' || item.type === 'book';
  const progressLabel = isReading ? "Chapters Read" : "Episodes Watched";

  const handleSave = () => {
    updateMedia(itemId, { progress, status });
    onClose();
  };

  const adjustProgress = (amount: number) => {
    const max = item.total && item.total > 0 ? item.total : 9999;
    const newProgress = Math.max(0, Math.min(max, progress + amount));
    setProgress(newProgress);
  };

  const statusOptions: { id: MediaStatus; label: string; icon: any }[] = [
    { id: 'plan_to_watch', label: 'Plan', icon: Clock },
    { id: isReading ? 'reading' : 'watching', label: isReading ? 'Reading' : 'Watching', icon: isReading ? BookOpen : Play },
    { id: 'completed', label: 'Done', icon: CheckCircle2 },
    { id: 'dropped', label: 'Drop', icon: Trash2 },
  ];

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl" onClick={onClose}>
      <div 
        className="bg-neutral-950 border border-neutral-900 w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 mb-1">Modify Progress</p>
            <h2 className="text-xl font-black text-white truncate max-w-62.5 italic uppercase tracking-tighter">{item.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-600 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-10">
          <div className="grid grid-cols-4 gap-2 p-1.5 bg-neutral-900/50 rounded-2xl border border-neutral-900">
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setStatus(opt.id)}
                className={`flex flex-col items-center gap-2 py-3 rounded-xl transition-all ${
                  status === opt.id 
                    ? "bg-white text-black shadow-xl scale-[1.05]" 
                    : "text-neutral-600 hover:text-neutral-300"
                }`}
              >
                <opt.icon size={14} strokeWidth={status === opt.id ? 3 : 2} />
                <span className="text-[7px] font-black uppercase tracking-widest">{opt.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center py-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-700 mb-8">{progressLabel}</span>
            <div className="flex items-center gap-10">
              <button 
                onClick={() => adjustProgress(-1)}
                className="w-16 h-16 rounded-full border border-neutral-900 flex items-center justify-center text-neutral-500 hover:bg-neutral-900 hover:text-white transition-all active:scale-90"
              >
                <ChevronDown size={28} />
              </button>
              <div className="text-center">
                <div className="flex items-baseline justify-center">
                  <span className="text-7xl font-black text-white tracking-tighter italic leading-none">
                    {progress}
                  </span>
                  <span className="text-neutral-800 text-2xl font-black ml-2 uppercase italic">
                    /{item.total || '??'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => adjustProgress(1)}
                className="w-16 h-16 rounded-full border border-neutral-900 flex items-center justify-center text-neutral-500 hover:bg-neutral-900 hover:text-white transition-all active:scale-90"
              >
                <ChevronUp size={28} />
              </button>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-6 bg-sky-500 text-white rounded-[28px] font-black uppercase text-[10px] tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-[0_20px_40px_-15px_rgba(14,165,233,0.3)]"
          >
            Confirm Sync
          </button>
        </div>
      </div>
    </div>
  );
}