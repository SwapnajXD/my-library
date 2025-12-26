import { searchManga, MediaItem as MalItem } from './malApi';
import { searchTmdb } from './tmdbApi';
import { MediaType } from '@/types';

export interface UnifiedMediaItem {
  id: string;
  source: 'MAL' | 'TMDB';
  type: MediaType;
  title: string;
  creators: string[];
  poster: string;
  rating: number;
  year?: number | string;
  synopsis?: string;
}

export const searchMedia = async (query: string, type: MediaType): Promise<UnifiedMediaItem[]> => {
  if (!query.trim()) return [];

  if (type === 'manga' || type === 'anime') {
    const malResults = await searchManga(query); 
    return malResults.map((item: MalItem) => ({
      id: String(item.id),
      source: 'MAL',
      type: type,
      title: item.title,
      creators: item.authors || [],
      poster: item.cover,
      rating: item.rating,
      year: item.year,
      synopsis: item.synopsis
    }));
  } else {
    // Returns already normalized items from tmdbApi
    return await searchTmdb(query, type as 'movie' | 'tv');
  }
};

// NEW: Use this to get combined results from all sources
export const searchAllMedia = async (query: string) => {
  const [movies, tv, anime, manga] = await Promise.all([
    searchTmdb(query, 'movie'),
    searchTmdb(query, 'tv'),
    searchMedia(query, 'anime'),
    searchMedia(query, 'manga')
  ]);
  return [...movies, ...tv, ...anime, ...manga];
};