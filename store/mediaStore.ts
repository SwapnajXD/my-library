"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// UPDATED: Added missing types
export type MediaType = 'Anime' | 'Manga' | 'Movie' | 'TV' | 'Book';
export type MediaStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

export interface MediaItem {
  id: string;
  title: string;
  poster: string;
  creator: string;
  type: MediaType;
  status: MediaStatus;
  rating: number;
  progress: number;
  total: number;
  genres: string[];
  year?: string | number;
  synopsis?: string; // Added synopsis to the store interface
}

interface MediaState {
  media: MediaItem[];
  addMedia: (item: MediaItem) => void;
  deleteMedia: (id: string) => void;
  setMedia: (media: MediaItem[]) => void;
  updateMedia: (id: string, updates: Partial<MediaItem>) => void;
}

export const useMediaStore = create<MediaState>()(
  persist(
    (set) => ({
      media: [],
      addMedia: (item) =>
        set((state) => ({
          media: state.media.some((m) => m.id === item.id)
            ? state.media
            : [item, ...state.media],
        })),
      deleteMedia: (id) =>
        set((state) => ({
          media: state.media.filter((item) => item.id !== id),
        })),
      setMedia: (newMedia) => set({ media: newMedia }),
      updateMedia: (id, updates) =>
        set((state) => ({
          media: state.media.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
    }),
    {
      name: 'neural-vault-storage',
    }
  )
);