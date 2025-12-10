'use client';

import React from 'react';
import { Button, Card, CardContent } from '@/components/ui';
import MediaGrid from '@/components/media/media-grid/MediaGrid';
import MediaFilters from '@/components/media/media-filters/MediaFilters';
import MediaFormModal from '@/components/forms/media-form/MediaFormModal';
import { useMediaStore } from '@/store/media-store';
import { Plus } from 'lucide-react';
import InlineSearch from '@/components/search/InlineSearch';
import SearchResults from '@/components/search/SearchResults';
import { useMyAnimeListSearch } from '@/lib/hooks/use-myanimelist';

export default function AnimesPage() {
  const { getMediaByType, addMedia, updateMedia } = useMediaStore();
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [manualCreateQuery, setManualCreateQuery] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMedia, setEditingMedia] = React.useState(null);
  const [inlineSearchQuery, setInlineSearchQuery] = React.useState('');
  const { results, loading, error } = useMyAnimeListSearch(inlineSearchQuery, 'anime');
  const [selectedAnimeData, setSelectedAnimeData] = React.useState(null);
  const animes = getMediaByType('anime');

  const filteredAnimes = animes.filter(anime => {
    const matchesStatus = statusFilter === 'all' || anime.status === statusFilter;
    const matchesSearch = anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (anime.genres && anime.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: animes.length,
    planned: animes.filter(m => m.status === 'planned').length,
    inProgress: animes.filter(m => m.status === 'in_progress').length,
    completed: animes.filter(m => m.status === 'completed').length,
    dropped: animes.filter(m => m.status === 'dropped').length,
  };

  const handleAddAnime = async (data) => {
    await addMedia({
      ...data,
      userId: 'user-1',
      mediaType: 'anime',
    });
  };

  const handleEditAnime = async (data) => {
    if (editingMedia) {
      await updateMedia(editingMedia.id, data);
      setEditingMedia(null);
    }
  };

  const handleEditClick = (anime) => {
    setEditingMedia(anime);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMedia(null);
    setSelectedAnimeData(null);
    setManualCreateQuery(null);
  };

  const handleSelectAnime = (animeData) => {
    setSelectedAnimeData(animeData);
    setManualCreateQuery(null);
    setIsFormOpen(true);
    setInlineSearchQuery('');
  };

  const handleManualCreate = () => {
    if (inlineSearchQuery.trim()) {
      setManualCreateQuery(inlineSearchQuery.trim());
      setSelectedAnimeData(null);
      setIsFormOpen(true);
      setInlineSearchQuery('');
    }
  };

  const handleInlineSearch = (query) => {
    setInlineSearchQuery(query);
  };

  return (
    <>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Animes</h1>
              <p className="text-gray-300 mt-2">
                Acompanhe os animes que você assistiu, está assistindo ou planeja assistir.
              </p>
            </div>
            <div className="relative w-full sm:w-auto">
              <InlineSearch
                placeholder="Buscar animes no MyAnimeList..."
                onSearch={handleInlineSearch}
                mediaType="anime"
                className="w-full sm:w-96"
              >
                <SearchResults
                  results={results}
                  loading={loading}
                  error={error}
                  mediaType="anime"
                  onSelect={handleSelectAnime}
                  query={inlineSearchQuery}
                />
              </InlineSearch>
              {inlineSearchQuery && !loading && results.length === 0 && (
                <div className="absolute top-full mt-1 w-full">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                    <p className="text-gray-400 mb-3">
                      Não encontramos "{inlineSearchQuery}" no MyAnimeList
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
            mediaType="anime"
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
              {filteredAnimes.length} {filteredAnimes.length === 1 ? 'anime encontrado' : 'animes encontrados'}
            </p>
          </div>

          {/* Animes Grid */}
          <MediaGrid
            media={filteredAnimes}
            onEditClick={handleEditClick}
            emptyMessage={
              searchQuery || statusFilter !== 'all'
                ? "Nenhum anime encontrado com esses filtros"
                : "Nenhum anime adicionado ainda"
            }
          />
        </div>
      </div>

      <MediaFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        mediaType="anime"
        initialData={editingMedia || undefined}
        externalData={selectedAnimeData}
        manualCreateQuery={manualCreateQuery}
        onSubmit={editingMedia ? handleEditAnime : handleAddAnime}
      />
    </>
  );
}