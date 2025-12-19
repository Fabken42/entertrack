'use client';

import React from 'react';
import { cn } from '@/lib/utils/general-utils';

const Textarea = React.forwardRef(({
  className,
  label, 
  error,
  helperText,
  required,
  disabled,
  variant = 'glass',
  ...props
}, ref) => {
  const textareaId = React.useId();

  const variants = {
    glass: 'glass border-white/10 focus:border-blue-400 focus:ring-blue-400/30',
    outline: 'border-white/20 focus:border-blue-500 focus:ring-blue-500/30 bg-gray-900/50',
    solid: 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 bg-gray-800'
  };

  return (
    <div className="space-y-2 group">
      {label && (
        <label
          htmlFor={textareaId}
          className={cn(
            "block text-sm font-medium",
            error ? "text-red-400" : "text-white/90",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          className={cn(
            "w-full px-4 py-3 text-sm text-white placeholder:text-gray-400/70",
            "rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-900",
            "transition-all duration-300 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed",
            "resize-y min-h-[100px]",
            variants[variant],
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        
        {/* Indicador de contador de caracteres */}
        {props.maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-gray-900/80 px-2 py-1 rounded">
            {props.value?.length || 0}/{props.maxLength}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={cn(
          "text-sm flex items-center gap-2 animate-fade-in",
          error ? "text-red-400" : "text-gray-400"
        )}>
          {error ? (
            <>
              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
              {error}
            </>
          ) : helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;