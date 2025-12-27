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
  total: number; // Mandatory for progress logic
  
  // Visual Metadata
  poster: string;               
  banner?: string;              
  
  // Rich Metadata & Graph Identifiers
  creator: string;              // Primary node for the Relationship Graph (Studio/Author)
  studio?: string;              // Specific studio override
  author?: string;              // Specific author override
  year?: string | number;       
  rating?: number;              // Scaled to 10.0
  synopsis?: string;
  genres: string[];             
  
  // API Specific counters
  episodes?: number;            
  chapters?: number;            
}