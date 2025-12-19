'use client';

import React from 'react';
import { cn } from '@/lib/utils/general-utils';
import { Search as SearchIcon, X } from 'lucide-react';

const Search = ({
  value,
  onChange,
  placeholder = 'Pesquisar...',
  className,
  autoFocus = false,
  variant = 'glass'
}) => {
  const inputRef = React.useRef(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const variants = {
    glass: 'glass border-white/10 focus-within:border-blue-400',
    outline: 'bg-gray-900/50 border-white/20 focus-within:border-blue-500',
    solid: 'bg-gray-800 border-gray-600 focus-within:border-blue-500'
  };

  return (
    <div className={cn('relative w-full group', className)}>
      <div className={cn(
        'relative flex items-center rounded-xl border transition-all duration-300 hover:border-white/30 focus-within:shadow-lg focus-within:shadow-blue-500/20',
        variants[variant]
      )}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full h-11 bg-transparent pl-10 pr-10 text-sm text-white placeholder:text-gray-400/70',
            'focus:outline-none focus:ring-0 border-none'
          )}
        />
        
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors hover:scale-110"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Dica de atalho */}
      <div className="absolute right-3 -bottom-6 text-xs text-gray-500 opacity-0 group-focus-within:opacity-100 transition-opacity">
        Pressione <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">ESC</kbd> para limpar
      </div>
    </div>
  );
};

export default Search;