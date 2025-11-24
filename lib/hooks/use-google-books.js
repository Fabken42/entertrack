// /entertrack/lib/hooks/use-google-books.js

import { useState, useEffect } from 'react';

export const useGoogleBooksSearch = (query, debounceDelay = 500) => {
  const [results, setResults] = useState({
    books: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults({ books: [], loading: false, error: null });
      return;
    }

    const handler = setTimeout(async () => {
      setResults(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(`/api/external/google-books?action=search-books&query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error('Failed to search books');
        }

        const data = await response.json();
        
        setResults({
          books: data.results || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        setResults({
          books: [],
          loading: false,
          error: 'Erro ao buscar livros',
        });
      }
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceDelay]);

  return results;
};