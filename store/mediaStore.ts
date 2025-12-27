import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Media } from '@/types';

interface MediaState {
  media: Media[];
  addMedia: (item: Media) => void;
  deleteMedia: (id: string) => void;
  updateMedia: (id: string, updates: Partial<Media>) => void;
}

export const useMediaStore = create<MediaState>()(
  persist(
    (set) => ({
      media: [],
      addMedia: (item) => set((state) => ({ 
        // Prevent duplicates and add new item
        media: state.media.some(m => m.id === item.id) 
          ? state.media 
          : [item, ...state.media] 
      })),
      deleteMedia: (id) => set((state) => ({
        media: state.media.filter((m) => m.id !== id)
      })),
      updateMedia: (id, updates) => set((state) => ({
        media: state.media.map((m) => m.id === id ? { ...m, ...updates } : m)
      })),
    }),
    { name: 'vault-storage' }
  )
);