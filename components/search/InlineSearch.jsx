'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui';
import { Search, X } from 'lucide-react';

const InlineSearch = ({
  placeholder = 'Buscar...',
  onSearch,
  delay = 300,
  className = '',
  mediaType,
  children
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim()) {
      timeoutRef.current = setTimeout(() => {
        onSearch(query.trim());
      }, delay);
    } else {
      onSearch('');
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, delay, onSearch]);

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white w-full"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {children && isFocused && query && (
        <div className="absolute z-50 w-full mt-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default InlineSearch;