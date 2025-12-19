'use client';
import React from 'react';
import { cn } from '@/lib/utils/general-utils';

const Input = React.forwardRef(({ 
  className, 
  label, 
  error, 
  icon: Icon, 
  variant = 'glass', 
  ...props 
}, ref) => {
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
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className="h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-400/70',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-300 hover:border-white/30',
            Icon ? 'pl-10' : 'pl-3',
            variants[variant],
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
            className
          )}
          {...props} // 🔥 Agora só contém props válidas para input
        />
        
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

Input.displayName = 'Input';

export default Input;