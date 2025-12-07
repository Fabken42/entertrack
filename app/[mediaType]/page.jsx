'use client';

import React from 'react';
import { Layout } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';
import MediaGrid from '@/components/media/media-grid/MediaGrid';
import MediaFilters from '@/components/media/media-filters/MediaFilters';
import MediaFormModal from '@/components/forms/media-form/MediaFormModal';
import { useMediaStore } from '@/store/media-store';
import { Plus } from 'lucide-react';
import InlineSearch from '@/components/search/InlineSearch';
import SearchResults from '@/components/search/SearchResults';
import { useMyAnimeListSearch } from '@/lib/hooks/use-myanimelist';
import { useTMDBSearch } from '@/lib/hooks/use-tmdb';
import { useGoogleBooksSearch } from '@/lib/hooks/use-google-books';
import { useRAWGSearch } from '@/lib/hooks/use-rawg-games';
import { notFound } from 'next/navigation';

// Configurações para cada tipo de mídia
const MEDIA_CONFIG = {
  anime: {
    title: 'Animes',
    description: 'Acompanhe os animes que você assistiu, está assistindo ou planeja assistir.',
    placeholder: 'Buscar animes no MyAnimeList...',
    searchHook: useMyAnimeListSearch,
    hookParams: ['anime'],
    singular: 'anime',
    plural: 'animes',
    colorStats: {
      total: 'text-gray-900',
      planned: 'text-yellow-600',
      inProgress: 'text-blue-600',
      completed: 'text-green-600',
      dropped: 'text-red-600'
    }
  },
  manga: {
    title: 'Mangás',
    description: 'Acompanhe os mangás que você leu, está lendo ou planeja ler.',
    placeholder: 'Buscar mangás no MyAnimeList...',
    searchHook: useMyAnimeListSearch,
    hookParams: ['manga'],
    singular: 'mangá',
    plural: 'mangás',
    colorStats: {
      total: 'text-gray-900',
      planned: 'text-yellow-600',
      inProgress: 'text-blue-600',
      completed: 'text-green-600',
      dropped: 'text-red-600'
    }
  },
  movie: {
    title: 'Filmes',
    description: 'Acompanhe os filmes que você assistiu, está assistindo ou planeja assistir.',
    placeholder: 'Buscar filmes no TMDB...',
    searchHook: useTMDBSearch,
    hookParams: ['movie'],
    singular: 'filme',
    plural: 'filmes',
    colorStats: {
      total: 'text-gray-900',
      planned: 'text-yellow-600',
      inProgress: 'text-blue-600',
      completed: 'text-green-600',
      dropped: 'text-red-600'
    }
  },
  series: {
    title: 'Séries',
    description: 'Acompanhe suas séries favoritas e nunca perca um episódio.',
    placeholder: 'Buscar séries no TMDB...',
    searchHook: useTMDBSearch,
    hookParams: ['series'],
    singular: 'série',
    plural: 'séries',
    colorStats: {
      total: 'text-gray-900',
      planned: 'text-yellow-600',
      inProgress: 'text-blue-600',
      completed: 'text-green-600',
      dropped: 'text-red-600'
    }
  },
  book: {
    title: 'Livros',
    description: 'Acompanhe os livros que você leu, está lendo ou planeja ler.',
    placeholder: 'Buscar livros no Google Books...',
    searchHook: useGoogleBooksSearch,
    hookParams: [],
    singular: 'livro',
    plural: 'livros',
    colorStats: {
      total: 'text-gray-900',
      planned: 'text-yellow-600',
      inProgress: 'text-blue-600',
      completed: 'text-green-600',
      dropped: 'text-red-600'
    }
  },
  game: {
    title: 'Jogos',
    description: 'Acompanhe os jogos que você jogou, está jogando ou planeja jogar.',
    placeholder: 'Buscar jogos no RAWG...',
    searchHook: useRAWGSearch,
    hookParams: [],
    singular: 'jogo',
    plural: 'jogos',
    colorStats: {
      total: 'text-gray-900',
      planned: 'text-yellow-600',
      inProgress: 'text-blue-600',
      completed: 'text-green-600',
      dropped: 'text-red-600'
    }
  }
};

