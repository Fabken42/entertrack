'use client';
import React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-gray-800 border border-gray-700',
      outline: 'border border-gray-600 bg-transparent',
      elevated: 'bg-gray-800 shadow-lg border border-gray-600'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg transition-all duration-200',
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
        withBorder && 'border-b border-gray-700',
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
        withBorder && 'border-t border-gray-700',
        className
      )}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export default Card;