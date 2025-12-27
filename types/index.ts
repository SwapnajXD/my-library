"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MediaType = 'movie' | 'tv' | 'anime' | 'manga' | 'book';

export type MediaStatus = 
  | 'plan_to_watch' 
  | 'watching' 
  | 'reading' 
  | 'completed' 
  | 'on_hold' 
  | 'dropped'
  | 'backlog';

export interface Media {
  id: string;
  title: string;
  type: MediaType;
  status: MediaStatus;
  progress: number;
  total: number;
  poster: string;
  creator: string; 
  year: number | string | null;
  rating: number;
  synopsis?: string;
  genres: string[];
  sequelId?: string | null;
  needsDeepFetch?: boolean;
  banner?: string;
  studio?: string;
  author?: string;
  episodes?: number;
  chapters?: number;
}

export type MediaItem = Media;

interface MediaStore {
  media: Media[];
  addMedia: (item: Media) => void;
  updateMedia: (id: string, updates: Partial<Media>) => void;
  deleteMedia: (id: string) => void;
  setMedia: (media: Media[]) => void;
}

export const useMediaStore = create<MediaStore>()(
  persist(
    (set) => ({
      media: [],
      
      addMedia: (item) => set((state) => {
        // PREVENTION: Ensure we don't add duplicates or items with "None" IDs
        const exists = state.media.some(m => m.id === item.id);
        if (exists) return state;
        return { media: [item, ...state.media] };
      }),

      updateMedia: (id, updates) => set((state) => ({
        media: state.media.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      })),

      deleteMedia: (id) => set((state) => ({
        media: state.media.filter((m) => m.id !== id),
      })),

      setMedia: (media) => set({ media }),
    }),
    {
      name: 'vault-neural-storage',
    }
  )
);