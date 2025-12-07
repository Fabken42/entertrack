'use client';
import React from 'react';
import { cn } from '@/lib/utils';

const Select = React.forwardRef(({ className, label, error, options, ...props }, ref) => {
  // 🔥 REMOVER DUPLICATAS das options antes de renderizar
  const uniqueOptions = React.useMemo(() => {
    const seen = new Set();
    return options.filter(option => {
      if (seen.has(option.value)) {
        console.warn(`⚠️ Select: Duplicate option value found: ${option.value} - ${option.label}`);
        return false;
      }
      seen.add(option.value);
      return true;
    });
  }, [options]);

  console.log('🔍 Select options:', { original: options.length, unique: uniqueOptions.length });

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {uniqueOptions.map((option, index) => (
          // 🔥 Adicionar index ao key para garantir unicidade mesmo com valores duplicados
          <option 
            key={`${option.value}-${index}-${Math.random().toString(36).substr(2, 9)}`} 
            value={option.value} 
            className="bg-gray-800 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;