// /entertrack/app/games/page.jsx

'use client';

import React from 'react';
import { Layout } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';
import MediaGrid from '@/components/media/media-grid/MediaGrid';
import MediaFilters from '@/components/media/media-filters/MediaFilters';
import MediaFormModal from '@/components/forms/media-form/MediaFormModal';
import { useMediaStore } from '@/store/media-store';
import { Plus } from 'lucide-react';
import RAWGSearchGames from '@/components/search/RAWGSearchGames';

export default function GamesPage() {
  const { getMediaByType, addMedia, updateMedia } = useMediaStore();
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [manualCreateQuery, setManualCreateQuery] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMedia, setEditingMedia] = React.useState(null);
  const [isGameSearchOpen, setIsGameSearchOpen] = React.useState(false);
  const [selectedGameData, setSelectedGameData] = React.useState(null);
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
  };

  const handleSelectGame = (gameData) => {
    setSelectedGameData(gameData);
    setManualCreateQuery(null);
    setIsFormOpen(true);
  };

  const handleManualCreate = (query) => {
    setManualCreateQuery(query);
    setSelectedGameData(null);
    setIsFormOpen(true);
  };

  const handleBackToSearch = () => {
    setIsFormOpen(false);
    setSelectedGameData(null);
    setIsGameSearchOpen(true);
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
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsGameSearchOpen(true)}
            >
              Buscar Jogo
            </Button>
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

      <RAWGSearchGames
        isOpen={isGameSearchOpen}
        onClose={() => setIsGameSearchOpen(false)}
        onSelectGame={handleSelectGame}
        onManualCreate={handleManualCreate}
      />
      <MediaFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedGameData(null);
          setManualCreateQuery(null);
        }}
        onBackToSearch={selectedGameData ? handleBackToSearch : undefined} 
        mediaType="game"
        initialData={editingMedia || undefined}
        externalData={selectedGameData}
        manualCreateQuery={manualCreateQuery}
        onSubmit={editingMedia ? handleEditGame : handleAddGame}
      />
    </Layout>
  );
}