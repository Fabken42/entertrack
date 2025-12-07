'use client';

import React from 'react';
import Button from '../button/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '' 
}) {
  if (totalPages <= 1) return null;

  // Função otimizada para gerar sempre 7 páginas
  const getSevenPageNumbers = () => {
    // Se total de páginas for 7 ou menos, retornar todas
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pages = [1, totalPages]; // Primeira e última sempre
    
    // Lógica específica baseada na página atual
    if (currentPage === 1) {
      // Página 1: 1, 2, 3, 5, 10, 15, última
      const pattern = [2, 3, 5, 10, 15].filter(p => p < totalPages);
      return [...new Set([1, ...pattern, totalPages])].slice(0, 7);
    }
    
    if (currentPage === totalPages) {
      // Última página: primeira, última-14, última-9, última-4, última-2, última-1, última
      const pattern = [
        totalPages - 14,
        totalPages - 9,
        totalPages - 4,
        totalPages - 2,
        totalPages - 1
      ].filter(p => p > 1);
      
      const result = [...new Set([1, ...pattern, totalPages])];
      return result.length >= 7 ? result.slice(-7) : result;
    }
    
    // Para páginas no meio: primeira, atual-6, atual-1, atual, atual+1, atual+6, última
    const middlePages = [
      currentPage - 6,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 6
    ].filter(p => p > 1 && p < totalPages);
    
    const allPages = [...new Set([1, ...middlePages, totalPages])];
    
    // Garantir que temos exatamente 7 páginas
    if (allPages.length < 7) {
      // Completar com páginas próximas
      let added = 0;
      let offset = 2;
      
      while (allPages.length < 7 && added < 10) {
        // Tentar adicionar páginas simétricas ao redor
        if (currentPage - offset > 1 && !allPages.includes(currentPage - offset)) {
          allPages.push(currentPage - offset);
          allPages.sort((a, b) => a - b);
        }
        
        if (currentPage + offset < totalPages && !allPages.includes(currentPage + offset)) {
          allPages.push(currentPage + offset);
          allPages.sort((a, b) => a - b);
        }
        
        offset++;
        added++;
      }
    }
    
    // Se ainda temos mais de 7, pegar as 7 mais relevantes
    if (allPages.length > 7) {
      // Manter primeira, atual, última e as mais próximas da atual
      const importantPages = new Set([1, currentPage, totalPages]);
      
      // Adicionar as 4 páginas mais próximas da atual
      const distances = allPages
        .filter(p => p !== 1 && p !== totalPages && p !== currentPage)
        .map(p => ({ page: p, distance: Math.abs(p - currentPage) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4)
        .map(item => item.page);
      
      return [...importantPages, ...distances].sort((a, b) => a - b);
    }
    
    return allPages.sort((a, b) => a - b);
  };

  // Renderização simplificada
  const pageNumbers = getSevenPageNumbers();

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
        
      </Button>
      
      {/* Botões de página - SEM ELIPSES */}
      {pageNumbers.map(page => (
        <Button
          key={page}
          variant={currentPage === page ? "primary" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          className="min-w-[40px] px-3"
        >
          {page}
        </Button>
      ))}
      
      {/* Botão Próximo */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1"
      >
        
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}