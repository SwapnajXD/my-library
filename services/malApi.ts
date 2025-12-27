import axios from 'axios';

const JIKAN_URL = 'https://api.jikan.moe/v4';

export const malApi = {
  /**
   * Shallow search for Anime/Manga
   */
  search: async (query: string, type: 'anime' | 'manga') => {
    if (!query.trim()) return [];

    try {
      const { data } = await axios.get(`${JIKAN_URL}/${type}`, {
        params: { q: query, limit: 15 },
      });

      return data.data.map((item: any) => ({
        id: item.mal_id.toString(),
        title: item.title_english || item.title,
        type: type,
        total: item.episodes || item.chapters || 0,
        poster: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
        rating: item.score ? Number(item.score.toFixed(1)) : 0,
        year: item.year || item.aired?.prop?.from?.year || item.published?.prop?.from?.year || null,
        synopsis: item.synopsis,
        creator: type === 'anime' 
          ? item.studios?.[0]?.name || "Unknown Studio"
          : item.authors?.[0]?.name || "Unknown Author",
        genres: item.genres?.map((g: any) => g.name) || [],
        sequelId: null,
        needsDeepFetch: true,
      }));
    } catch (error) {
      console.error("MAL Search Error:", error);
      return [];
    }
  },

  /**
   * Deep fetch for Anime relations (Sequels)
   */
  getAnimeDetails: async (id: string | number) => {
    try {
      const { data: { data } } = await axios.get(`${JIKAN_URL}/anime/${id}/full`);
      
      // Look specifically for the "Sequel" relation
      const sequelRelation = data.relations?.find((r: any) => r.relation === 'Sequel');
      const sequelId = sequelRelation ? sequelRelation.entry[0].mal_id.toString() : null;

      return {
        creator: data.studios?.[0]?.name || "Unknown Studio",
        sequelId: sequelId,
        genres: data.genres?.map((g: any) => g.name) || [],
        synopsis: data.synopsis,
        total: data.episodes || 0,
      };
    } catch (error) {
      console.error("MAL Deep Fetch Error:", error);
      return null;
    }
  },
};