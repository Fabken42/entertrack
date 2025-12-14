// /app/animes/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent } from '@/components/ui';
import MediaGrid from '@/components/media/MediaGrid';
import MediaFilters from '@/components/media/MediaFilters';
import MediaFormModal from '@/components/forms/media-form/MediaFormModal';
import { useMediaStore } from '@/store/media-store';
import { Plus, RefreshCw } from 'lucide-react';
import InlineSearch from '@/components/search/InlineSearch';
import SearchResults from '@/components/search/SearchResults';
import { useMyAnimeListSearch } from '@/lib/hooks/use-myanimelist'
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

export default function AnimesPage() {
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
  const [selectedAnimeData, setSelectedAnimeData] = React.useState(null);
  const [manualCreateQuery, setManualCreateQuery] = React.useState(null);

  // Estados da busca
  const [inlineSearchQuery, setInlineSearchQuery] = React.useState('');
  const { results: searchResults, loading: searchLoading, error: searchError } = useMyAnimeListSearch(inlineSearchQuery, 'anime');

  // Usando o store atualizado
  const {
    media,
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

  // Carregar animes quando a página montar ou usuário mudar
  useEffect(() => {
    if (status === 'authenticated') {
      loadAnimes();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const loadAnimes = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchMediaByType('anime');
    } catch (error) {
      console.error('Error loading animes:', error);
      setError(error.message || 'Erro ao carregar animes');
    } finally {
      setLoading(false);
    }
  };

  // Buscar animes da biblioteca
  const animes = getMediaByType('anime');

  // Filtrar animes
  const filteredAnimes = getFilteredMedia({
    mediaType: 'anime',
    status: statusFilter !== 'all' ? statusFilter : undefined,
    searchQuery: searchQuery
  });

  // Estatísticas
  const stats = getStats();
  const animeStats = {
    total: animes.length,
    planned: animes.filter(m => m.status === 'planned').length,
    inProgress: animes.filter(m => m.status === 'in_progress').length,
    completed: animes.filter(m => m.status === 'completed').length,
    dropped: animes.filter(m => m.status === 'dropped').length,
  };

  // Handlers
  const handleAddAnime = async (data) => {
    try {
      await addMedia(data);
      // Recarregar lista após adicionar
      await fetchMediaByType('anime');
    } catch (error) {
      console.error('Error adding anime:', error);
      throw error;
    }
  };

  const handleEditAnime = async (data) => {
    try {
      if (editingMedia && editingMedia._id) {
        await updateMedia(editingMedia._id, data);
        setEditingMedia(null);
      }
    } catch (error) {
      console.error('Error updating anime:', error);
      throw error;
    }
  };

  const handleDeleteAnime = async (id) => {
    try {
      if (confirm('Tem certeza que deseja excluir este anime?')) {
        await deleteMedia(id);
        await fetchMediaByType('anime');
      }
    } catch (error) {
      console.error('Error deleting anime:', error);
      alert('Erro ao excluir anime: ' + error.message);
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

  const handleRefresh = () => {
    loadAnimes();
  };

  // Se não estiver autenticado
  if (status === 'unauthenticated') {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto min-h-screen">
          <div className="text-center py-12 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full border border-pink-500/30">
              <span className="text-2xl">🇯🇵</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Acesse sua conta para ver seus animes
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Faça login para acompanhar seus animes, séries, filmes e muito mais!
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
                <h1 className="text-3xl font-bold text-white">Animes</h1>
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
                Acompanhe os animes que você assistiu, está assistindo ou planeja assistir.
              </p>
            </div>

            <div className="relative w-full sm:w-auto">
              <InlineSearch
                placeholder="Buscar animes no Jikan..."
                onSearch={handleInlineSearch}
                mediaType="anime"
                className="w-full sm:w-96"
              >
                <SearchResults
                  results={searchResults}
                  loading={searchLoading}
                  error={searchError}
                  mediaType="anime"
                  onSelect={handleSelectAnime}
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
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{animeStats.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{animeStats.planned}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Planejados</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{animeStats.inProgress}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Em Progresso</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{animeStats.completed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Concluídos</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{animeStats.dropped}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Abandonados</div>
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
            <p className="text-gray-600 dark:text-gray-400">
              {filteredAnimes.length} {filteredAnimes.length === 1 ? 'anime encontrado' : 'animes encontrados'}
            </p>
            {animeStats.total > 0 && (
              <p className="text-sm text-gray-500">
                {Math.round((animeStats.completed / animeStats.total) * 100)}% concluído
              </p>
            )}
          </div>

          {/* Animes Grid */}
          <MediaGrid
            media={filteredAnimes}
            mediaType="anime"
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteAnime}
            emptyMessage={
              searchQuery || statusFilter !== 'all'
                ? "Nenhum anime encontrado com esses filtros"
                : "Nenhum anime adicionado ainda. Busque acima para começar!"
            }
            viewMode={viewMode}
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