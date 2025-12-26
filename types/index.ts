export type MediaType = 'anime' | 'manga' | 'movie' | 'tv' | 'book';

export type MediaStatus = 'watching' | 'reading' | 'completed' | 'plan_to_watch' | 'dropped';

export interface Media {
  id: string;
  title: string;
  creator?: string;      // Author for books
  status: MediaStatus;
  rating: number;
  type: MediaType;
  poster: string;
  year?: number;
  synopsis?: string;
  genres?: string[];
  progress: number;      // Current Page
  episodes?: number;     // Total Pages
  mediaTypeBadge?: string;
}