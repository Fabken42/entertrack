// /entertrack/app/mangas/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent } from '@/components/ui';
import MediaGrid from '@/components/media/MediaGrid';
import MediaFilters from '@/components/media/MediaFilters';
import MediaFormModal from '../../components/forms/media-form/MediaFormModal';
import { useMediaStore } from '@/store/media-store';
import { Plus, RefreshCw, BookOpen } from 'lucide-react';
import SearchResults from '@/components/search/SearchResults';
import InlineSearch from '@/components/search/InlineSearch';
import { useMyAnimeListSearch } from '../../lib/hooks/use-myanimelist';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils/general-utils';

export default function MangasPage() {
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
  const [selectedMangaData, setSelectedMangaData] = React.useState(null);
  const [manualCreateQuery, setManualCreateQuery] = React.useState(null);

  // Estados da busca
  const [inlineSearchQuery, setInlineSearchQuery] = React.useState('');
  const { results: searchResults, loading: searchLoading, error: searchError } = useMyAnimeListSearch(inlineSearchQuery, 'manga');

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

  // Carregar mangás quando a página montar ou usuário mudar
  useEffect(() => {
    if (status === 'authenticated') {
      loadMangas();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const loadMangas = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchMediaByType('manga');
    } catch (error) {
      console.error('Error loading mangas:', error);
      setError(error.message || 'Erro ao carregar mangás');
    } finally {
      setLoading(false);
    }
  };

  // Buscar mangás da biblioteca
  const mangas = getMediaByType('manga');

  // Filtrar mangás
  const filteredMangas = getFilteredMedia({
    mediaType: 'manga',
    status: statusFilter !== 'all' ? statusFilter : undefined,
    searchQuery: searchQuery
  });

  // Estatísticas
  const mangaStats = {
    total: mangas.length,
    planned: mangas.filter(m => m.status === 'planned').length,
    inProgress: mangas.filter(m => m.status === 'in_progress').length,
    completed: mangas.filter(m => m.status === 'completed').length,
    dropped: mangas.filter(m => m.status === 'dropped').length,
  };

  // Calcular estatísticas de volumes e capítulos
  const totalVolumes = mangas.reduce((total, manga) => {
    return total + (manga.specificData?.volumes || 0);
  }, 0);

  const totalChapters = mangas.reduce((total, manga) => {
    return total + (manga.specificData?.chapters || 0);
  }, 0);

  const chaptersRead = mangas.reduce((total, manga) => {
    if (manga.progress?.currentChapter) {
      return total + manga.progress.currentChapter;
    }
    return total;
  }, 0);

  // Handlers
  const handleAddManga = async (data) => {
    try {
      await addMedia(data);
      // Recarregar lista após adicionar
      await fetchMediaByType('manga');
    } catch (error) {
      console.error('Error adding manga:', error);
      throw error;
    }
  };

  const handleEditManga = async (data) => {
    try {
      if (editingMedia && editingMedia._id) {
        await updateMedia(editingMedia._id, data);
        setEditingMedia(null);
      }
    } catch (error) {
      console.error('Error updating manga:', error);
      throw error;
    }
  };

  const handleDeleteManga = async (id) => {
    try {
      if (confirm('Tem certeza que deseja excluir este mangá?')) {
        await deleteMedia(id);
        await fetchMediaByType('manga');
      }
    } catch (error) {
      console.error('Error deleting manga:', error);
      alert('Erro ao excluir mangá: ' + error.message);
    }
  };

  const handleEditClick = (manga) => {
    setEditingMedia(manga);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMedia(null);
    setSelectedMangaData(null);
    setManualCreateQuery(null);
  };

  const handleSelectManga = (mangaData) => {
    setSelectedMangaData(mangaData);
    setManualCreateQuery(null);
    setIsFormOpen(true);
    setInlineSearchQuery('');
  };

  const handleManualCreate = () => {
    if (inlineSearchQuery.trim()) {
      setManualCreateQuery(inlineSearchQuery.trim());
      setSelectedMangaData(null);
      setIsFormOpen(true);
      setInlineSearchQuery('');
    }
  };

  const handleInlineSearch = (query) => {
    setInlineSearchQuery(query);
  };

  const handleRefresh = () => {
    loadMangas();
  };

  // Se não estiver autenticado
  if (status === 'unauthenticated') {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto min-h-screen">
          <div className="text-center py-12 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full border border-red-500/30">
              <span className="text-2xl">🇯🇵</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Acesse sua conta para ver seus mangás
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Faça login para acompanhar sua coleção de mangás e quadrinhos japoneses!
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
                <h1 className="text-3xl font-bold text-white">Mangás</h1>
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
                Acompanhe os mangás que você leu, está lendo ou planeja ler.
              </p>
              {mangaStats.total > 0 && (
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-red-400">
                    📚 {totalVolumes} volumes
                  </span>
                  <span className="text-orange-400">
                    📖 {totalChapters} capítulos
                  </span>
                  {chaptersRead > 0 && (
                    <span className="text-emerald-400">
                      👁️ {chaptersRead} lidos
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="relative w-full sm:w-auto">
              <InlineSearch
                placeholder="Buscar mangás no Jikan..."
                onSearch={handleInlineSearch}
                mediaType="manga"
                className="w-full sm:w-96"
              >
                <SearchResults
                  results={searchResults}
                  loading={searchLoading}
                  error={searchError}
                  mediaType="manga"
                  onSelect={handleSelectManga}
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
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{mangaStats.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{mangaStats.planned}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Planejados</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{mangaStats.inProgress}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Em Progresso</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{mangaStats.completed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Concluídos</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{mangaStats.dropped}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Abandonados</div>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas adicionais de mangás */}
          {mangas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card variant="glass" className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Volumes Totais</p>
                      <p className="text-xl font-bold text-white">{totalVolumes}</p>
                    </div>
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <BookOpen className="w-6 h-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Capítulos Totais</p>
                      <p className="text-xl font-bold text-white">{totalChapters}</p>
                    </div>
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <span className="text-2xl">📖</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Progresso Médio</p>
                      <p className="text-xl font-bold text-white">
                        {totalChapters > 0
                          ? Math.round((chaptersRead / totalChapters) * 100) + '%'
                          : '0%'
                        }
                      </p>
                    </div>
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <span className="text-2xl">📈</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <MediaFilters
            mediaType="manga"
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
              {filteredMangas.length} {filteredMangas.length === 1 ? 'mangá encontrado' : 'mangás encontrados'}
            </p>
            {mangaStats.total > 0 && (
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">
                  {Math.round((mangaStats.completed / mangaStats.total) * 100)}% concluído
                </p>
                {totalVolumes > 0 && (
                  <p className="text-sm text-red-400">
                    {totalVolumes} volumes
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Mangás Grid */}
          <MediaGrid
            media={filteredMangas}
            mediaType="manga"
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteManga}
            emptyMessage={
              searchQuery || statusFilter !== 'all'
                ? "Nenhum mangá encontrado com esses filtros"
                : "Nenhum mangá adicionado ainda. Busque acima para começar!"
            }
            viewMode={viewMode}
          />
        </div>
      </div>

      <MediaFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        mediaType="manga"
        initialData={editingMedia || undefined}
        externalData={selectedMangaData}
        manualCreateQuery={manualCreateQuery}
        onSubmit={editingMedia ? handleEditManga : handleAddManga}
      />
    </>
  );
}