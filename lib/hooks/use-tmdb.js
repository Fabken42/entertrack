// /lib/hooks/use-tmdb.js
import { useState, useEffect } from 'react';
import { tmdbClient } from '../api/tmdb';

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
        
        // Converter mediaType para formato TMDB
        const tmdbType = mediaType === 'series' || mediaType === 'tv' ? 'tv' : 'movie';
        
        if (tmdbType === 'movie') {
          data = await tmdbClient.searchMovies(query);
        } else {
          data = await tmdbClient.searchTVShows(query);
        }

        console.log(`TMDB Search: query="${query}", type="${tmdbType}", results=${data?.results?.length || 0}`);
        
        setResults(data?.results || []);
      } catch (err) {
        console.error('TMDB search error details:', err);
        setError(err.message || 'Erro ao buscar dados do TMDB');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchMedia, 300);
    return () => clearTimeout(timeoutId);
  }, [query, mediaType]);

  return { results, loading, error };
};