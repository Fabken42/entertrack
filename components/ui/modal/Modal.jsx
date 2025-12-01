'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X, ArrowLeft } from 'lucide-react';
import Button from '../button/Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  showBackButton = false, // 👈 Nova prop
  onBack // 👈 Nova prop
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-70 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={cn(
          'relative bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-hidden animate-in fade-in-90 zoom-in-90',
          sizes[size]
        )}
      >
        {/* Header */}
        {(title || showCloseButton || showBackButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            {/* Botão Voltar - lado esquerdo */}
            <div className="flex items-center">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="!p-1 hover:bg-gray-700 text-gray-300 mr-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              
              {title && (
                <h2 className="text-lg font-semibold text-white">
                  {title}
                </h2>
              )}
            </div>

            {/* Botão Fechar - lado direito */}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="!p-1 hover:bg-gray-700 text-gray-300"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;