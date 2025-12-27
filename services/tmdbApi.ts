const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export const searchTmdb = async (query: string, type: 'movie' | 'tv') => {
  if (!query.trim()) return [];
  
  // Guard against missing API Key
  if (!TMDB_API_KEY) {
    console.error("TMDB API Key is missing. Check your .env file.");
    return [];
  }

  try {
    const res = await fetch(
      `${BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`
    );

    if (!res.ok) throw new Error(`TMDB API Error: ${res.status}`);
    
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((item: any) => ({
      // Clean ID - the index.ts transform will handle the String conversion
      id: item.id,
      title: item.title || item.name,
      
      // logic: Movies are always 1 unit. TV total is not in search results, 
      // usually requires a secondary fetch to /tv/{id}, so we default to 0.
      total: type === 'movie' ? 1 : 0,
      
      // Standardize the poster path
      poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      
      // Clean rating to 1 decimal point
      rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 0,
      
      // Handle both Movie release dates and TV first air dates
      year: item.release_date ? new Date(item.release_date).getFullYear() : 
            item.first_air_date ? new Date(item.first_air_date).getFullYear() : null,
      
      synopsis: item.overview,
      
      // Contextual creator string
      creator: type === 'movie' ? 'Feature Film' : 'TV Series',
      
      genres: [] // TMDB requires a separate genres mapping or ID lookup
    }));
  } catch (error) {
    console.error("TMDB Search Error:", error);
    return [];
  }
};