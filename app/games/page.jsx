// /entertrack/app/games/page.jsx
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
import { useRAWGSearch } from '@/lib/hooks/use-rawg-games';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils/general-utils';

export default function GamesPage() {
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
  const [selectedGameData, setSelectedGameData] = React.useState(null);
  const [manualCreateQuery, setManualCreateQuery] = React.useState(null);
  
  // Estados da busca
  const [inlineSearchQuery, setInlineSearchQuery] = React.useState('');
  const { games: searchResults, loading: searchLoading, error: searchError } = useRAWGSearch(inlineSearchQuery);
  
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

  // Carregar jogos quando a página montar ou usuário mudar
  useEffect(() => {
    if (status === 'authenticated') {
      loadGames();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const loadGames = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchMediaByType('game');
    } catch (error) {
      console.error('Error loading games:', error);
      setError(error.message || 'Erro ao carregar jogos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar jogos da biblioteca
  const games = getMediaByType('game');
  
  // Filtrar jogos
  const filteredGames = getFilteredMedia({
    mediaType: 'game',
    status: statusFilter !== 'all' ? statusFilter : undefined,
    searchQuery: searchQuery
  });

  // Estatísticas
  const gameStats = {
    total: games.length,
    planned: games.filter(m => m.status === 'planned').length,
    inProgress: games.filter(m => m.status === 'in_progress').length,
    completed: games.filter(m => m.status === 'completed').length,
    dropped: games.filter(m => m.status === 'dropped').length,
  };

  // Calcular horas totais jogadas
  const totalHoursPlayed = games.reduce((total, game) => {
    return total + (game.progress?.hoursPlayed || 0);
  }, 0);

  // Handlers
  const handleAddGame = async (data) => {
    try {
      await addMedia(data);
      // Recarregar lista após adicionar
      await fetchMediaByType('game');
    } catch (error) {
      console.error('Error adding game:', error);
      throw error;
    }
  };

  const handleEditGame = async (data) => {
    try {
      if (editingMedia && editingMedia._id) {
        await updateMedia(editingMedia._id, data);
        setEditingMedia(null);
      }
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  };

  const handleDeleteGame = async (id) => {
    try {
      if (confirm('Tem certeza que deseja excluir este jogo?')) {
        await deleteMedia(id);
        await fetchMediaByType('game');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Erro ao excluir jogo: ' + error.message);
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

  const handleRefresh = () => {
    loadGames();
  };

  // Se não estiver autenticado
  if (status === 'unauthenticated') {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto min-h-screen">
          <div className="text-center py-12 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
              <span className="text-2xl">🎮</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Acesse sua conta para ver seus jogos
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Faça login para acompanhar sua coleção de jogos e conquistas!
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
                <h1 className="text-3xl font-bold text-white">Jogos</h1>
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
                Acompanhe os jogos que você jogou, está jogando ou planeja jogar.
              </p>
              {totalHoursPlayed > 0 && (
                <p className="text-sm text-purple-400 mt-1">
                  🕐 Total de horas jogadas: {totalHoursPlayed.toFixed(1)}h
                </p>
              )}
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
                  loading={searchLoading}
                  error={searchError}
                  mediaType="game"
                  onSelect={handleSelectGame}
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
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{gameStats.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{gameStats.planned}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Planejados</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{gameStats.inProgress}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Em Progresso</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{gameStats.completed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Concluídos</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{gameStats.dropped}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Abandonados</div>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas adicionais de jogos */}
          {games.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card variant="glass" className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Horas Jogadas</p>
                      <p className="text-xl font-bold text-white">{totalHoursPlayed.toFixed(1)}h</p>
                    </div>
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <span className="text-2xl">🕐</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card variant="glass" className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Média Conclusão</p>
                      <p className="text-xl font-bold text-white">
                        {gameStats.total > 0 
                          ? Math.round((gameStats.completed / gameStats.total) * 100) + '%'
                          : '0%'
                        }
                      </p>
                    </div>
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <span className="text-2xl">🏆</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card variant="glass" className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Missões Pendentes</p>
                      <p className="text-xl font-bold text-white">
                        {games.reduce((total, game) => {
                          return total + (game.progress?.pendingTasks?.length || 0);
                        }, 0)}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <span className="text-2xl">🎯</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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
            <p className="text-gray-600 dark:text-gray-400">
              {filteredGames.length} {filteredGames.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}
            </p>
            {gameStats.total > 0 && (
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">
                  {Math.round((gameStats.completed / gameStats.total) * 100)}% concluído
                </p>
                {totalHoursPlayed > 0 && (
                  <p className="text-sm text-purple-400">
                    {totalHoursPlayed.toFixed(1)}h totais
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Games Grid */}
          <MediaGrid
            media={filteredGames}
            mediaType="game"
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteGame}
            emptyMessage={
              searchQuery || statusFilter !== 'all'
                ? "Nenhum jogo encontrado com esses filtros"
                : "Nenhum jogo adicionado ainda. Busque acima para começar!"
            }
            viewMode={viewMode}
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
    </>
  );
}