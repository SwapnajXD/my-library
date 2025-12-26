"use client";

import { useEffect } from 'react';
import { Media, MediaStatus } from '@/types';
import { useMediaStore } from '@/store/mediaStore';
import { Minus, Plus, X } from 'lucide-react';

interface EditMediaModalProps {
  item: Media;
  onClose: () => void; // This should only close the Edit overlay
}

export default function EditMediaModal({ item, onClose }: EditMediaModalProps) {
  const updateProgress = useMediaStore(state => state.updateProgress);
  const updateStatus = useMediaStore(state => state.updateStatus);
  const isReading = item.type === 'book' || item.type === 'manga';

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      // Prevents the event from bubbling up to the MediaModal
      if (e.key === 'Escape') {
        e.stopPropagation(); 
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const adjust = (val: number) => {
    const next = item.progress + val;
    if (next >= 0) updateProgress(item.id, next);
  };

  return (
    // Higher z-index than MediaModal ensures this sits on top
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0A0A0A] w-full max-w-md rounded-[40px] border border-neutral-900 p-10 shadow-3xl text-center">
        <div className="flex justify-between items-center mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Tracking</span>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors"><X size={20}/></button>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-10">
          Currently on {isReading ? 'Page / Chapter' : 'Episode'} {item.progress}
        </p>

        <div className="flex items-center justify-center gap-10 mb-10">
          <button onClick={() => adjust(-1)} className="p-5 bg-neutral-900 rounded-3xl text-neutral-400 hover:text-white transition-all active:scale-90">
            <Minus size={24} />
          </button>
          <span className="text-6xl font-black text-white tabular-nums tracking-tighter">{item.progress}</span>
          <button onClick={() => adjust(1)} className="p-5 bg-white text-black rounded-3xl hover:bg-neutral-200 transition-all active:scale-90">
            <Plus size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1.5 bg-black rounded-2xl border border-neutral-900">
          <button 
            onClick={() => updateStatus(item.id, (isReading ? 'reading' : 'watching') as MediaStatus)}
            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${item.status !== 'completed' ? 'bg-neutral-800 text-white' : 'text-neutral-600'}`}
          >
            {isReading ? 'Reading' : 'Watching'}
          </button>
          <button 
            onClick={() => updateStatus(item.id, 'completed' as MediaStatus)}
            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${item.status === 'completed' ? 'bg-green-600 text-white' : 'text-neutral-600'}`}
          >
            Completed
          </button>
        </div>
      </div>
    </div>
  );
}