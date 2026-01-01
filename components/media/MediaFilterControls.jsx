// components/media/MediaFilterControls.jsx
'use client';

import { cn } from '@/lib/utils/general-utils';
import { Button } from '@/components/ui';
import { Grid, List, Search } from 'lucide-react';
import { useState } from 'react';

export default function MediaFilterControls({
  statItems,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  sortOptions,
  viewMode,
  onViewModeChange,
  title = 'Status',
  searchQuery = '',
  onSearchChange,
}) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    // Opcional: debounce ou enviar diretamente
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(localSearch);
    }
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <div className="glass mb-8 p-6 rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-xl">
      {title && (
        <div className="mb-6">
          {title && <h3 className="text-xl font-bold text-white mb-2">{title}</h3>}
        </div>
      )}

      {/* Primeira linha: Status */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
          {statItems.map((stat, index) => {
            const isActive = selectedStatus === stat.valueKey;
            return (
              <button
                key={index}
                onClick={() => onStatusChange(stat.valueKey)}
                className={cn(
                  "px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-3 flex-1 min-w-[140px] max-w-[180px]",
                  isActive
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 shadow-lg'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-300",
                  isActive ? stat.activeColor : stat.color
                )}>
                  {/* Ícone SEMPRE com a mesma cor */}
                  <stat.icon className={cn("w-5 h-5", stat.textColor)} />
                </div>
                <div className="text-left flex-1">
                  <div className={cn(
                    "text-2xl font-bold transition-all duration-300",
                    isActive ? 'text-white' : 'text-white' // Ambos brancos
                  )}>
                    {stat.value}
                  </div>
                  <div className={cn(
                    "text-xs font-medium transition-all duration-300",
                    isActive ? 'text-pink-300' : 'text-white/70' // Só muda o texto
                  )}>
                    {stat.label}
                  </div>
                </div>

                {/* Badge indicando status ativo */}
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Segunda linha: Busca, Ordenar por e Visualização */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t border-white/10">
        {/* Buscar pelo título */}
        <div className="w-full sm:w-auto sm:flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                value={localSearch}
                onChange={handleSearchChange}
                placeholder="Buscar pelo título..."
                className="w-full pl-10 pr-10 py-2 bg-gray-800/50 border border-white/10 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Ordenar por */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white whitespace-nowrap">
            Ordenar por:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-gray-800/50 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent min-w-[160px]"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Visualização */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white whitespace-nowrap">
            Visualização:
          </span>
          <div className="flex bg-gray-800/50 rounded-xl p-1.5 border border-white/10">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={`!p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'grid'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              icon={Grid}
            />
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={`!p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'list'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              icon={List}
            />
          </div>
        </div>
      </div>
    </div>
  );
}