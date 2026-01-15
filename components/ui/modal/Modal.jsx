'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/general-utils';
import { X, ArrowLeft } from 'lucide-react';
import Button from '../button/Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  showBackButton = false,
  onBack
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    if (isOpen) { 
      document.body.style.overflow = 'hidden';
      document.documentElement.style.paddingRight = '8px'; // Para evitar conteúdo pulando
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.paddingRight = '0';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.paddingRight = '0';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop com blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-all duration-300 animate-in fade-in-0"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={cn(
          'relative glass-light border border-white/10 rounded-2xl shadow-2xl w-full mx-auto max-h-[90vh] overflow-hidden',
          'animate-in fade-in-90 zoom-in-90 slide-in-from-bottom-10 duration-300',
          sizes[size]
        )}
      >
        {/* Header */}
        {(title || showCloseButton || showBackButton) && (
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-gray-900/80 to-gray-900/50">
            {/* Lado esquerdo: Botão Voltar + Título */}
            <div className="flex items-center gap-3">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="!p-2 hover:bg-white/10 text-white/80 hover:text-white rounded-lg transition-all"
                  icon={ArrowLeft}
                />
              )}
              
              {title && (
                <h2 className="text-xl font-semibold text-gradient-primary">
                  {title}
                </h2>
              )}
            </div>

            {/* Lado direito: Botão Fechar */}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="!p-2 hover:bg-white/10 text-white/80 hover:text-white rounded-lg transition-all"
                icon={X}
              />
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="fade-in">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;