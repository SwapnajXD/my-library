"use client";

import { useState } from 'react';
import { Media } from '@/types';
import { useMediaStore } from '@/store/mediaStore';
import { X, Plus, Minus } from 'lucide-react';

// 1. Explicitly define the Props interface
interface EditMediaModalProps {
  item: Media;
  onClose: () => void;
}

// 2. Apply the interface to the component
export default function EditMediaModal({ item, onClose }: EditMediaModalProps) {
  const updateMedia = useMediaStore(state => state.updateMedia);
  const [progress, setProgress] = useState(item.progress || 0);

  const handleProgressChange = (val: number) => {
    const max = item.episodes || Infinity;
    if (val < 0) setProgress(0);
    else if (val > max) setProgress(max);
    else setProgress(val);
  };

  const handleSave = () => {
    updateMedia(item.id, { 
      progress: Number(progress),
      status: item.episodes && Number(progress) >= item.episodes ? 'completed' : item.status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 text-left">
      <div className="bg-[#050505] w-full max-w-xs border border-neutral-900 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-neutral-900 flex justify-between items-center">
          <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Tracking</span>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 space-y-8 text-center">
          <div>
            <h3 className="text-white font-bold text-base truncate mb-1">{item.title}</h3>
            <span className="text-[10px] font-black text-yellow-500 uppercase">{item.rating?.toFixed(1)} Rating</span>
          </div>

          <div className="flex items-center justify-between bg-neutral-900/50 rounded-3xl p-2 border border-neutral-800">
            <button 
              type="button"
              onClick={() => handleProgressChange(progress - 1)} 
              className="p-5 bg-neutral-800 rounded-2xl text-white active:scale-90 transition-transform"
            >
              <Minus size={20} />
            </button>
            
            <div className="flex flex-col items-center">
              <input 
                type="number" 
                // Using Tailwind utility to hide number arrows (spinners)
                className="w-20 bg-transparent text-center text-3xl font-black text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={progress}
                onChange={(e) => handleProgressChange(parseInt(e.target.value) || 0)}
              />
              <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-tight">
                / {item.episodes || '??'} {item.type === 'manga' ? 'Ch.' : 'Ep.'}
              </span>
            </div>

            <button 
              type="button"
              onClick={() => handleProgressChange(progress + 1)} 
              className="p-5 bg-white rounded-2xl text-black active:scale-90 transition-transform"
            >
              <Plus size={20} />
            </button>
          </div>

          <button 
            onClick={handleSave} 
            className="w-full py-5 rounded-3xl bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-neutral-200 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}