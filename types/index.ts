export type MediaType = 'movie' | 'tv' | 'anime' | 'manga';
export type MediaStatus = 'reading' | 'watching' | 'completed' | 'toread' | 'towatch';

export interface Media {
  id: string;
  title: string;
  creator: string;
  status: MediaStatus;
  rating: number;
  type: MediaType;
  poster?: string;
  year?: number;
  synopsis?: string;
  progress: number;      // Current Ep/Ch
  episodes?: number;    // Total Ep/Ch
  runtime?: string;     // Added this
  genres?: string[];
  mediaTypeBadge?: string;
}