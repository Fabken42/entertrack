// /media/media-card/Card.jsx

'use client';
import React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef(
  ({ className, variant = 'glass', ...props }, ref) => {
    const variants = {
      glass: 'glass border-white/10 hover:border-white/20',
      outline: 'border border-white/20 bg-transparent hover:border-white/40',
      elevated: 'glass border-white/10 shadow-lg hover:shadow-xl shadow-blue-500/5',
      solid: 'bg-gray-800/50 border border-white/10 hover:bg-gray-800/80'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-300',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef(
  ({ className, withBorder = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5 p-6',
        withBorder && 'border-b border-white/10',
        className
      )}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

export const CardContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef(
  ({ className, withBorder = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center p-6 pt-0',
        withBorder && 'border-t border-white/10',
        className
      )}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export default Card;