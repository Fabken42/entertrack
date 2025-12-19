// /lib/hooks/use-myanimelist.js
'use client';
import { useState, useEffect } from 'react';

export const useMyAnimeListSearch = (query, mediaType = 'anime', debounceDelay = 500) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const action = mediaType === 'anime' ? 'search-anime' : 'search-manga';
        const response = await fetch(
          `/api/external/myanimelist?action=${action}&query=${encodeURIComponent(query)}&limit=10`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to search ${mediaType}`);
        }

        const data = await response.json();
        
        // Extrair apenas os resultados da resposta
        const searchResults = data.results || data.data || [];
        
        setResults(searchResults);
      } catch (error) {
        setError(`Erro ao buscar ${mediaType === 'anime' ? 'animes' : 'mangás'}: ${error.message}`);
        console.error('MyAnimeList search error:', error);
      } finally {
        setLoading(false);
      }
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [query, mediaType, debounceDelay]);

  return { results, loading, error };
};