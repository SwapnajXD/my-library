"use client";

import { useState } from 'react';
import { Media } from '@/types';
import { useMediaStore } from '@/store/mediaStore';
import { X, Plus, Minus, CheckCircle2 } from 'lucide-react';

interface EditMediaModalProps {
  item: Media;
  onClose: () => void;
}

export default function EditMediaModal({ item, onClose }: EditMediaModalProps) {
  const updateMedia = useMediaStore(state => state.updateMedia);
  const [progress, setProgress] = useState(item.progress || 0);
  const [status, setStatus] = useState<Media['status']>(item.status || 'watching');

  const handleProgressChange = (val: number) => {
    const max = item.episodes || Infinity;
    const newProgress = Math.max(0, Math.min(val, max));
    setProgress(newProgress);
    
    // Auto-switch to completed if max reached
    if (item.episodes && newProgress >= item.episodes) {
      setStatus('completed');
    }
  };

  const handleSave = () => {
    updateMedia(item.id, { 
      progress: Number(progress),
      status: status
    });
    onClose();
  };

  const statusOptions: { id: Media['status']; label: string }[] = [
    { id: 'watching', label: 'Watching' },
    { id: 'completed', label: 'Completed' },
    { id: 'plan_to_watch', label: 'Plan' },
  ];

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-[#050505] w-full max-w-xs border border-neutral-900 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-neutral-900 flex justify-between items-center">
          <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Tracking</span>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-8 space-y-6 text-center">
          <div className="text-left">
            <h3 className="text-white font-bold text-base truncate mb-1">{item.title}</h3>
            <span className="text-[10px] font-black text-yellow-500 uppercase">Score: {item.rating?.toFixed(1)}</span>
          </div>

          {/* Status Toggle */}
          <div className="flex bg-neutral-950 p-1 rounded-2xl border border-neutral-900 gap-1">
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setStatus(opt.id)}
                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${
                  status === opt.id ? 'bg-white text-black' : 'text-neutral-600 hover:text-neutral-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Progress Controls */}
          <div className="flex items-center justify-between bg-neutral-900/50 rounded-3xl p-2 border border-neutral-800">
            <button onClick={() => handleProgressChange(progress - 1)} className="p-5 bg-neutral-800 rounded-2xl text-white active:scale-90 transition-transform">
              <Minus size={20} />
            </button>
            <div className="flex flex-col items-center">
              <input 
                type="number" 
                className="w-16 bg-transparent text-center text-3xl font-black text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={progress}
                onChange={(e) => handleProgressChange(parseInt(e.target.value) || 0)}
              />
              <span className="text-[9px] font-bold text-neutral-600 uppercase">/ {item.episodes || '??'}</span>
            </div>
            <button onClick={() => handleProgressChange(progress + 1)} className="p-5 bg-white rounded-2xl text-black active:scale-90 transition-transform">
              <Plus size={20} />
            </button>
          </div>

          <button onClick={handleSave} className="w-full py-5 rounded-3xl bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
            <CheckCircle2 size={14} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}