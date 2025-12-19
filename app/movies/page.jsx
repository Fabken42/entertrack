// /entertrack/app/movies/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent } from '@/components/ui';
import MediaGrid from '@/components/media/MediaGrid';
import MediaFilters from '@/components/media/MediaFilters';
import MediaFormModal from '@/components/forms/media-form/MediaFormModal';
import { useMediaStore } from '@/store/media-store';
import { Plus, RefreshCw, Clock, Star } from 'lucide-react';
import SearchResults from '@/components/search/SearchResults';
import InlineSearch from '@/components/search/InlineSearch';
import { useTMDBSearch } from '@/lib/hooks/use-tmdb';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils/general-utils';

export default function MoviesPage() {
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
  const [selectedMovieData, setSelectedMovieData] = React.useState(null);
  const [manualCreateQuery, setManualCreateQuery] = React.useState(null);

  // Estados da busca
  const [inlineSearchQuery, setInlineSearchQuery] = React.useState('');
  const { results: searchResults, loading: searchLoading, error: searchError } = useTMDBSearch(inlineSearchQuery, 'movie');

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

  // Carregar filmes quando a página montar ou usuário mudar
  useEffect(() => {
    if (status === 'authenticated') {
      loadMovies();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const transformTMDBToFormData = (tmdbData) => {
    return {
      externalId: tmdbData.id?.toString(),
      title: tmdbData.title,
      description: tmdbData.description || tmdbData.overview,
      imageUrl: tmdbData.imageUrl,
      releaseYear: tmdbData.releaseYear,
      genres: tmdbData.genres || [],
      mediaType: 'movie',
      apiRating: tmdbData.apiRating || tmdbData.vote_average,
      apiVoteCount: tmdbData.apiVoteCount || tmdbData.vote_count,
      runtime: tmdbData.runtime,
      synopsis: tmdbData.description || tmdbData.overview,
    };
  };

  const loadMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchMediaByType('movie');
    } catch (error) {
      console.error('Error loading movies:', error);
      setError(error.message || 'Erro ao carregar filmes');
    } finally {
      setLoading(false);
    }
  };

  // Buscar filmes da biblioteca
  const movies = getMediaByType('movie');

  // Filtrar filmes
  const filteredMovies = getFilteredMedia({
    mediaType: 'movie',
    status: statusFilter !== 'all' ? statusFilter : undefined,
    searchQuery: searchQuery
  });

  // Estatísticas
  const movieStats = {
    total: movies.length,
    planned: movies.filter(m => m.status === 'planned').length,
    inProgress: movies.filter(m => m.status === 'in_progress').length,
    completed: movies.filter(m => m.status === 'completed').length,
    dropped: movies.filter(m => m.status === 'dropped').length,
  };

  // Calcular estatísticas de filmes
  const totalRuntime = movies.reduce((total, movie) => {
    return total + (movie.specificData?.runtime || 0);
  }, 0);

  const averageRating = movies.reduce((total, movie) => {
    if (movie.externalData?.apiRating) {
      return total + movie.externalData.apiRating;
    }
    return total;
  }, 0) / (movies.filter(m => m.externalData?.apiRating).length || 1);

  const watchedTime = movies.reduce((total, movie) => {
    if (movie.progress?.currentTime) {
      return total + movie.progress.currentTime;
    }
    return total;
  }, 0);

  // Handlers
  const handleAddMovie = async (data) => {
    try {
      await addMedia(data);
      // Recarregar lista após adicionar
      await fetchMediaByType('movie');
    } catch (error) {
      console.error('Error adding movie:', error);
      throw error;
    }
  };

  const handleEditMovie = async (data) => {
    try {
      if (editingMedia && editingMedia._id) {
        await updateMedia(editingMedia._id, data);
        setEditingMedia(null);
      }
    } catch (error) {
      console.error('Error updating movie:', error);
      throw error;
    }
  };

  const handleDeleteMovie = async (id) => {
    try {
      if (confirm('Tem certeza que deseja excluir este filme?')) {
        await deleteMedia(id);
        await fetchMediaByType('movie');
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Erro ao excluir filme: ' + error.message);
    }
  };

  const handleEditClick = (movie) => {
    setEditingMedia(movie);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMedia(null);
    setSelectedMovieData(null);
    setManualCreateQuery(null);
  };

  const handleSelectMovie = (movieData) => {
    const transformedData = transformTMDBToFormData(movieData);
    setSelectedMovieData(transformedData);
    setManualCreateQuery(null);
    setIsFormOpen(true);
    setInlineSearchQuery('');
  };

  const handleManualCreate = () => {
    if (inlineSearchQuery.trim()) {
      setManualCreateQuery(inlineSearchQuery.trim());
      setSelectedMovieData(null);
      setIsFormOpen(true);
      setInlineSearchQuery('');
    }
  };

  const handleInlineSearch = (query) => {
    setInlineSearchQuery(query);
  };

  const handleRefresh = () => {
    loadMovies();
  };

  // Format helpers
  const formatRuntime = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };



  // Se não estiver autenticado
  if (status === 'unauthenticated') {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto min-h-screen">
          <div className="text-center py-12 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30">
              <span className="text-2xl">🎬</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Acesse sua conta para ver seus filmes
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Faça login para acompanhar sua coleção de filmes e críticas!
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
                <h1 className="text-3xl font-bold text-white">Filmes</h1>
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
                Acompanhe os filmes que você assistiu, está assistindo ou planeja assistir.
              </p>
              {movieStats.total > 0 && (
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-blue-400">
                    🎬 {movieStats.total} filmes
                  </span>
                  <span className="text-cyan-400">
                    ⏱️ {formatRuntime(totalRuntime)}
                  </span>
                  {watchedTime > 0 && (
                    <span className="text-emerald-400">
                      👁️ {formatRuntime(watchedTime)} assistidos
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="relative w-full sm:w-auto">
              <InlineSearch
                placeholder="Buscar filmes no TMDB..."
                onSearch={handleInlineSearch}
                mediaType="movie"
                className="w-full sm:w-96"
              >
                <SearchResults
                  results={searchResults}
                  loading={searchLoading}
                  error={searchError}
                  mediaType="movie"
                  onSelect={handleSelectMovie}
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
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{movieStats.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{movieStats.planned}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Planejados</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{movieStats.inProgress}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Em Progresso</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{movieStats.completed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Concluídos</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{movieStats.dropped}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Abandonados</div>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas adicionais de filmes */}
          {movies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card variant="glass" className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Tempo Total</p>
                      <p className="text-xl font-bold text-white">{formatRuntime(totalRuntime)}</p>
                    </div>
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Clock className="w-6 h-6 text-blue-400" />
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

              <Card variant="glass" className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Progresso Médio</p>
                      <p className="text-xl font-bold text-white">
                        {movieStats.total > 0
                          ? Math.round((movieStats.completed / movieStats.total) * 100) + '%'
                          : '0%'
                        }
                      </p>
                    </div>
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <MediaFilters
            mediaType="movie"
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
              {filteredMovies.length} {filteredMovies.length === 1 ? 'filme encontrado' : 'filmes encontrados'}
            </p>
            {movieStats.total > 0 && (
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">
                  {Math.round((movieStats.completed / movieStats.total) * 100)}% concluído
                </p>
                {totalRuntime > 0 && (
                  <p className="text-sm text-blue-400">
                    {formatRuntime(totalRuntime)} totais
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Movies Grid */}
          <MediaGrid
            media={filteredMovies}
            mediaType="movie"
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteMovie}
            emptyMessage={
              searchQuery || statusFilter !== 'all'
                ? "Nenhum filme encontrado com esses filtros"
                : "Nenhum filme adicionado ainda. Busque acima para começar!"
            }
            viewMode={viewMode}
          />
        </div>
      </div>

      <MediaFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        mediaType="movie"
        initialData={editingMedia || undefined}
        externalData={selectedMovieData}
        manualCreateQuery={manualCreateQuery}
        onSubmit={editingMedia ? handleEditMovie : handleAddMovie}
      />
    </>
  );
}