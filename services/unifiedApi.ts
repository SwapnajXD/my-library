import { searchMal } from './malApi';
import { searchTmdb } from './tmdbApi';
import { MediaType, Media } from '@/types';

export interface UnifiedMediaItem extends Omit<Media, 'id' | 'status' | 'progress' | 'creator'> {
  id: string; 
  creators: string[];
  creator?: string;
  mediaTypeBadge?: string; 
}

export const searchMedia = async (query: string, type: MediaType): Promise<UnifiedMediaItem[]> => {
  if (!query.trim()) return [];

  if (type === 'manga' || type === 'anime') {
    const malResults = await searchMal(query, type); 
    return malResults.map((item) => ({
      id: item.id,
      title: item.title,
      type: type,
      creators: item.authors || [],
      creator: item.authors?.join(', ') || 'Unknown',
      poster: item.cover,
      rating: item.rating,
      year: item.year,
      synopsis: item.synopsis,
      episodes: item.episodes,
      genres: item.genres,
      mediaTypeBadge: item.type
    }));
  } else {
    const tmdbResults = await searchTmdb(query, type as 'movie' | 'tv');
    return tmdbResults.map((item: any) => ({
      ...item,
      type: type,
      creators: item.creators || [item.creator] || [],
      creator: item.creator || (item.creators ? item.creators.join(', ') : 'Unknown'),
      poster: item.poster,
      rating: item.rating,
      year: item.year,
      synopsis: item.synopsis,
      runtime: item.runtime,
      genres: item.genres || [],
      episodes: item.episodes || 0,
      mediaTypeBadge: item.type
    }));
  }
};