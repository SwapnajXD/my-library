const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface TmdbItem {
  id: string;
  title: string;
  creator: string;
  poster: string;
  rating: number;
  year?: number;
  synopsis?: string;
  genres?: string[];
  episodes?: number;
  type?: string;
}

export const searchTmdb = async (query: string, category: 'movie' | 'tv'): Promise<TmdbItem[]> => {
  if (!query.trim()) return [];

  try {
    const res = await fetch(
      `${BASE_URL}/search/${category}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`
    );
    if (!res.ok) throw new Error(`TMDB Error: ${res.status}`);
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((item: any) => ({
      id: `TMDB-${item.id}`,
      title: item.title || item.name,
      creator: category === 'movie' ? 'Movie' : 'TV Series', 
      poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
      // Float Rating (e.g. 7.4)
      rating: item.vote_average ? Number(Math.min(item.vote_average, 10).toFixed(1)) : 0,
      year: item.release_date ? new Date(item.release_date).getFullYear() : 
            item.first_air_date ? new Date(item.first_air_date).getFullYear() : undefined,
      synopsis: item.overview,
      genres: [], 
      episodes: 0,
      type: category === 'movie' ? 'Movie' : 'TV'
    }));
  } catch (error) {
    console.error("TMDB Search Error:", error);
    return [];
  }
};