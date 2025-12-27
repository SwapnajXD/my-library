import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Media } from '@/types';

interface MediaState {
  media: Media[];
  addMedia: (item: Media) => void;
  updateMedia: (id: string, updates: Partial<Media>) => void;
  deleteMedia: (id: string) => void;
  setMedia: (newMedia: Media[]) => void;
}

export const useMediaStore = create<MediaState>()(
  persist(
    (set) => ({
      media: [],
      addMedia: (item) => 
        set((state) => ({ media: [item, ...state.media] })),
      updateMedia: (id, updates) =>
        set((state) => ({
          media: state.media.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      deleteMedia: (id) =>
        set((state) => ({
          media: state.media.filter((item) => item.id !== id),
        })),
      setMedia: (newMedia) => set({ media: newMedia }),
    }),
    {
      name: 'vault-storage',
    }
  )
);