export const BOOK_STATUS = ['all', 'reading', 'completed', 'toread'] as const;
export type BookStatus = typeof BOOK_STATUS[number];
export const RATING_OPTIONS = [0, 1, 2, 3, 4, 5];

export const formatStatus = (status: string): string => {
  switch(status) {
    case 'toread': return 'To Read';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};
