"use client";

import { Media, MediaStatus } from '@/types';
import { useMediaStore } from '@/store/mediaStore';
import { Minus, Plus, X } from 'lucide-react';

interface EditMediaModalProps {
  item: Media;
  onClose: () => void;
}

export default function EditMediaModal({ item, onClose }: EditMediaModalProps) {
  // Pulling the correct functions from your store
  const updateProgress = useMediaStore(state => state.updateProgress);
  const updateStatus = useMediaStore(state => state.updateStatus);
  
  const isReading = item.type === 'book' || item.type === 'manga';

  const adjust = (val: number) => {
    const next = item.progress + val;
    // Check against total episodes/pages if they exist
    const max = item.episodes || Infinity;
    if (next >= 0 && next <= max) {
      updateProgress(item.id, next);
    }
  };

  const handleStatusChange = (newStatus: MediaStatus) => {
    updateStatus(item.id, newStatus);
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

        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-10">
          Currently on {isReading ? 'Page / Chapter' : 'Episode'} {item.progress}
        </p>

        {/* Counter */}
        <div className="flex items-center justify-center gap-10 mb-10">
          <button 
            onClick={() => adjust(-1)} 
            className="p-5 bg-neutral-900 rounded-3xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all active:scale-90"
          >
            <Minus size={24} />
          </button>
          
          <div className="flex flex-col items-center">
             <span className="text-6xl font-black text-white tabular-nums tracking-tighter">{item.progress}</span>
             {item.episodes ? (
               <span className="text-[10px] font-bold text-neutral-700 uppercase mt-2">of {item.episodes}</span>
             ) : null}
          </div>

          <button 
            onClick={() => adjust(1)} 
            className="p-5 bg-white text-black rounded-3xl hover:bg-neutral-200 transition-all active:scale-90"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Status Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-black rounded-2xl border border-neutral-900">
          <button 
            onClick={() => handleStatusChange(isReading ? 'reading' : 'watching')}
            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              item.status !== 'completed' ? 'bg-neutral-800 text-white' : 'text-neutral-600 hover:text-neutral-400'
            }`}
          >
            {isReading ? 'Reading' : 'Watching'}
          </button>
          <button 
            onClick={() => handleStatusChange('completed')}
            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              item.status === 'completed' ? 'bg-green-600 text-white' : 'text-neutral-600 hover:text-neutral-400'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
    </div>
  );
}