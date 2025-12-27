import { useState, useEffect } from 'react';
import { searchMedia } from '@/services';
import { Media, MediaType } from '@/types';

export function useMediaSearch(query: string, type: MediaType) {
  const [results, setResults] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchMedia(query, type);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, type]);

  return { results, isLoading };
}