// /entertrack/lib/hooks/use-discovery.js

import { useState, useEffect } from 'react';

export const useDiscovery = (mediaType, filters = {}) => {
  const [data, setData] = useState({
    items: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchDiscovery = async () => {
      setData(prev => ({ ...prev, loading: true, error: null }));

      try {
        const queryParams = new URLSearchParams({
          ...filters,
          mediaType
        });

        const response = await fetch(`/api/discover/${mediaType}?${queryParams}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch discovery data');
        }

        const result = await response.json();
        
        setData({
          items: result.results || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        setData({
          items: [],
          loading: false,
          error: error.message,
        });
      }
    };

    fetchDiscovery();
  }, [mediaType, JSON.stringify(filters)]); // JSON.stringify para comparar objetos

  return data;
};