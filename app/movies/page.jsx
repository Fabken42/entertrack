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

export default function MoviesPage() {
  const { getMediaByType, addMedia, updateMedia } = useMediaStore();
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [manualCreateQuery, setManualCreateQuery] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMedia, setEditingMedia] = React.useState(null);
  const [selectedMovieData, setSelectedMovieData] = React.useState(null);
  const [inlineSearchQuery, setInlineSearchQuery] = React.useState('');
  
  // Use o hook com mediaType='movie'
  const { results, loading, error } = useTMDBSearch(inlineSearchQuery, 'movie');
  
  const movies = getMediaByType('movie');

  const filteredMovies = movies.filter(movie => {
    const matchesStatus = statusFilter === 'all' || movie.status === statusFilter;
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (movie.genres && movie.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: movies.length,
    planned: movies.filter(m => m.status === 'planned').length,
    inProgress: movies.filter(m => m.status === 'in_progress').length,
    completed: movies.filter(m => m.status === 'completed').length,
    dropped: movies.filter(m => m.status === 'dropped').length,
  };

  const handleAddMovie = async (data) => {
    await addMedia({
      ...data,
      userId: 'user-1',
      mediaType: 'movie',
    });
  };

  const handleEditMovie = async (data) => {
    if (editingMedia) {
      await updateMedia(editingMedia.id, data);
      setEditingMedia(null);
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
    setSelectedMovieData(movieData);
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

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Filmes</h1>
              <p className="text-gray-300 mt-2">
                Acompanhe os filmes que você assistiu, está assistindo ou planeja assistir.
              </p>
            </div>
            <div className="relative w-full sm:w-auto">
              <InlineSearch
                placeholder="Buscar filmes no TMDB..."
                onSearch={handleInlineSearch}
                mediaType="movie"
                className="w-full sm:w-96"
              >
                <SearchResults
                  results={results}
                  loading={loading}
                  error={error}
                  mediaType="movie"
                  onSelect={handleSelectMovie}
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
            <p className="text-gray-600">
              {filteredMovies.length} {filteredMovies.length === 1 ? 'filme encontrado' : 'filmes encontrados'}
            </p>
          </div>

          {/* Movies Grid */}
          <MediaGrid
            media={filteredMovies}
            onEditClick={handleEditClick}
            emptyMessage={
              searchQuery || statusFilter !== 'all'
                ? "Nenhum filme encontrado com esses filtros"
                : "Nenhum filme adicionado ainda"
            }
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
    </Layout>
  );
}