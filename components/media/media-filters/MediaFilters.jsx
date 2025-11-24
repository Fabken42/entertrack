'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button, Select, Search } from '@/components/ui';
import { Filter, Grid, List } from 'lucide-react';

const STATUS_OPTIONS = [ 
  { value: 'all', label: 'Todos' },
  { value: 'planned', label: 'Planejados' },
  { value: 'in_progress', label: 'Em Progresso' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'dropped', label: 'Abandonados' },
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
  return (
  <div className={cn('bg-gray-800 p-4 rounded-lg border border-gray-700', className)}>
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
      {/* Search */}
      <div className="w-full lg:w-80">
        <Search
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={`Pesquisar ${mediaType}s...`}
        />
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        {/* Status Filter */}
        <div className="w-full sm:w-48">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300 whitespace-nowrap">Visualização:</span>
          <div className="flex bg-gray-700 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={cn(
                '!p-2',
                viewMode === 'grid' && 'bg-gray-600 shadow-sm'
              )}
              icon={Grid}
            />
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={cn(
                '!p-2',
                viewMode === 'list' && 'bg-gray-600 shadow-sm'
              )}
              icon={List}
            />
          </div>
        </div>

        {/* Add Button */}
        <Button variant="primary" icon={Filter}>
          Filtrar
        </Button>
      </div>
    </div>
  </div>
);
};

export default MediaFilters;