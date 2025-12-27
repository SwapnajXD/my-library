import { MediaType } from "@/types";

// You can get this key from themoviedb.org/settings/api
const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export const searchExternalMedia = async (query: string, type: MediaType): Promise<any[]> => {
  if (!query.trim()) return [];

  try {
    // 1. ANIME & MANGA (Jikan API)
    if (type === 'anime' || type === 'manga') {
      const response = await fetch(
        `https://api.jikan.moe/v4/${type}?q=${encodeURIComponent(query)}&limit=20`
      );
      if (!response.ok) throw new Error('Jikan API request failed');
      const data = await response.json();
      return data.data || [];
    } 

    // 2. MOVIES & TV SHOWS (TMDB API)
    if (type === 'movie' || type === 'tv') {
      if (!TMDB_KEY) {
        console.warn("TMDB API Key missing. Please add NEXT_PUBLIC_TMDB_API_KEY to your .env");
        return [];
      }
      const tmdbType = type === 'movie' ? 'movie' : 'tv';
      const response = await fetch(
        `https://api.themoviedb.org/3/search/${tmdbType}?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error('TMDB API request failed');
      const data = await response.json();
      return data.results || [];
    }

    // 3. BOOKS (Open Library Search API)
    if (type === 'book') {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`
      );
      if (!response.ok) throw new Error('Open Library API request failed');
      const data = await response.json();
      // Open Library returns results in a "docs" array
      return data.docs || [];
    }

    return [];
  } catch (error) {
    console.error("External Search Error:", error);
    return [];
  }
};