import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Media } from '@/types';

interface MediaState {
  media: Media[];
  addMedia: (item: Media) => void;
  updateMedia: (id: string, updates: Partial<Media>) => void;
  // This was missing:
  updateProgress: (id: string, newProgress: number) => void; 
  deleteMedia: (id: string) => void;
}

export const useMediaStore = create<MediaState>()(
  persist(
    (set) => ({
      media: [],
      
      addMedia: (item) => set((state) => ({ 
        media: [item, ...state.media] 
      })),

      updateMedia: (id, updates) => set((state) => ({
        media: state.media.map((m) => 
          m.id === id ? { ...m, ...updates } : m
        ),
      })),

      // Implementation of the missing function
      updateProgress: (id, newProgress) => set((state) => ({
        media: state.media.map((m) =>
          m.id === id ? { ...m, progress: newProgress } : m
        ),
      })),

      deleteMedia: (id) => set((state) => ({
        media: state.media.filter((m) => m.id !== id)
      })),
    }),
    { name: 'media-storage' }
  )
);