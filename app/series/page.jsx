// /entertrack/app/series/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent } from '@/components/ui';
import MediaGrid from '@/components/media/MediaGrid';
import MediaFilters from '@/components/media/MediaFilters';
import MediaFormModal from '@/components/forms/media-form/MediaFormModal';
import { useMediaStore } from '@/store/media-store';
import { Plus, RefreshCw, Tv, Calendar, Star } from 'lucide-react';
import SearchResults from '@/components/search/SearchResults';
import InlineSearch from '@/components/search/InlineSearch';
import { useTMDBSearch } from '@/lib/hooks/use-tmdb';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

export default function SeriesPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados do filtro
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid');

  // Estados do formulário
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMedia, setEditingMedia] = React.useState(null);
  const [selectedSeriesData, setSelectedSeriesData] = React.useState(null);
  const [manualCreateQuery, setManualCreateQuery] = React.useState(null);

  // Estados da busca
  const [inlineSearchQuery, setInlineSearchQuery] = React.useState('');
  const { results: searchResults, loading: searchLoading, error: searchError } = useTMDBSearch(inlineSearchQuery, 'tv');

  // Usando o store atualizado
  const {
    getMediaByType,
    addMedia,
    updateMedia,
    deleteMedia,
    fetchMediaByType,
    loading: storeLoading,
    error: storeError,
    getStats,
    getFilteredMedia
  } = useMediaStore();

  // Carregar séries quando a página montar ou usuário mudar
  useEffect(() => {
    if (status === 'authenticated') {
      loadSeries();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const loadSeries = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchMediaByType('series');
    } catch (error) {
      console.error('Error loading series:', error);
      setError(error.message || 'Erro ao carregar séries');
    } finally {
      setLoading(false);
    }
  };

  // Buscar séries da biblioteca
  const series = getMediaByType('series');

  // Filtrar séries
  const filteredSeries = getFilteredMedia({
    mediaType: 'series',
    status: statusFilter !== 'all' ? statusFilter : undefined,
    searchQuery: searchQuery
  });

  // Estatísticas
  const seriesStats = {
    total: series.length,
    planned: series.filter(m => m.status === 'planned').length,
    inProgress: series.filter(m => m.status === 'in_progress').length,
    completed: series.filter(m => m.status === 'completed').length,
    dropped: series.filter(m => m.status === 'dropped').length,
  };

  // Calcular estatísticas de séries
  const totalSeasons = series.reduce((total, serie) => {
    return total + (serie.specificData?.seasons || 0);
  }, 0);

  const totalEpisodes = series.reduce((total, serie) => {
    return total + (serie.specificData?.episodes || 0);
  }, 0);

  const episodesWatched = series.reduce((total, serie) => {
    if (serie.progress?.currentEpisode) {
      return total + serie.progress.currentEpisode;
    }
    return total;
  }, 0);

  const averageRating = series.reduce((total, serie) => {
    if (serie.externalData?.apiRating) {
      return total + serie.externalData.apiRating;
    }
    return total;
  }, 0) / (series.filter(s => s.externalData?.apiRating).length || 1);

  // Handlers
  const handleAddSeries = async (data) => {
    try {
      await addMedia(data);
      // Recarregar lista após adicionar
      await fetchMediaByType('series');
    } catch (error) {
      console.error('Error adding series:', error);
      throw error;
    }
  };

  const handleEditSeries = async (data) => {
    try {
      if (editingMedia && editingMedia._id) {
        await updateMedia(editingMedia._id, data);
        setEditingMedia(null);
      }
    } catch (error) {
      console.error('Error updating series:', error);
      throw error;
    }
  };

  const handleDeleteSeries = async (id) => {
    try {
      if (confirm('Tem certeza que deseja excluir esta série?')) {
        await deleteMedia(id);
        await fetchMediaByType('series');
      }
    } catch (error) {
      console.error('Error deleting series:', error);
      alert('Erro ao excluir série: ' + error.message);
    }
  };

  const handleEditClick = (series) => {
    setEditingMedia(series);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMedia(null);
    setSelectedSeriesData(null);
    setManualCreateQuery(null);
  };

  const handleSelectSeries = (seriesData) => {
    setSelectedSeriesData(seriesData);
    setManualCreateQuery(null);
    setIsFormOpen(true);
    setInlineSearchQuery('');
  };

  const handleManualCreate = () => {
    if (inlineSearchQuery.trim()) {
      setManualCreateQuery(inlineSearchQuery.trim());
      setSelectedSeriesData(null);
      setIsFormOpen(true);
      setInlineSearchQuery('');
    }
  };

  const handleInlineSearch = (query) => {
    setInlineSearchQuery(query);
  };

  const handleRefresh = () => {
    loadSeries();
  };

  // Format helper
  const formatEpisodeCount = (episodes) => {
    if (!episodes) return '0';
    if (episodes >= 1000) return `${(episodes / 1000).toFixed(1)}k`;
    return episodes.toString();
  };

  // Se não estiver autenticado
  if (status === 'unauthenticated') {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto min-h-screen">
          <div className="text-center py-12 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full border border-green-500/30">
              <span className="text-2xl">📺</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Acesse sua conta para ver suas séries
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Faça login para acompanhar suas séries favoritas e episódios!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || status === 'loading') {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto min-h-screen">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="h-10 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-8"></div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="max-w-7xl mx-auto min-h-screen">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">Séries</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  loading={loading || storeLoading}
                  className={cn(
                    "opacity-50 hover:opacity-100 transition-opacity",
                    (loading || storeLoading) && "animate-spin"
                  )}
                  icon={RefreshCw}
                />
              </div>
              <p className="text-gray-300 mt-2">
                Acompanhe suas séries favoritas e nunca perca um episódio.
              </p>
              {seriesStats.total > 0 && (
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-green-400">
                    📺 {seriesStats.total} séries
                  </span>
                  <span className="text-teal-400">
                    🎬 {totalSeasons} temporadas
                  </span>
                  <span className="text-emerald-400">
                    👁️ {formatEpisodeCount(episodesWatched)} episódios assistidos
                  </span>
                </div>
              )}
            </div>

            <div className="relative w-full sm:w-auto">
              <InlineSearch
                placeholder="Buscar séries no TMDB..."
                onSearch={handleInlineSearch}
                mediaType="series"
                className="w-full sm:w-96"
              >
                <SearchResults
                  results={searchResults}
                  loading={searchLoading}
                  error={searchError}
                  mediaType="series"
                  onSelect={handleSelectSeries}
                  query={inlineSearchQuery}
                />
              </InlineSearch>
              {inlineSearchQuery && !searchLoading && searchResults.length === 0 && (
                <div className="absolute top-full mt-1 w-full">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                    <p className="text-gray-400 mb-3">
                      Não encontramos "{inlineSearchQuery}"
                    </p>
                    <Button
                      variant="outline"
                      icon={Plus}
                      onClick={handleManualCreate}
                      size="sm"
                      className="w-full"
                    >
                      Adicionar manualmente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{seriesStats.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{seriesStats.planned}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Planejadas</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{seriesStats.inProgress}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Em Progresso</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{seriesStats.completed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Concluídas</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{seriesStats.dropped}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Abandonadas</div>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas adicionais de séries */}
          {series.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card variant="glass" className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Temporadas</p>
                      <p className="text-xl font-bold text-white">{totalSeasons}</p>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Calendar className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Episódios Totais</p>
                      <p className="text-xl font-bold text-white">
                        {formatEpisodeCount(totalEpisodes)}
                      </p>
                    </div>
                    <div className="p-2 bg-teal-500/20 rounded-lg">
                      <Tv className="w-6 h-6 text-teal-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Nota Média TMDB</p>
                      <p className="text-xl font-bold text-white">
                        {averageRating > 0 ? averageRating.toFixed(1) + '/10' : '—'}
                      </p>
                    </div>
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Star className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <MediaFilters
            mediaType="series"
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            className="mb-6"
          />

          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              {filteredSeries.length} {filteredSeries.length === 1 ? 'série encontrada' : 'séries encontradas'}
            </p>
            {seriesStats.total > 0 && (
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">
                  {Math.round((seriesStats.completed / seriesStats.total) * 100)}% concluído
                </p>
                {episodesWatched > 0 && totalEpisodes > 0 && (
                  <p className="text-sm text-teal-400">
                    {Math.round((episodesWatched / totalEpisodes) * 100)}% dos episódios
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Series Grid */}
          <MediaGrid
            media={filteredSeries}
            mediaType="series"
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteSeries}
            emptyMessage={
              searchQuery || statusFilter !== 'all'
                ? "Nenhuma série encontrada com esses filtros"
                : "Nenhuma série adicionada ainda. Busque acima para começar!"
            }
            viewMode={viewMode}
          />
        </div>
      </div>

      <MediaFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        mediaType="series"
        initialData={editingMedia || undefined}
        externalData={selectedSeriesData}
        manualCreateQuery={manualCreateQuery}
        onSubmit={editingMedia ? handleEditSeries : handleAddSeries}
      />
    </>
  );
}