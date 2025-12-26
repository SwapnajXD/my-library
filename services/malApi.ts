export interface MalRawResult {
  mal_id: number;
  title: string;
  images: { jpg: { image_url: string } };
  synopsis: string;
  score: number;
  authors: { name: string }[];
}

export interface MediaItem {
  id: string;
  source: 'MAL' | 'GoogleBooks'; 
  title: string;
  authors: string[];
  cover: string;
  rating: number; 
}

export const searchManga = async (query: string): Promise<MediaItem[]> => {
  if (!query.trim()) return [];
  try {
    const res = await fetch(\`https://api.jikan.moe/v4/manga?q=\${encodeURIComponent(query)}&limit=5\`);
    const data = await res.json();
    if (!data.data) return [];
    return data.data.map((manga: MalRawResult) => ({
      id: \`MAL-\${manga.mal_id}\`,
      source: 'MAL' as const,
      title: manga.title,
      authors: manga.authors.map(a => a.name),
      cover: manga.images.jpg.image_url,
      rating: Math.round(manga.score / 2)
    }));
  } catch (error) {
    console.error("MAL API Error:", error);
    return [];
  }
};