export default function MediaPage({ params }) {
  const { mediaType } = params;

  // Verifica se o tipo de mídia é válido
  const config = MEDIA_CONFIG[mediaType];
  if (!config) {
    notFound();
  }

  const { getMediaByType, addMedia, updateMedia } = useMediaStore();
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [manualCreateQuery, setManualCreateQuery] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMedia, setEditingMedia] = React.useState(null);
  const [inlineSearchQuery, setInlineSearchQuery] = React.useState('');
  const [selectedMediaData, setSelectedMediaData] = React.useState(null);

  // Usa o hook de busca apropriado
  let searchResults = [];
  let loading = false;
  let error = null;

  if (mediaType === 'book') {
    const { books: bookResults, loading: bookLoading, error: bookError } = config.searchHook(inlineSearchQuery, ...config.hookParams);
    searchResults = bookResults;
    loading = bookLoading;
    error = bookError;
  } else if (mediaType === 'game') {
    const { games: gameResults, loading: gameLoading, error: gameError } = config.searchHook(inlineSearchQuery, ...config.hookParams);
    searchResults = gameResults;
    loading = gameLoading;
    error = gameError;
  } else {
    const { results, loading: mediaLoading, error: mediaError } = config.searchHook(inlineSearchQuery, ...config.hookParams);
    searchResults = results;
    loading = mediaLoading;
    error = mediaError;
  }

  const mediaItems = getMediaByType(mediaType);

  const filteredMedia = mediaItems.filter(item => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.genres && item.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: mediaItems.length,
    planned: mediaItems.filter(m => m.status === 'planned').length,
    inProgress: mediaItems.filter(m => m.status === 'in_progress').length,
    completed: mediaItems.filter(m => m.status === 'completed').length,
    dropped: mediaItems.filter(m => m.status === 'dropped').length,
  };

  const handleAddMedia = async (data) => {
    await addMedia({
      ...data,
      userId: 'user-1',
      mediaType,
    });
  };

  const handleEditMedia = async (data) => {
    if (editingMedia) {
      await updateMedia(editingMedia.id, data);
      setEditingMedia(null);
    }
  };

  const handleEditClick = (item) => {
    setEditingMedia(item);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMedia(null);
    setSelectedMediaData(null);
    setManualCreateQuery(null);
  };

  const handleSelectMedia = (mediaData) => {
    setSelectedMediaData(mediaData);
    setManualCreateQuery(null);
    setIsFormOpen(true);
    setInlineSearchQuery('');
  };

  const handleManualCreate = () => {
    if (inlineSearchQuery.trim()) {
      setManualCreateQuery(inlineSearchQuery.trim());
      setSelectedMediaData(null);
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
              <h1 className="text-3xl font-bold text-white">{config.title}</h1>
              <p className="text-gray-300 mt-2">
                {config.description}
              </p>
            </div>
            <div className="relative w-full sm:w-auto">
              <InlineSearch
                placeholder={config.placeholder}
                onSearch={handleInlineSearch}
                mediaType={mediaType}
                className="w-full sm:w-96"
              >
                <SearchResults
                  results={searchResults}
                  loading={loading}
                  error={error}
                  mediaType={mediaType}
                  onSelect={handleSelectMedia}
                  query={inlineSearchQuery}
                />
              </InlineSearch>
              {inlineSearchQuery && !loading && searchResults.length === 0 && (
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
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${config.colorStats.total}`}>{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${config.colorStats.planned}`}>{stats.planned}</div>
                <div className="text-sm text-gray-600">Planejados</div>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${config.colorStats.inProgress}`}>{stats.inProgress}</div>
                <div className="text-sm text-gray-600">Em Progresso</div>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${config.colorStats.completed}`}>{stats.completed}</div>
                <div className="text-sm text-gray-600">Concluídos</div>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${config.colorStats.dropped}`}>{stats.dropped}</div>
                <div className="text-sm text-gray-600">Abandonados</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <MediaFilters
            mediaType={mediaType}
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
              {filteredMedia.length} {filteredMedia.length === 1 ? config.singular : config.plural} encontrados
            </p>
          </div>

          {/* Media Grid */}
          <MediaGrid
            media={filteredMedia}
            onEditClick={handleEditClick}
            emptyMessage={
              searchQuery || statusFilter !== 'all'
                ? `Nenhum ${config.singular} encontrado com esses filtros`
                : `Nenhum ${config.singular} adicionado ainda`
            }
          />
        </div>
      </div>

      <MediaFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        mediaType={mediaType}
        initialData={editingMedia || undefined}
        externalData={selectedMediaData}
        manualCreateQuery={manualCreateQuery}
        onSubmit={editingMedia ? handleEditMedia : handleAddMedia}
      />
    </Layout>
  );
}