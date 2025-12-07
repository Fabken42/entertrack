'use client';

import React from 'react';
import { Layout } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';
import MediaGrid from '@/components/media/media-grid/MediaGrid';
import MediaFilters from '@/components/media/media-filters/MediaFilters';
import MediaFormModal from '@/components/forms/media-form/MediaFormModal';
import { useMediaStore } from '@/store/media-store';
import { Plus } from 'lucide-react';
import SearchResults from '@/components/search/SearchResults';
import InlineSearch from '@/components/search/InlineSearch';
import { useTMDBSearch } from '@/lib/hooks/use-tmdb'; // Importe o hook

export default function SeriesPage() {
  const { getMediaByType, addMedia, updateMedia } = useMediaStore();
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [manualCreateQuery, setManualCreateQuery] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMedia, setEditingMedia] = React.useState(null);
  const [selectedSeriesData, setSelectedSeriesData] = React.useState(null);
  const [inlineSearchQuery, setInlineSearchQuery] = React.useState('');
  
  // Use o hook com mediaType='series'
  const { results, loading, error } = useTMDBSearch(inlineSearchQuery, 'series');
  
  const series = getMediaByType('series');

  const filteredSeries = series.filter(item => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.genres && item.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: series.length,
    planned: series.filter(m => m.status === 'planned').length,
    inProgress: series.filter(m => m.status === 'in_progress').length,
    completed: series.filter(m => m.status === 'completed').length,
    dropped: series.filter(m => m.status === 'dropped').length,
  };

  const handleSelectSeries = (seriesData) => {
    setSelectedSeriesData(seriesData);
    setManualCreateQuery(null);
    setIsFormOpen(true);
    setInlineSearchQuery('');
  };

  const handleAddSeries = async (data) => {
    await addMedia({
      ...data,
      userId: 'user-1',
      mediaType: 'series',
    });
  };

  const handleEditSeries = async (data) => {
    if (editingMedia) {
      await updateMedia(editingMedia.id, data);
      setEditingMedia(null);
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

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Séries</h1>
              <p className="text-gray-300 mt-2">
                Acompanhe suas séries favoritas e nunca perca um episódio.
              </p>
            </div>
            <div className="relative w-full sm:w-auto">
              <InlineSearch
                placeholder="Buscar séries no TMDB..."
                onSearch={handleInlineSearch}
                mediaType="series"
                className="w-full sm:w-96"
              >
                <SearchResults
                  results={results}
                  loading={loading}
                  error={error}
                  mediaType="series"
                  onSelect={handleSelectSeries}
                  query={inlineSearchQuery}
                />
              </InlineSearch>
              {inlineSearchQuery && !loading && results.length === 0 && (
                <div className="absolute top-full mt-1 w-full">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                    <p className="text-gray-400 mb-3">
                      Não encontramos "{inlineSearchQuery}" no TMDB
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
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.planned}</div>
                <div className="text-sm text-gray-600">Planejados</div>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                <div className="text-sm text-gray-600">Em Progresso</div>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Concluídos</div>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.dropped}</div>
                <div className="text-sm text-gray-600">Abandonados</div>
              </CardContent>
            </Card>
          </div>

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
            <p className="text-gray-600">
              {filteredSeries.length} {filteredSeries.length === 1 ? 'série encontrada' : 'séries encontradas'}
            </p>
          </div>

          {/* Series Grid */}
          <MediaGrid
            media={filteredSeries}
            onEditClick={handleEditClick}
            emptyMessage={
              searchQuery || statusFilter !== 'all'
                ? "Nenhuma série encontrada com esses filtros"
                : "Nenhuma série adicionada ainda"
            }
          />

          {/* Form Modal */}
          <MediaFormModal
            isOpen={isFormOpen}
            onClose={handleFormClose}
            mediaType="series"
            initialData={editingMedia || undefined}
            externalData={selectedSeriesData}
            manualCreateQuery={manualCreateQuery}
            onSubmit={editingMedia ? handleEditSeries : handleAddSeries}
          />
        </div>
      </div>
    </Layout>
  );
}