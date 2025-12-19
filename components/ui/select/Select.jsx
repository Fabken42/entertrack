'use client';
import React from 'react';
import { cn } from '@/lib/utils/general-utils';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({ className, label, error, options, variant = 'glass', ...props }, ref) => {
  // Remover duplicatas
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

  const variants = {
    glass: 'glass border-white/10 focus:border-blue-400 focus:ring-blue-400/30',
    outline: 'border-white/20 focus:border-blue-500 focus:ring-blue-500/30 bg-gray-900/50',
    solid: 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 bg-gray-800'
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/90">
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-xl border px-3 py-2.5 text-sm text-white appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-300 hover:border-white/30 cursor-pointer',
            'pr-10',
            variants[variant],
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
            className
          )}
          {...props}
        >
          {uniqueOptions.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              className="bg-gray-900 text-white py-2"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Ícone de seta */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
        </div>
        
        {/* Efeito de brilho na borda */}
        <div className={cn(
          "absolute inset-0 rounded-xl pointer-events-none",
          "border border-transparent group-hover:border-white/10 transition-all duration-300",
          error ? "group-focus-within:border-red-500/30" : "group-focus-within:border-blue-500/30"
        )}></div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400 flex items-center gap-2 animate-fade-in">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;