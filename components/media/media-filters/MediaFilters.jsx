'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button, Select, Search } from '@/components/ui';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';

const STATUS_OPTIONS = [ 
  { value: 'all', label: 'Todos os Status' },
  { value: 'planned', label: '🟡 Planejados' },
  { value: 'in_progress', label: '🔵 Em Progresso' },
  { value: 'completed', label: '🟢 Concluídos' },
  { value: 'dropped', label: '🔴 Abandonados' },
];

const MediaFilters = ({
  mediaType,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  className,
}) => {
  const getMediaTypeLabel = () => {
    const labels = {
      anime: 'Animes',
      movie: 'Filmes',
      series: 'Séries',
      manga: 'Mangás',
      book: 'Livros',
      game: 'Jogos'
    };
    return labels[mediaType] || 'Conteúdos';
  };

  return (
    <div className={cn('glass border border-white/10 rounded-2xl p-6', className)}>
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        {/* Título e contador */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <SlidersHorizontal className="w-5 h-5 text-white/80" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Filtros de {getMediaTypeLabel()}</h3>
            <p className="text-sm text-white/60">Ajuste sua visualização</p>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full lg:w-auto">
          {/* Search */}
          <div className="md:col-span-1">
            <Search
              value={searchQuery}
              onChange={onSearchChange}
              placeholder={`Buscar ${getMediaTypeLabel().toLowerCase()}...`}
              variant="glass"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-1">
            <Select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              options={STATUS_OPTIONS}
              variant="glass"
            />
          </div>

          {/* View Mode and Actions */}
          <div className="md:col-span-1 flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                  className={cn(
                    '!p-2 !rounded-lg transition-all',
                    viewMode === 'grid' && 'shadow-lg shadow-blue-500/20'
                  )}
                  icon={Grid}
                  aria-label="Visualização em grade"
                />
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                  className={cn(
                    '!p-2 !rounded-lg transition-all',
                    viewMode === 'list' && 'shadow-lg shadow-blue-500/20'
                  )}
                  icon={List}
                  aria-label="Visualização em lista"
                />
              </div>
            </div>

            {/* Filter Button */}
            <Button 
              variant="outline" 
              size="sm"
              className="whitespace-nowrap"
              icon={Filter}
            >
              Mais Filtros
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaFilters;