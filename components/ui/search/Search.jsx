'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Search as SearchIcon, X } from 'lucide-react';
import Input from '../input/Input';

const Search = ({
  value,
  onChange,
  placeholder = 'Pesquisar...',
  className,
  autoFocus = false
}) => {
  const inputRef = React.useRef(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative w-full', className)}>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        icon={SearchIcon}
        className="pr-10"
      />
      
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Search;