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
        let searchData;
        
        // Converter mediaType para formato TMDB
        const tmdbType = mediaType === 'series' || mediaType === 'tv' ? 'tv' : 'movie';
        
        if (tmdbType === 'movie') {
          searchData = await tmdbClient.searchMovies(query);
        } else {
          searchData = await tmdbClient.searchTVShows(query);
        }
        
        // Buscar detalhes completos para cada resultado
        const detailedResults = await Promise.all(
          searchData.results.map(async (item) => {
            try {
              let details;
              
              if (tmdbType === 'movie') {
                details = await tmdbClient.getMovieDetails(item.id);
              } else {
                details = await tmdbClient.getTVShowDetails(item.id);
              }
              
              return {
                ...item,
                // Sobrescrever com os detalhes completos
                genres: details.genres || [],
                runtime: details.runtime || details.episode_run_time?.[0] || 0
              };
            } catch (err) {
              console.error(`Erro ao buscar detalhes do item ${item.id}:`, err);
              return item; // Retornar item original se falhar
            }
          })
        );
        
        setResults(detailedResults || []);
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