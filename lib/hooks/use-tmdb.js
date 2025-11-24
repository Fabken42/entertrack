// /lib/hooks/use-tmdb.js
import { useState, useEffect } from 'react';
import { tmdbClient } from '@/lib/api/tmdb';

export const useTMDBSearch = (query, mediaType = 'movie') => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const searchMedia = async () => {
      setLoading(true);
      setError(null);

      try {
        let data;
        
        if (mediaType === 'movie') {
          data = await tmdbClient.searchMovies(query);
        } else if (mediaType === 'series') {
          data = await tmdbClient.searchTVShows(query);
        }

        setResults(data?.results || []);
      } catch (err) {
        setError('Erro ao buscar dados do TMDB');
        console.error('TMDB search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchMedia, 300);
    return () => clearTimeout(timeoutId);
  }, [query, mediaType]);

  return { results, loading, error };
};