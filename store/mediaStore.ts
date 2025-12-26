import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Media } from '@/types';

interface MediaStore {
  media: Media[];
  addMedia: (item: Omit<Media, 'id'>) => void;
  updateMedia: (id: string, updates: Partial<Media>) => void;
  deleteMedia: (id: string) => void;
}

export const useMediaStore = create<MediaStore>()(
  persist(
    (set) => ({
      media: [],
      
      addMedia: (item) =>
        set((state) => ({
          media: [...state.media, { ...item, id: crypto.randomUUID() }]
        })),

      updateMedia: (id, updates) => 
        set((state) => ({
          media: state.media.map((item) => 
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      deleteMedia: (id) =>
        set((state) => ({
          media: state.media.filter((m) => m.id !== id),
        })),
    }),
    { name: 'media-storage' }
  )
);