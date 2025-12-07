// /components/ui/Textarea.jsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef(({
  className,
  label,
  error,
  helperText,
  required,
  disabled,
  ...props
}, ref) => {
  const textareaId = React.useId();

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={textareaId}
          className={cn(
            "block text-sm font-medium",
            error ? "text-red-400" : "text-gray-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900",
          "text-white placeholder-gray-400",
          error
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-gray-600 focus:ring-blue-500 focus:border-blue-500",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      />

      {(error || helperText) && (
        <p className={cn(
          "text-sm",
          error ? "text-red-400" : "text-gray-400"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;