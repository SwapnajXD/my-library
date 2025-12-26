export type MediaType = 'anime' | 'manga' | 'movie' | 'tv';

// Using a clean, unified naming convention for status
export type MediaStatus = 'watching' | 'reading' | 'completed' | 'plan_to_watch' | 'dropped';

export interface Media {
  id: string;
  title: string;
  creator?: string;      // Author for manga / Studio for anime
  status: MediaStatus;
  rating: number;
  type: MediaType;
  poster: string;        // Made required for visual consistency
  year?: number;
  synopsis?: string;
  genres?: string[];
  progress: number;      // Current Episode or Chapter
  episodes?: number;     // Total Episodes or Chapters
  runtime?: string;      // Specifically for 'movie' type
  mediaTypeBadge?: string;
}