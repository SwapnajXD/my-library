// We map the raw API data to a shape that the unified services/index.ts can easily "transform"
export const searchMal = async (query: string, type: 'anime' | 'manga') => {
  if (!query.trim()) return [];

  try {
    const res = await fetch(
      `https://api.jikan.moe/v4/${type}?q=${encodeURIComponent(query)}&limit=15`
    );
    
    if (!res.ok) throw new Error(`MAL API Error: ${res.status}`);
    
    const data = await res.json();
    if (!data?.data) return [];

    return data.data.map((item: any) => ({
      // We keep the ID clean, the index.ts will handle the String conversion
      id: item.mal_id,
      title: item.title,
      
      // Map 'episodes' or 'chapters' to a common 'total' field
      total: item.episodes || item.chapters || 0,
      
      // Use the high-quality image path
      poster: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
      
      // Score normalization
      rating: item.score ? Number(item.score.toFixed(1)) : 0,
      
      // Robust year extraction
      year: item.year || 
            item.aired?.prop?.from?.year || 
            item.published?.prop?.from?.year || 
            (item.aired?.from ? new Date(item.aired.from).getFullYear() : null),
      
      synopsis: item.synopsis,
      
      // Map Studio (Anime) or Author (Manga) to 'creator'
      creator: type === 'anime' 
        ? item.studios?.[0]?.name || item.producers?.[0]?.name
        : item.authors?.[0]?.name,
        
      genres: item.genres?.map((g: any) => g.name) || []
    }));
  } catch (error) {
    console.error("Failed to fetch from MAL:", error);
    return [];
  }
};