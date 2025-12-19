'use client';
import React from 'react';
import { cn } from '@/lib/utils/general-utils';

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
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover-lift';
    
    const variants = {
      primary: 'bg-gradient-primary text-white hover:bg-gradient-secondary focus:ring-blue-500/50 focus:ring-offset-gray-900 shadow-lg shadow-blue-500/20',
      secondary: 'bg-gradient-secondary text-white hover:opacity-90 focus:ring-purple-500/50 focus:ring-offset-gray-900 shadow-lg shadow-purple-500/20',
      outline: 'border border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/30 focus:ring-white/50 focus:ring-offset-gray-900',
      ghost: 'bg-transparent text-white/80 hover:text-white hover:bg-white/10 focus:ring-white/50 focus:ring-offset-gray-900',
      danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus:ring-red-500/50 focus:ring-offset-gray-900 shadow-lg shadow-red-500/20',
      success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 focus:ring-green-500/50 focus:ring-offset-gray-900 shadow-lg shadow-green-500/20'
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
      md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
      lg: 'px-6 py-3.5 text-base gap-2.5 rounded-xl',
      xl: 'px-8 py-4 text-lg gap-3 rounded-2xl'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          loading && 'cursor-wait',
          'relative overflow-hidden group',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {/* Efeito de brilho no hover */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
        
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {!loading && Icon && iconPosition === 'left' && (
          <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
        )}
        <span className="relative z-10">{children}</span>
        {!loading && Icon && iconPosition === 'right' && (
          <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;