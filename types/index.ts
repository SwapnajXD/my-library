export type BookStatus = 'reading' | 'completed' | 'toread';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  rating: number;
  cover?: string;
}