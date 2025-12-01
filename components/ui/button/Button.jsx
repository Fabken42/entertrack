'use client';
import React from 'react';
import { cn } from '@/lib/utils';

const Button = React.forwardRef(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    children,
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'; // 🔥 ADICIONE cursor-pointer AQUI
    
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring focus:ring-offset-background',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-ring focus:ring-offset-background',
      outline: 'border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-ring focus:ring-offset-background',
      ghost: 'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-ring focus:ring-offset-background',
      danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive focus:ring-offset-background'
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          loading && 'cursor-wait',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {!loading && Icon && iconPosition === 'left' && (
          <Icon className="w-4 h-4" />
        )}
        {children}
        {!loading && Icon && iconPosition === 'right' && (
          <Icon className="w-4 h-4" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;