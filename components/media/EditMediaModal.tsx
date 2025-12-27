"use client";

import { useEffect } from 'react';
import { useMediaStore } from '@/store/mediaStore';
import { Minus, Plus, X, Bookmark } from 'lucide-react';
import { MediaStatus } from '@/types';

interface EditMediaModalProps {
  itemId: string;
  onClose: () => void;
}

export default function EditMediaModal({ itemId, onClose }: EditMediaModalProps) {
  const item = useMediaStore((state) => state.media.find((m) => m.id === itemId));
  const updateMedia = useMediaStore((state) => state.updateMedia);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation(); 
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!item) return null;

  const isReading = item.type === 'book' || item.type === 'manga';
  
  // @ts-ignore
  const rawTotal = item.total || item.episodes || 0;
  const totalVal = Number(rawTotal);
  const currentProgress = Number(item.progress || 0);

  const handleProgressUpdate = (newVal: number) => {
    let correctedVal = Math.max(0, newVal);
    
    if (totalVal > 0 && correctedVal >= totalVal) {
      updateMedia(item.id, { progress: totalVal, status: 'completed' as MediaStatus });
      return;
    }

    const shouldRevertStatus = item.status === 'completed' && totalVal > 0 && correctedVal < totalVal;
    
    updateMedia(item.id, { 
      progress: correctedVal,
      ...(shouldRevertStatus && { status: (isReading ? 'reading' : 'watching') as MediaStatus })
    });
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0A0A0A] w-full max-w-md rounded-[40px] border border-neutral-900 p-10 shadow-3xl text-center">
        <div className="flex justify-between items-center mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Tracking</span>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={20}/>
          </button>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{item.title}</h3>
        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-10 text-neutral-500">
          {isReading ? 'Chapter' : 'Episode'} <span className="text-white">{currentProgress}</span> 
          {totalVal > 0 ? ` / ${totalVal}` : ''}
        </p>

        {/* Counter Controls */}
        <div className="flex items-center justify-center gap-6 mb-12">
          <button 
            type="button"
            onClick={() => handleProgressUpdate(currentProgress - 1)} 
            className="p-5 bg-neutral-900 rounded-3xl text-neutral-400 hover:text-white active:scale-90 transition-all"
          >
            <Minus size={24} />
          </button>
          
          <input 
            type="number"
            value={currentProgress === 0 ? "" : currentProgress}
            placeholder="0"
            onChange={(e) => handleProgressUpdate(Number(e.target.value))}
            className="w-32 bg-transparent text-6xl font-black text-white text-center focus:outline-none"
          />

          <button 
            type="button"
            onClick={() => handleProgressUpdate(currentProgress + 1)} 
            className="p-5 bg-white text-black rounded-3xl hover:bg-neutral-200 active:scale-90 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* --- STATUS SELECTION (Now with Planned) --- */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-black rounded-2xl border border-neutral-900">
          <button 
            onClick={() => updateMedia(item.id, { status: 'plan_to_watch' })}
            className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              item.status === 'plan_to_watch' ? 'bg-neutral-800 text-white shadow-lg' : 'text-neutral-600'
            }`}
          >
            Planned
          </button>
          
          <button 
            onClick={() => updateMedia(item.id, { status: isReading ? 'reading' : 'watching' })}
            className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              item.status === 'watching' || item.status === 'reading' ? 'bg-neutral-800 text-white shadow-lg' : 'text-neutral-600'
            }`}
          >
            Ongoing
          </button>

          <button 
            onClick={() => updateMedia(item.id, { status: 'completed', progress: totalVal || currentProgress })}
            className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              item.status === 'completed' ? 'bg-white text-black' : 'text-neutral-600'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}