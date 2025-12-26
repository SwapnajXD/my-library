export interface MediaItem {
  id: string;
  title: string;
  authors: string[];
  cover: string;
  rating: number;
  source: 'MAL';
  year?: number;
  synopsis?: string;
  episodes?: number;
  genres?: string[];
  type?: string; 
}

export const searchMal = async (query: string, category: 'anime' | 'manga'): Promise<MediaItem[]> => {
  if (!query.trim()) return [];
  const endpoint = category === 'anime' ? 'anime' : 'manga';
  
  try {
    const res = await fetch(
      `https://api.jikan.moe/v4/${endpoint}?q=${encodeURIComponent(query)}&limit=25`
    );
    if (!res.ok) throw new Error(`MAL Error: ${res.status}`);
    const data = await res.json();
    if (!data?.data) return [];

    return data.data.map((item: any) => ({
      id: `MAL-${item.mal_id}`,
      source: 'MAL' as const,
      title: item.title,
      authors: category === 'anime' 
        ? item.studios?.map((s: any) => s.name) || []
        : item.authors?.map((a: any) => a.name) || [],
      cover: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
      rating: item.score ? Number(Math.min(item.score, 10).toFixed(1)) : 0,
      year: item.year || item.aired?.prop?.from?.year || item.published?.prop?.from?.year,
      synopsis: item.synopsis,
      episodes: item.chapters || item.episodes || 0,
      genres: item.genres?.map((g: any) => g.name) || [],
      type: item.type 
    }));
  } catch (error) {
    console.error("MAL API Error:", error);
    return [];
  }
};