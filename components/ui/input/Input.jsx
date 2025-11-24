'use client';
import React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, label, error, icon: Icon, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'border-gray-600 focus:border-blue-500 focus:ring-blue-500',
    outline: 'border-gray-500 focus:border-blue-400 focus:ring-blue-400'
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
            Icon ? 'pl-10' : 'pl-3',
            variants[variant],
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;