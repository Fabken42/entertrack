//to-do: MODIFICAR CONFORME RETORNO DO ANIMES FORM
'use client';
import React from 'react';
import { cn } from '@/lib/utils/general-utils';
import { Star } from 'lucide-react';
import { RATING_LABELS, RATING_OPTIONS } from '@/constants';

const Rating = ({
  value,
  onChange,
  size = 'md',
  readonly = false,
  showLabel = false,
  className
}) => {
  const [hoveredRating, setHoveredRating] = React.useState(null);
  
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const getStarColor = (ratingValue, index) => {
    const currentRating = hoveredRating || value;
    const ratingIndex = RATING_OPTIONS.indexOf(ratingValue);
    const currentIndex = currentRating ? RATING_OPTIONS.indexOf(currentRating) : -1;
    
    if (index <= currentIndex) {
      const gradients = {
        terrible: 'text-red-500',
        bad: 'text-orange-500',
        ok: 'text-yellow-400',
        good: 'text-green-400',
        perfect: 'text-gradient-to-r from-blue-400 to-purple-400'
      };
      return gradients[ratingValue];
    }
    
    return 'text-gray-600';
  };

  const handleRatingClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div 
        className={cn(
          'flex gap-1.5',
          !readonly && 'cursor-pointer'
        )}
      >
        {RATING_OPTIONS.map((rating, index) => (
          <button
            key={rating}
            type="button"
            disabled={readonly}
            onClick={() => handleRatingClick(rating)}
            onMouseEnter={() => !readonly && setHoveredRating(rating)}
            onMouseLeave={() => !readonly && setHoveredRating(null)}
            className={cn(
              'transition-all duration-300 disabled:cursor-default group',
              !readonly && 'hover:scale-110 transform'
            )}
            aria-label={`Rate ${index + 1} stars`}
          >
            <div className="relative">
              <Star
                className={cn(
                  sizes[size],
                  'text-gray-700 transition-all duration-300'
                )}
              />
              <Star
                className={cn(
                  sizes[size],
                  'fill-current absolute inset-0 transition-all duration-300',
                  getStarColor(rating, index),
                  !readonly && 'group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                )}
              />
            </div>
          </button>
        ))}
      </div>
      
      {showLabel && value && (
        <div className="flex items-center gap-2 animate-fade-in">
          <span className={cn(
            'text-sm font-semibold transition-all duration-300',
            'bg-gradient-to-r from-gray-800 to-gray-900 px-3 py-1 rounded-full',
            getStarColor(value, RATING_OPTIONS.indexOf(value))
          )}>
            {RATING_LABELS[value]}
          </span>
          <span className="text-xs text-gray-400">
            ({RATING_OPTIONS.indexOf(value) + 1}/5)
          </span>
        </div>
      )}
    </div>
  );
};

export default Rating;