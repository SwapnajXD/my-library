export type MediaType = 'anime' | 'manga' | 'movie' | 'tv' | 'book';

// Merged statuses to include 'plan_to_watch'
export type MediaStatus = 'watching' | 'reading' | 'completed' | 'plan_to_watch' | 'dropped';

export interface Media {
  id: string;
  title: string;
  type: MediaType;
  status: MediaStatus;
  progress: number;      // Current Page / Episode
  total?: number;        // Total Pages / Episodes (formerly 'episodes' in your snippet)
  
  // Metadata
  creator?: string;      // Author for books / Studio for Anime
  rating?: number;       // Change to optional if items might not have one yet
  poster?: string;
  banner?: string;       // From version 1
  year?: number;         // From version 2
  synopsis?: string;
  genres?: string[];
  
  // UI Helpers
  mediaTypeBadge?: string;
}