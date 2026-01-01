// InlineSearch.js
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/general-utils';

const InlineSearch = ({
  placeholder = 'Buscar...', 
  onSearch,
  delay = 300,
  className = '',
  children,
  onFocus,
  onBlur
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
        if (onBlur) onBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onBlur]);

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
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  return (
    <div className={cn('relative group', className)} ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
        </div>
        
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          className="pl-10 pr-10"
          variant="glass"
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors hover:scale-110"
            type="button"
            aria-label="Limpar busca"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {children && isFocused && query && (
        <div className="absolute z-50 w-full mt-2 fade-in slide-up">
          {children}
        </div>
      )}
    </div>
  );
};

export default InlineSearch;