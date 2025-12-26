export interface TmdbItem {
  id: number;
  title?: string;
  name?: string; 
  poster_path: string;
  vote_average: number;
  overview: string;
  release_date?: string;
  first_air_date?: string;
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY; 

export const normalizeTmdb = (item: TmdbItem, type: 'movie' | 'tv') => {
  const rawDate = item.release_date || item.first_air_date;
  return {
    id: `TMDB-${type}-${item.id}`,
    source: 'TMDB' as const,
    type: type,
    title: item.title || item.name || 'Unknown Title',
    creators: ['Unknown'], 
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
    rating: Math.round(item.vote_average / 2),
    year: rawDate ? new Date(rawDate).getFullYear() : undefined,
    synopsis: item.overview
  };
};

export const searchTmdb = async (query: string, type: 'movie' | 'tv') => {
  if (!query.trim() || !TMDB_API_KEY) return [];

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((item: TmdbItem) => normalizeTmdb(item, type));
  } catch (error) {
    console.error("TMDB API Error:", error);
    return [];
  }
};