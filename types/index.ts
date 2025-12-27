export type MediaType = 'anime' | 'manga' | 'movie' | 'tv' | 'book';

export type MediaStatus = 
  | 'plan_to_watch' 
  | 'watching' 
  | 'reading' 
  | 'completed' 
  | 'dropped';

export interface Media {
  // Core Identifiers
  id: string;
  title: string;
  type: MediaType;
  status: MediaStatus;
  
  // Progress Tracking
  progress: number;             
  total: number; // Default to 0 if unknown
  
  // API Specific counters (Optional helpers)
  episodes?: number;            
  chapters?: number;            
  
  // Visual Metadata
  poster: string;               
  banner?: string;              
  
  // Rich Metadata
  creator?: string;             // Author, Director, or Studio
  year?: string | number;       
  rating?: number;              // Scaled to 10.0
  synopsis?: string;
  genres?: string[];
}