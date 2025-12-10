'use client';

import React from 'react';
import Button from '../button/Button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '' 
}) {
  if (totalPages <= 1) return null;

  // Gerar números de página com máximo 5
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      {/* Botão Anterior */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 transition-all"
        icon={ChevronLeft}
      >
        <span className="hidden sm:inline">Anterior</span>
      </Button>
      
      {/* Botões de página */}
      {pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-2 text-gray-400">
              <MoreHorizontal className="w-4 h-4" />
            </span>
          ) : (
            <Button
              variant={currentPage === page ? "primary" : "ghost"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={cn(
                'min-w-[40px] h-10 px-3 rounded-xl transition-all',
                currentPage === page && 'shadow-lg shadow-blue-500/30'
              )}
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}
      
      {/* Botão Próximo */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 transition-all"
        iconPosition="right"
        icon={ChevronRight}
      >
        <span className="hidden sm:inline">Próximo</span>
      </Button>
    </div>
  );
}