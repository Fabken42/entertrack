'use client';

import { useState, useEffect } from 'react';
import { useMediaStore } from '@/store/media-store';
import MediaCard from '@/components/media/MediaCard';
import MediaStats from '@/components/media/MediaStats';
import { Button } from '@/components/ui';
import {
  Tv,
  Filter,
  Grid,
  List,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils/general-utils';
import MediaFormModal from '@/components/forms/media-form/MediaFormModal';
import { showConfirmDialog } from '@/lib/utils/swalConfig';
import { statusOptions, sortOptions } from '@/constants';
import { calculateMediaStats, filterAndSortMedia } from '@/lib/utils/media-utils';
import { useMyAnimeListSearch } from '@/lib/hooks/use-myanimelist';
import InlineSearch from '@/components/search/InlineSearch';
import SearchResults from '@/components/search/SearchResults';

export default function AnimesPage() {
  const { userMedia, fetchUserMedia, isLoading, error, removeMedia, updateMedia, addMedia } = useMediaStore();

  const [filteredMedia, setFilteredMedia] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Estados para busca inline
  const [inlineSearchQuery, setInlineSearchQuery] = useState('');
  const { results: searchResults, loading: searchLoading, error: searchError } = useMyAnimeListSearch(inlineSearchQuery, 'anime');
  
  // Estados do formulário
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAnimeData, setSelectedAnimeData] = useState(null);
  const [manualCreateQuery, setManualCreateQuery] = useState(null);

  useEffect(() => {
    fetchUserMedia();
  }, []);

  useEffect(() => {
    const result = filterAndSortMedia(
      userMedia,
      'anime',
      selectedStatus,
      searchQuery,
      sortBy
    );

    setFilteredMedia(result);
  }, [userMedia, selectedStatus, searchQuery, sortBy]);

  const stats = calculateMediaStats(userMedia, 'anime');

  const handleEditClick = (item) => {
    console.log('editing item: ', item)
    const originalItem = userMedia.find(m => m._id === item._id);
    setEditingItem(originalItem);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (itemId) => {
    const result = await showConfirmDialog({
      title: 'Remover conteúdo?',
      text: 'Tem certeza que deseja remover este anime da sua lista?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await removeMedia(itemId);
      } catch (error) {
        console.error('Error deleting media:', error);
      }
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      if (editingItem && data.userMediaId) {
        const updatePayload = {
          status: data.status,
          mediaType: 'anime',
          userRating: data.userRating || null,
          personalNotes: data.personalNotes || '',
          progress: data.progress ? {
            current: data.progress.currentEpisode || 0,
            lastUpdated: new Date()
          } : undefined,
        };

        await updateMedia(data.userMediaId, updatePayload);
        setIsEditModalOpen(false);
        setEditingItem(null);
        //await fetchUserMedia()???
      } else {
        console.error('❌ ID do UserMedia não encontrado:', { editingItem, data });
      }
    } catch (error) {
      console.error('Error updating media:', error);
    }
  };

  const handleAddAnime = async (data) => {
    try {
      await addMedia(data);
      await fetchUserMedia();
    } catch (error) {
      console.error('Error adding anime:', error);
      throw error;
    }
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

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAnimeData(null);
    setManualCreateQuery(null);
  };

  const getProgressInfo = (item) => {
    if (!item.progress || !(item.status === 'in_progress' || item.status === 'dropped')) {
      return null;
    }

    const progress = item.progress;
    const total = item.episodes || 0;

    if (total && progress.current !== undefined) {
      const percentage = total > 0 ? Math.round((progress.current / total) * 100) : 0;
      return {
        current: progress.current,
        total: total,
        percentage: percentage,
        unit: progress.unit || 'episodes'
      };
    }

    return null;
  };

  if (isLoading && userMedia.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-16 fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white/60 text-lg">Carregando seus animes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        <div className="p-6 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 glass rounded-2xl p-6 border border-white/10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg w-12 h-12 flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                    <Tv className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      Meus <span className="text-gradient-primary">Animes</span>
                    </h1>
                    <p className="text-white/60 mt-2">
                      Gerencie sua lista de animes, acompanhe progresso e avaliações
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  {/* Container de busca com resultados posicionados absolutamente */}
                  <div className="relative w-full sm:w-96">
                    <InlineSearch
                      placeholder="Buscar animes no MyAnimeList..."
                      onSearch={handleInlineSearch}
                      mediaType="anime"
                      className="w-full"
                    />
                    
                    {/* SearchResults renderizado diretamente aqui, não como children */}
                    {inlineSearchQuery.trim() && (
                      <div className="absolute z-50 w-full mt-2">
                        <SearchResults
                          results={searchResults}
                          loading={searchLoading}
                          error={searchError}
                          mediaType="anime"
                          onSelect={handleSelectAnime}
                          query={inlineSearchQuery}
                        />
                      </div>
                    )}
                    
                    {/* Opção para adicionar manualmente */}
                    {inlineSearchQuery && !searchLoading && searchResults.length === 0 && (
                      <div className="absolute z-50 w-full mt-2 top-full">
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
              </div>
            </div>

            {/* Stats */}
            <MediaStats stats={stats} />

            {/* Filters Section */}
            <div className="glass mb-8 p-6 rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-xl">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                {/* Status Filter */}
                <div className="w-full lg:w-auto">
                  <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtrar por Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedStatus(option.value)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
                          selectedStatus === option.value
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                            : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        <option.icon className="w-4 h-4" />
                        {option.label}
                        {option.value !== 'all' && (
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            selectedStatus === option.value
                              ? 'bg-white/20'
                              : 'bg-white/10'
                          )}>
                            {stats[option.value] || 0}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* View Mode & Sort */}
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-white whitespace-nowrap">
                      Ordenar por
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-gray-800/50 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-white whitespace-nowrap">
                      Visualização
                    </label>
                    <div className="flex bg-gray-800/50 rounded-xl p-1.5 border border-white/10">
                      <Button
                        variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={`!p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'grid'
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        icon={Grid}
                      />
                      <Button
                        variant={viewMode === 'list' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={`!p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'list'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        icon={List}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Info */}
            {!isLoading && filteredMedia.length > 0 && (
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-white/80 text-sm">
                    Mostrando <span className="font-bold text-white">{filteredMedia.length}</span> anime{filteredMedia.length !== 1 ? 's' : ''}
                    {selectedStatus !== 'all' && (
                      <span className="ml-2">
                        · Status: <span className="font-bold text-white">
                          {statusOptions.find(s => s.value === selectedStatus)?.label}
                        </span>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="ml-2">
                        · Busca: <span className="font-bold text-pink-300">"{searchQuery}"</span>
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span>Ordenado por:</span>
                  <span className="font-medium text-white">
                    {sortOptions.find(s => s.value === sortBy)?.label}
                  </span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && userMedia.length > 0 ? (
              <div className="text-center py-8 fade-in">
                <p className="text-white/60">Atualizando lista...</p>
              </div>
            ) : (
              <>
                {/* Error State */}
                {error ? (
                  <div className="text-center py-12">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      Erro ao carregar animes
                    </h3>
                    <p className="text-white/60 mb-4">{error}</p>
                    <Button
                      variant="primary"
                      onClick={handleRefresh}
                      icon={RefreshCw}
                      className="bg-gradient-to-r from-pink-500 to-purple-500"
                    >
                      Tentar novamente
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Media List */}
                    {filteredMedia.length > 0 ? (
                      <div className={cn(
                        viewMode === 'grid'
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
                          : "space-y-4 mb-8",
                        "fade-in"
                      )}>
                        {filteredMedia.map((item) => {
                          const progressInfo = getProgressInfo(item);

                          return (
                            <div key={item._id} className="relative group">
                              <MediaCard
                                item={item}
                                mediaType="animes"
                                viewMode={viewMode}
                                isLibrary={true}
                                onEditClick={handleEditClick}
                                onDeleteClick={handleDeleteClick}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Empty State */
                      <div className="text-center py-16 fade-in">
                        <div className="glass border border-white/10 rounded-2xl p-12 max-w-md mx-auto">
                          <div className="text-6xl mb-6 opacity-50">
                            {searchQuery
                              ? '🔍'
                              : selectedStatus === 'all'
                                ? '📺'
                                : selectedStatus === 'planned'
                                  ? '📅'
                                  : selectedStatus === 'in_progress'
                                    ? '⏳'
                                    : selectedStatus === 'completed'
                                      ? '✅'
                                      : '❌'
                            }
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-3">
                            {searchQuery
                              ? `Nenhum anime encontrado para "${searchQuery}"`
                              : selectedStatus === 'all'
                                ? 'Nenhum anime adicionado ainda'
                                : `Nenhum anime com status "${statusOptions.find(s => s.value === selectedStatus)?.label}"`
                            }
                          </h3>
                          <p className="text-white/60 mb-8">
                            {searchQuery
                              ? 'Tente buscar por um termo diferente ou adicione novos animes'
                              : selectedStatus === 'all'
                                ? 'Comece adicionando animes à sua lista para acompanhar seu progresso'
                                : 'Adicione animes com este status ou altere o filtro para ver outros'
                            }
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            {searchQuery && (
                              <Button
                                variant="outline"
                                onClick={() => setSearchQuery('')}
                                className="hover:bg-white/10"
                              >
                                Limpar busca
                              </Button>
                            )}
                            {selectedStatus !== 'all' && (
                              <Button
                                variant="outline"
                                onClick={() => setSelectedStatus('all')}
                                className="hover:bg-white/10"
                              >
                                Ver todos os animes
                              </Button>
                            )}
                            <div className="flex flex-col gap-2">
                              <p className="text-sm text-white/60 mb-2">
                                Busque acima para adicionar animes diretamente
                              </p>
                              <div className="relative w-64 mx-auto">
                                <InlineSearch
                                  placeholder="Buscar animes..."
                                  onSearch={handleInlineSearch}
                                  mediaType="anime"
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal para edição */}
      {editingItem && (
        <MediaFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingItem(null);
          }}
          mediaType="anime"
          initialData={{
            _id: editingItem._id,
            genres: editingItem.mediaCacheId?.essentialData?.genres,
            episodes: editingItem.mediaCacheId?.essentialData?.episodes,
            studios: editingItem.mediaCacheId?.essentialData?.studios,
            externalId: editingItem.mediaCacheId?.essentialData?.externalId,
            title: editingItem.mediaCacheId?.essentialData?.title,
            description: editingItem.mediaCacheId?.essentialData?.description,
            imageUrl: editingItem.mediaCacheId?.essentialData?.coverImage,
            releaseYear: editingItem.mediaCacheId?.essentialData?.releaseYear,
            userRating: editingItem.userRating || null,
            personalNotes: editingItem.personalNotes || '',
            status: editingItem.status,
            progress: {
              currentEpisode: editingItem.progress?.current || 0,
            }
          }}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Modal para adicionar novo anime */}
      <MediaFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        mediaType="anime"
        initialData={undefined}
        externalData={selectedAnimeData}
        manualCreateQuery={manualCreateQuery}
        onSubmit={handleAddAnime}
      />
    </>
  );
}