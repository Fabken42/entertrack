'use client';
import React from 'react';
import { cn } from '@/lib/utils';

const ProgressBar = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  labelPosition = 'outside'
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const variants = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="w-full">
      <div className={cn(
        'flex items-center gap-3',
        labelPosition === 'inside' && 'relative'
      )}>
        {showLabel && labelPosition === 'outside' && (
          <span className={cn('font-medium text-gray-300 min-w-12', labelSizes[size])}>
            {Math.round(percentage)}%
          </span>
        )}
        
        <div className={cn(
          'flex-1 bg-gray-700 rounded-full overflow-hidden',
          sizes[size]
        )}>
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              variants[variant]
            )}
            style={{ width: `${percentage}%` }}
          >
            {showLabel && labelPosition === 'inside' && (
              <span className={cn(
                'absolute inset-0 flex items-center justify-center text-white font-medium',
                labelSizes[size]
              )}>
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;