'use client';

import React from 'react';
import Button from '../button/Button';
import Select from '../select/Select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils/general-utils';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showPageSelect = true,
}) {
  if (totalPages <= 1) return null;

  // Gerar números de página visíveis com lógica simplificada para 5 botões
  const getVisiblePageNumbers = () => {
    // Se o total de páginas for menor ou igual a 5, mostra todas
    if (totalPages <= 5) {
      const range = [];
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
      return range;
    }

    // Calcular página inicial e final: 2 antes e 2 depois da atual
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Ajustar se estiver muito no início
    if (currentPage <= 3) {
      startPage = 1;
      endPage = 5;
    }

    // Ajustar se estiver muito no final
    if (currentPage >= totalPages - 2) {
      endPage = totalPages;
      startPage = Math.max(1, totalPages - 4);
    }

    // Garantir que temos 5 páginas quando possível
    const pagesCount = endPage - startPage + 1;
    if (pagesCount < 5 && startPage > 1) {
      // Ajustar o início para mostrar mais páginas
      startPage = Math.max(1, startPage - (5 - pagesCount));
    }

    const range = [];
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }

    return range;
  };

  // Gerar opções para o select de páginas
  const generatePageOptions = () => {
    const options = [];
    for (let i = 1; i <= totalPages; i++) {
      options.push({
        value: i,
        label: `${i}`
      });
    }
    return options;
  };

  const visiblePageNumbers = getVisiblePageNumbers();
  const pageOptions = generatePageOptions();

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Navegação principal */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Botões de navegação avançada */}
        <div className="flex items-center gap-1">
          {/* Primeira página */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="min-w-[40px] h-10 rounded-xl"
            icon={ChevronsLeft}
            title="Primeira página"
          />

          {/* Anterior */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="min-w-[40px] h-10 rounded-xl hover:bg-white/10 transition-all"
            icon={ChevronLeft}
            title="Página anterior"
          />
        </div>

        {/* Botões das páginas numéricas */}
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 max-w-full overflow-hidden">

          {/* Páginas visíveis */}
          {visiblePageNumbers.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "primary" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={cn(
                'min-w-[40px] h-10 px-3 rounded-xl transition-all',
                page === currentPage && 'shadow-lg shadow-blue-500/30'
              )}
              title={page === currentPage ? 'Página atual' : `Ir para página ${page}`}
            >
              {page}
            </Button>
          ))}
        </div>

        {/* Botões de navegação avançada (direita) */}
        <div className="flex items-center gap-1">
          {/* Próxima */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="min-w-[40px] h-10 rounded-xl hover:bg-white/10 transition-all"
            icon={ChevronRight}
            title="Próxima página"
          />

          {/* Última página */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="min-w-[40px] h-10 rounded-xl"
            icon={ChevronsRight}
            title="Última página"
          />
        </div>
      </div>

      {/* Seletor de página e informações combinadas */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        {/* Texto "Página" */}
        <div className="flex items-center gap-2">
          <span>Página</span>
        </div>

        {/* Select com números */}
        {showPageSelect && pageOptions.length > 0 && (
          <div className="w-20">
            <Select
              value={currentPage}
              onChange={(e) => onPageChange(Number(e.target.value))}
              options={pageOptions}
              variant="outline"
              className="h-8 py-0"
              aria-label="Selecionar página"
            />
          </div>
        )}

        {/* Texto "de [total]" */}
        <div className="flex items-center gap-2">
          <span>de</span>
          <span className="font-semibold">{totalPages}</span>
        </div>
      </div>
    </div>
  );
}