"use client";

import { useState, useEffect } from "react";
import { useMediaStore } from "@/store/mediaStore";
import { Media, MediaStatus } from "@/types";
import { X, ChevronUp, ChevronDown, CheckCircle2, Play, BookOpen, Clock, Trash2 } from "lucide-react";

interface Props {
  itemId: string;
  onClose: () => void;
}

export function VaultEditModal({ itemId, onClose }: Props) {
  const { media, updateMedia } = useMediaStore();
  const item = media.find((m) => m.id === itemId);

  const [progress, setProgress] = useState(item?.progress || 0);
  const [status, setStatus] = useState<MediaStatus>(item?.status || "plan_to_watch");

  useEffect(() => {
    if (item) {
      setProgress(item.progress);
      setStatus(item.status);
    }
  }, [item]);

  if (!item) return null;

  const isReading = item.type === 'manga' || item.type === 'book';
  const progressLabel = isReading ? "Chapters Read" : "Episodes Watched";

  const handleSave = () => {
    updateMedia(itemId, { progress, status });
    onClose();
  };

  const handleManualInput = (val: number) => {
    const max = item.total && item.total > 0 ? item.total : 9999;
    const cleanVal = Math.max(0, Math.min(max, val));
    setProgress(cleanVal);
    if (item.total && cleanVal >= item.total) setStatus('completed');
    else if (cleanVal > 0) setStatus(isReading ? 'reading' : 'watching');
    else setStatus('plan_to_watch');
  };

  const statusOptions: { id: MediaStatus; label: string; icon: any }[] = [
    { id: 'plan_to_watch', label: 'Plan', icon: Clock },
    { id: isReading ? 'reading' : 'watching', label: isReading ? 'Live' : 'Watching', icon: isReading ? BookOpen : Play },
    { id: 'completed', label: 'Done', icon: CheckCircle2 },
    { id: 'dropped', label: 'Drop', icon: Trash2 },
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#000000]/95 backdrop-blur-2xl" onClick={onClose}>
      <div 
        className="bg-[#000000] border border-[#1A1A1A] w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 mb-1">Modify System</p>
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter truncate max-w-[200px]">{item.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#444444] hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-10">
          <div className="grid grid-cols-4 gap-2 p-1.5 bg-[#0A0A0A] rounded-2xl border border-[#1A1A1A]">
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                    setStatus(opt.id);
                    if (opt.id === 'completed') setProgress(item.total || 0);
                    if (opt.id === 'plan_to_watch') setProgress(0);
                }}
                className={`flex flex-col items-center gap-2 py-3 rounded-xl transition-all ${
                  status === opt.id ? "bg-[#E5E5E5] text-black scale-[1.05]" : "text-[#444444] hover:text-[#888888]"
                }`}
              >
                <opt.icon size={14} strokeWidth={status === opt.id ? 3 : 2} />
                <span className="text-[7px] font-black uppercase tracking-widest">{opt.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center py-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#222222] mb-8">{progressLabel}</span>
            <div className="flex items-center gap-6">
              <button onClick={() => handleManualInput(progress - 1)} className="w-14 h-14 rounded-full border border-[#1A1A1A] flex items-center justify-center text-[#444444] hover:bg-[#111111] hover:text-white transition-all"><ChevronDown size={24} /></button>
              <div className="flex items-baseline justify-center">
                <input 
                  type="number"
                  value={progress}
                  onChange={(e) => handleManualInput(parseInt(e.target.value) || 0)}
                  className="w-24 bg-transparent text-7xl font-black text-white tracking-tighter italic leading-none text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[#1A1A1A] text-2xl font-black ml-1 uppercase italic">/{item.total || '??'}</span>
              </div>
              <button onClick={() => handleManualInput(progress + 1)} className="w-14 h-14 rounded-full border border-[#1A1A1A] flex items-center justify-center text-[#444444] hover:bg-[#111111] hover:text-white transition-all"><ChevronUp size={24} /></button>
            </div>
          </div>

          <button onClick={handleSave} className="w-full py-6 bg-white text-black rounded-[28px] font-black uppercase text-[10px] tracking-[0.4em] hover:bg-sky-500 hover:text-white transition-all shadow-xl active:scale-95">
            Confirm Sync
          </button>
        </div>
      </div>
    </div>
  );
}