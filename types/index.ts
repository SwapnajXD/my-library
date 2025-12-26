// types/index.ts
export type MediaStatus = 'reading' | 'watching' | 'completed' | 'toread' | 'towatch';
export type MediaType = 'manga' | 'anime' | 'movie' | 'tv';

export interface Media {
  id: string;
  type: MediaType;
  title: string;
  creator: string;     
  poster: string;      
  rating: number;
  status: MediaStatus;
  year?: number | string;
  synopsis?: string;
}