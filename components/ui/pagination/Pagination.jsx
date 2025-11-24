'use client';

import React from 'react';
import Button from '../button/Button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '' 
}) {
  const maxVisiblePages = 5;

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Botão Anterior */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </Button>

      {/* Primeira página */}
      {pageNumbers[0] > 1 && (
        <>
          <Button
            variant={currentPage === 1 ? "primary" : "outline"}
            size="sm"
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
          {pageNumbers[0] > 2 && (
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          )}
        </>
      )}

      {/* Páginas do meio */}
      {pageNumbers.map(page => (
        <Button
          key={page}
          variant={currentPage === page ? "primary" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      {/* Última página */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          )}
          <Button
            variant={currentPage === totalPages ? "primary" : "outline"}
            size="sm"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* Botão Próximo */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1"
      >
        Próximo
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}