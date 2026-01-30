// /entertrack/lib/hooks/use-rawg-games.js
import { useState, useEffect } from 'react';

export const useRAWGSearch = (query, debounceDelay = 500) => {
  const [results, setResults] = useState({
    results: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults({ results: [], loading: false, error: null });
      return;
    }

    const handler = setTimeout(async () => {
      setResults(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(`/api/external/rawg?action=search-games&query=${encodeURIComponent(query)}`);

        if (!response.ok) {
          throw new Error('Failed to search games');
        }

        const data = await response.json();

        setResults({
          results: data.results || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        setResults({
          results: [],
          loading: false,
          error: 'Erro ao buscar jogos',
        });
      }
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceDelay]);

  return results;
};