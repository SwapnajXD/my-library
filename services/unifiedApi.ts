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

  const encodedQuery = encodeURIComponent(query);

  // 1. Handle Books via Google Books API
  if (type === 'book') {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=20`);
    const data = await res.json();
    
    return (data.items || []).map((item: any) => {
      const info = item.volumeInfo;
      const authors = info.authors || ['Unknown Author'];
      return {
        id: item.id,
        title: info.title,
        type: 'book' as MediaType,
        poster: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        year: info.publishedDate ? parseInt(info.publishedDate.split('-')[0]) : undefined,
        rating: info.averageRating || 0,
        creators: authors,
        creator: authors.join(', '),
        synopsis: info.description || '',
        genres: info.categories || ['Book'],
        episodes: info.pageCount || 0, // Using pageCount as total "episodes" for books
        mediaTypeBadge: 'Book'
      };
    });
  }

  // 2. Handle Anime/Manga via your existing searchMal wrapper
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
  } 
  
  // 3. Handle Movies/TV via your existing searchTmdb wrapper
  const tmdbResults = await searchTmdb(query, type as 'movie' | 'tv');
  return tmdbResults.map((item: any) => ({
    ...item,
    type: type,
    creators: item.creators || (item.creator ? [item.creator] : []),
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
};