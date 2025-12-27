"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- EXPORTED TYPES ---
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
  banner?: string;
  studio?: string;
  author?: string;
}

// Alias for compatibility with your existing Graph components
export type MediaItem = Media;

interface MediaStore {
  media: Media[];
  addMedia: (item: Partial<Media>) => void;
  updateMedia: (id: string, updates: Partial<Media>) => void;
  deleteMedia: (id: string) => void;
  setMedia: (media: Media[]) => void;
  refreshMetadata: (id: string) => Promise<void>;
  bulkRefreshMissingMetadata: (options?: { concurrency?: number; onProgress?: (done: number, total: number) => void }) => Promise<void>;
  findDuplicateIds: () => string[];
  logDuplicateItems: () => void;
}

export const useMediaStore = create<MediaStore>()(
  persist(
    (set, get) => ({
      media: [],
      addMedia: (item) => set((state) => {
        // Normalize incoming partial item into a full Media object with sensible defaults
        const inferredType = (item as any).type || 'movie';
        let id = String(item.id ?? '');
        if (!id.includes('-') && inferredType) id = `${inferredType}-${id}`;
        if (!id || id.toLowerCase() === 'none' || id.toLowerCase() === 'null') {
          id = `${inferredType}-${Date.now()}`;
        }

        const normalized: Media = {
          id,
          title: item.title ?? 'Untitled',
          type: (item.type as MediaType) ?? (inferredType as MediaType),
          status: (item.status as MediaStatus) ?? 'backlog',
          progress: typeof item.progress === 'number' ? item.progress : 0,
          total: typeof item.total === 'number' ? item.total : 0,
          poster: item.poster ?? '',
          creator: item.creator ?? 'Unknown',
          year: item.year ?? null,
          rating: typeof item.rating === 'number' ? item.rating : 0,
          synopsis: item.synopsis ?? '',
          genres: item.genres ?? [],
          sequelId: item.sequelId ?? undefined,
          banner: item.banner ?? undefined,
          studio: item.studio ?? undefined,
          author: item.author ?? undefined,
        };

        return { media: [normalized, ...state.media.filter(m => m.id !== normalized.id)] };
      }),
      updateMedia: (id, updates) => set((state) => ({
        media: state.media.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      })),
      deleteMedia: (id) => set((state) => ({
        media: state.media.filter((m) => m.id !== id),
      })),
      setMedia: (media) => set(() => {
        // Deduplicate by id (keep first occurrence), normalize ids
        const map = new Map<string, Media>();
        for (const it of media) {
          let id = String(it.id ?? '');
          if (!id.includes('-') && (it as any).type) id = `${(it as any).type}-${id}`;
          if (!id || id.toLowerCase() === 'none' || id.toLowerCase() === 'null') continue;
          if (!map.has(id)) {
            map.set(id, { ...it, id });
          }
        }
        return { media: Array.from(map.values()) };
      }),
      refreshMetadata: async (id: string) => {
        const item = get().media.find(m => m.id === id);
        if (!item) return;
        try {
          const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
          const { data } = await response.json();
          if (data) {
            get().updateMedia(id, {
              title: data.title,
              poster: data.images.jpg.large_image_url,
              synopsis: data.synopsis,
              rating: data.score || 0,
              total: data.episodes || 0,
              genres: data.genres?.map((g: any) => g.name) || [],
              studio: data.studios?.[0]?.name,
            });
          }
        } catch (error) {
          console.error("METADATA_SYNC_FAILURE:", error);
        }
      }
      ,
      bulkRefreshMissingMetadata: async ({ concurrency = 3, onProgress } = {}) => {
        // Lazy-import APIs to avoid SSR issues
        const { malApi } = await import('@/services/malApi');
        const { tmdbApi } = await import('@/services/tmdbApi');

        const items = get().media.filter((m) => {
          const missingSynopsis = !m.synopsis || String(m.synopsis).trim() === '';
          const missingPoster = !m.poster || m.poster.includes('placeholder.com') || m.poster.includes('via.placeholder');
          const lowRating = !m.rating || m.rating === 0;
          return missingSynopsis || missingPoster || lowRating;
        });

        const total = items.length;
        let done = 0;

        if (total === 0) {
          onProgress?.(0, 0);
          return;
        }

        const queue = items.slice();

        const worker = async () => {
          while (queue.length > 0) {
            const item = queue.shift();
            if (!item) break;

            try {
              const [t, raw] = item.id.split('-', 2);
              let details: any = null;

              if (t === 'anime' || t === 'manga') {
                details = await malApi.getAnimeDetails(raw);
              } else if (t === 'movie' || t === 'tv') {
                details = await tmdbApi.getMovieDetails(raw);
              } else {
                // Books or unknown types are skipped for deep fetch
                details = null;
              }

              if (details) {
                const updates: Partial<Media> = {};
                if (details.synopsis) updates.synopsis = details.synopsis;
                if (details.genres) updates.genres = details.genres;
                if (details.creator) updates.creator = details.creator;
                if (typeof details.total === 'number') updates.total = details.total;
                if (details.studio) updates.studio = details.studio;
                // rating is optional from deep endpoints
                if (typeof details.rating === 'number') updates.rating = details.rating;

                get().updateMedia(item.id, updates);
              }
            } catch (err) {
              console.error('Bulk metadata fetch error for', item.id, err);
            } finally {
              done += 1;
              onProgress?.(done, total);
              // polite delay to reduce burst rate
              await new Promise((r) => setTimeout(r, 250));
            }
          }
        };

        // Start workers
        const workers = Array.from({ length: Math.max(1, concurrency) }).map(() => worker());
        await Promise.all(workers);
      },
      findDuplicateIds: () => {
        const counts = new Map<string, number>();
        for (const m of get().media) {
          const id = String(m.id ?? '').trim();
          if (!id) continue;
          counts.set(id, (counts.get(id) || 0) + 1);
        }
        const duplicates: string[] = [];
        for (const [id, cnt] of counts.entries()) {
          if (cnt > 1) duplicates.push(id);
        }
        return duplicates;
      },
      logDuplicateItems: () => {
        // Dev-only logger
        if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') return;

        const bucket = new Map<string, Array<{ index: number; item: Media }>>();
        get().media.forEach((item, idx) => {
          const id = String(item.id ?? '').trim();
          if (!id) return;
          if (!bucket.has(id)) bucket.set(id, []);
          bucket.get(id)!.push({ index: idx, item });
        });

        let found = false;
        bucket.forEach((arr, id) => {
          if (arr.length > 1) {
            found = true;
            console.groupCollapsed(`Duplicate Media ID detected: %c${id} (%d occurrences)`, 'color:orange;font-weight:bold', arr.length);
            arr.forEach(({ index, item }) => {
              console.log(`Index: ${index}`, { id: item.id, title: item.title, type: item.type, year: item.year });
            });
            console.groupEnd();
          }
        });

        if (!found) console.info('No duplicate media IDs found.');
      },
    }),
    { name: 'vault-neural-storage' }
  )
);