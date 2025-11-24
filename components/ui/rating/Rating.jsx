import React from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { RATING_LABELS } from '@/constants';

const RATING_OPTIONS = ['terrible', 'bad', 'ok', 'good', 'great', 'perfect'];

const Rating = ({
  value,
  onChange,
  size = 'md',
  readonly = false,
  showLabel = false
}) => {
  const [hoveredRating, setHoveredRating] = React.useState(null);
  
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const getStarColor = (ratingValue, index) => {
    const currentRating = hoveredRating || value;
    const ratingIndex = RATING_OPTIONS.indexOf(ratingValue);
    const currentIndex = currentRating ? RATING_OPTIONS.indexOf(currentRating) : -1;
    
    if (index <= currentIndex) {
      const colors = {
        terrible: 'text-red-500',
        bad: 'text-orange-500',
        ok: 'text-yellow-500',
        good: 'text-lime-500',
        great: 'text-green-500',
        perfect: 'text-blue-500'
      };
      return colors[ratingValue];
    }
    
    return 'text-gray-600';
  };

  const handleRatingClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div 
        className={cn(
          'flex gap-1',
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
              'transition-colors duration-150 disabled:cursor-default',
              !readonly && 'hover:scale-110 transform transition-transform'
            )}
          >
            <Star
              className={cn(
                sizes[size],
                'fill-current transition-colors duration-150',
                getStarColor(rating, index)
              )}
            />
          </button>
        ))}
      </div>
      
      {showLabel && value && (
        <span className={cn(
          'text-sm font-medium transition-colors duration-150',
          getStarColor(value, RATING_OPTIONS.indexOf(value))
        )}>
          {RATING_LABELS[value]}
        </span>
      )}
    </div>
  );
};

export default Rating;