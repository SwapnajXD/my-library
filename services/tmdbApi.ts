import axios from 'axios';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbClient = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'en-US',
  },
});

export const tmdbApi = {
  /**
   * Shallow search for the UI results list
   */
  search: async (query: string, type: 'movie' | 'tv') => {
    if (!query.trim() || !TMDB_API_KEY) return [];

    try {
      const { data } = await tmdbClient.get(`/search/${type}`, {
        params: { query: encodeURIComponent(query) },
      });

      return data.results.map((item: any) => ({
        id: item.id.toString(),
        title: item.title || item.name,
        type: type === 'movie' ? 'movie' : 'tv',
        total: type === 'movie' ? 1 : 0,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 0,
        year: (item.release_date || item.first_air_date)?.split('-')[0] || null,
        synopsis: item.overview,
        creator: type === 'movie' ? 'Film Production' : 'TV Network',
        genres: [],
        sequelId: null,
        needsDeepFetch: true,
      }));
    } catch (error) {
      console.error("TMDB Search Error:", error);
      return [];
    }
  },

  /**
   * Deep fetch for the Relationship Graph (Sequels & Directors)
   */
  getMovieDetails: async (id: string | number) => {
    try {
      const { data } = await tmdbClient.get(`/movie/${id}`, {
        params: { append_to_response: 'credits' },
      });

      let sequelId = null;

      // Logic to find the next movie in a series/collection
      if (data.belongs_to_collection) {
        const { data: collection } = await tmdbClient.get(`/collection/${data.belongs_to_collection.id}`);
        const parts = collection.parts.sort(
          (a: any, b: any) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
        );
        const currentIndex = parts.findIndex((p: any) => p.id === data.id);
        if (currentIndex !== -1 && currentIndex < parts.length - 1) {
          sequelId = parts[currentIndex + 1].id.toString();
        }
      }

      return {
        creator: data.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Unknown Director',
        sequelId,
        genres: data.genres?.map((g: any) => g.name) || [],
        synopsis: data.overview,
        total: 1, // Movies are 1 unit
      };
    } catch (error) {
      console.error("TMDB Deep Fetch Error:", error);
      return null;
    }
  },
};