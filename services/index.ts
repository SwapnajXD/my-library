import { searchMal } from './malApi';
import { searchTmdb } from './tmdbApi';
import { Media, MediaType } from '@/types';

const FALLBACK_POSTER = "https://via.placeholder.com/400x600?text=No+Cover";

export const searchMedia = async (query: string, type: MediaType): Promise<Media[]> => {
  if (!query.trim()) return [];

  // The Normalizer: Prefixing IDs ensures that Anime ID 1 doesn't collide with Book ID 1
  const transform = (item: any): Media => {
    let totalCount = 0;
    if (type === 'movie') {
      totalCount = 1;
    } else {
      totalCount = Number(item.total || item.episodes || item.pageCount || 0);
    }

    return {
      // FIX: Prefix ID with type to ensure uniqueness across the entire app
      id: `${type}-${item.id}`, 
      title: item.title || "Unknown Title",
      type: type,
      status: 'plan_to_watch',
      progress: 0,
      total: totalCount,
      poster: item.poster || item.cover || FALLBACK_POSTER,
      creator: item.creator || item.author || "Unknown",
      year: item.year || null,
      rating: item.rating || 0,
      synopsis: item.synopsis || "",
      genres: item.genres || [],
      mediaTypeBadge: type.toUpperCase()
    };
  };

  let rawResults: any[] = [];

  try {
    if (type === 'anime' || type === 'manga') {
      rawResults = await searchMal(query, type);
    } 
    else if (type === 'movie' || type === 'tv') {
      rawResults = await searchTmdb(query, type);
    } 
    else if (type === 'book') {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=15`
      );
      if (res.ok) {
        const data = await res.json();
        rawResults = (data.items || []).map((item: any) => ({
          id: item.id,
          title: item.volumeInfo.title,
          pageCount: item.volumeInfo.pageCount,
          poster: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
          author: item.volumeInfo.authors?.[0],
          year: item.volumeInfo.publishedDate ? new Date(item.volumeInfo.publishedDate).getFullYear() : null,
          synopsis: item.volumeInfo.description,
          genres: item.volumeInfo.categories || []
        }));
      }
    }

    // Apply the transformation and unique ID prefixing
    return rawResults.map(transform);

  } catch (error) {
    console.error("Search failed in Unified Service:", error);
    return [];
  }
};