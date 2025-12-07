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
import { useRAWGSearch } from '@/lib/hooks/use-rawg-games'; // Importe o hook

export default function GamesPage() {
  const { getMediaByType, addMedia, updateMedia } = useMediaStore();
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [manualCreateQuery, setManualCreateQuery] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMedia, setEditingMedia] = React.useState(null);
  const [selectedGameData, setSelectedGameData] = React.useState(null);
  const [inlineSearchQuery, setInlineSearchQuery] = React.useState('');
  
  // Use o hook correto
  const { games: searchResults, loading, error } = useRAWGSearch(inlineSearchQuery);
  
  const games = getMediaByType('game');

  const filteredGames = games.filter(game => {
    const matchesStatus = statusFilter === 'all' || game.status === statusFilter;
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.genres && game.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: games.length,
    planned: games.filter(m => m.status === 'planned').length,
    inProgress: games.filter(m => m.status === 'in_progress').length,
    completed: games.filter(m => m.status === 'completed').length,
    dropped: games.filter(m => m.status === 'dropped').length,
  };

  const handleAddGame = async (data) => {
    await addMedia({
      ...data,
      userId: 'user-1',
      mediaType: 'game',
    });
  };

  const handleEditGame = async (data) => {
    if (editingMedia) {
      await updateMedia(editingMedia.id, data);
      setEditingMedia(null);
    }
  };

  const handleEditClick = (game) => {
    setEditingMedia(game);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMedia(null);
    setSelectedGameData(null);
    setManualCreateQuery(null);
  };

  const handleSelectGame = (gameData) => {
    setSelectedGameData(gameData);
    setManualCreateQuery(null);
    setIsFormOpen(true);
    setInlineSearchQuery('');
  };

  const handleManualCreate = () => {
    if (inlineSearchQuery.trim()) {
      setManualCreateQuery(inlineSearchQuery.trim());
      setSelectedGameData(null);
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
              <h1 className="text-3xl font-bold text-white">Jogos</h1>
              <p className="text-gray-300 mt-2">
                Acompanhe os jogos que você jogou, está jogando ou planeja jogar.
              </p>
            </div>
            <div className="relative w-full sm:w-auto">
              <InlineSearch
                placeholder="Buscar jogos no RAWG..."
                onSearch={handleInlineSearch}
                mediaType="game"
                className="w-full sm:w-96"
              >
                <SearchResults
                  results={searchResults}
                  loading={loading}
                  error={error}
                  mediaType="game"
                  onSelect={handleSelectGame}
                  query={inlineSearchQuery}
                />
              </InlineSearch>
              {inlineSearchQuery && !loading && searchResults.length === 0 && (
                <div className="absolute top-full mt-1 w-full">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                    <p className="text-gray-400 mb-3">
                      Não encontramos "{inlineSearchQuery}" no RAWG
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
            mediaType="game"
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
              {filteredGames.length} {filteredGames.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}
            </p>
          </div>

          {/* Games Grid */}
          <MediaGrid
            media={filteredGames}
            onEditClick={handleEditClick}
            emptyMessage={
              searchQuery || statusFilter !== 'all'
                ? "Nenhum jogo encontrado com esses filtros"
                : "Nenhum jogo adicionado ainda"
            }
          />
        </div>
      </div>

      <MediaFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        mediaType="game"
        initialData={editingMedia || undefined}
        externalData={selectedGameData}
        manualCreateQuery={manualCreateQuery}
        onSubmit={editingMedia ? handleEditGame : handleAddGame}
      />
    </Layout>
  );
}