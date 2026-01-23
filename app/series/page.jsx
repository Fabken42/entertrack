// app/series/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useMediaStore } from '@/store/media-store';
import MediaCard from '@/components/media/MediaCard';
import MediaFilterControls from '@/components/media/MediaFilterControls';
import { Button, Pagination } from '@/components/ui';
import {
  Tv,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils/general-utils';
import MediaFormModal from '@/components/forms/media-form/MediaFormModal';
import { showConfirmDialog } from '@/lib/utils/swalConfig';
import { sortOptions, FETCH_MEDIA_ITEMS_LIMIT } from '@/constants';
import { calculateMediaStats, filterAndSortMedia, getStatItems } from '@/lib/utils/media-utils';
import { useTMDBSearch } from '@/lib/hooks/use-tmdb';
import InlineSearch from '@/components/search/InlineSearch';
import SearchResults from '@/components/search/SearchResults';

export default function SeriesPage() {
  const { userMedia, fetchUserMedia, isLoading, error, removeMedia, updateMedia, addMedia, increaseProgress } = useMediaStore();

  const [filteredMedia, setFilteredMedia] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Estados para busca externa no TMDB
  const [inlineSearchQuery, setInlineSearchQuery] = useState('');
  const { results: searchResults, loading: searchLoading, error: searchError } = useTMDBSearch(inlineSearchQuery, 'tv');

  // Estados do formulário
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSeriesData, setSelectedSeriesData] = useState(null);
  const [manualCreateQuery, setManualCreateQuery] = useState(null);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUserMedia();
  }, []);

  useEffect(() => {
    const result = filterAndSortMedia(
      userMedia,
      'series',
      selectedStatus,
      searchQuery,
      sortBy
    );

    setFilteredMedia(result);
  }, [userMedia, selectedStatus, searchQuery, sortBy]);

  // Resetar para a primeira página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchQuery, sortBy]);

  // Calcular dados paginados
  const totalPages = Math.max(1, Math.ceil(filteredMedia.length / FETCH_MEDIA_ITEMS_LIMIT));

  const paginatedMedia = filteredMedia.slice(
    (currentPage - 1) * FETCH_MEDIA_ITEMS_LIMIT,
    currentPage * FETCH_MEDIA_ITEMS_LIMIT
  );

  const stats = calculateMediaStats(userMedia, 'series');
  const statItems = getStatItems(stats);

  const handleEditClick = (item) => {
    const originalItem = userMedia.find(m => m._id === item._id);
    setEditingItem(originalItem);
    setIsEditModalOpen(true);
  };

  const handleIncreaseProgress = async (userMediaId) => {
    try {
      await increaseProgress(userMediaId, 'series');
    } catch (error) {
      console.error('Erro ao aumentar progresso:', error);
    }
  };

  const handleDeleteClick = async (itemId) => {
    const result = await showConfirmDialog({
      title: 'Remover conteúdo?',
      text: 'Tem certeza que deseja remover esta série da sua lista?',
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
          mediaType: 'series',
          userRating: data.userRating || null,
          personalNotes: data.personalNotes || '',
          progress: data.progress,
        };

        await updateMedia(data.userMediaId, updatePayload);
        setIsEditModalOpen(false);
        setEditingItem(null);
      } else {
        console.error('❌ ID do UserMedia não encontrado:', { editingItem, data });
      }
    } catch (error) {
      console.error('Error updating media:', error);
    }
  };

  const handleAddSeries = async (data) => {
    try {
      await addMedia(data);
      await fetchUserMedia();
    } catch (error) {
      console.error('Error adding series:', error);
      throw error;
    }
  };

  const handleSelectSeries = (seriesData) => {
    setSelectedSeriesData(seriesData);
    setManualCreateQuery(null);
    setIsFormOpen(true);
    setInlineSearchQuery('');
    setShowSearchResults(false);
  };

  const handleManualCreate = () => {
    if (inlineSearchQuery.trim()) {
      setManualCreateQuery(inlineSearchQuery.trim());
      setSelectedSeriesData(null);
      setIsFormOpen(true);
      setInlineSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedSeriesData(null);
    setManualCreateQuery(null);
  };

  const handleRefresh = () => {
    fetchUserMedia();
  };

  const handleLocalSearchChange = (query) => {
    setSearchQuery(query);
  };

  // Função para mudar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Rolagem suave para o topo da lista
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  if (isLoading && userMedia.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-16 fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white/60 text-lg">Carregando suas séries...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        <div className="p-6 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {/* Cabeçalho com título e busca EXTERNA (TMDB) */}
            <div className="mb-8 glass rounded-2xl p-6 border border-white/10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Tv className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      Minhas <span className="text-gradient-primary">Séries</span>
                    </h1>
                    <p className="text-white/60 mt-2">
                      Gerencie sua lista de séries, acompanhe temporadas e episódios
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  {/* Container de busca EXTERNA */}
                  <div className="relative w-full sm:w-96">
                    <InlineSearch
                      placeholder="Buscar séries no TMDB..."
                      onSearch={(query) => {
                        setInlineSearchQuery(query);
                        setShowSearchResults(!!query.trim());
                      }}
                      onFocus={() => {
                        if (inlineSearchQuery.trim()) {
                          setShowSearchResults(true);
                        }
                      }}
                      onBlur={() => {
                        // Pequeno delay para permitir clicar nos resultados
                        setTimeout(() => setShowSearchResults(false), 200);
                      }}
                      mediaType="tv"
                      className="w-full"
                    >
                      {showSearchResults && (
                        <>
                          {searchResults.length > 0 ? (
                            <SearchResults
                              results={searchResults}
                              loading={searchLoading}
                              error={searchError}
                              mediaType="tv"
                              onSelect={(item) => {
                                handleSelectSeries(item);
                                setShowSearchResults(false);
                              }}
                              query={inlineSearchQuery}
                            />
                          ) : inlineSearchQuery && !searchLoading ? (
                            <div className="glass border border-white/10 rounded-2xl p-4 text-center">
                              <p className="text-gray-400 mb-3">Não encontramos "{inlineSearchQuery}"</p>
                              <Button
                                variant="outline"
                                icon={Plus}
                                onClick={() => {
                                  handleManualCreate();
                                  setShowSearchResults(false);
                                }}
                                size="sm"
                                className="w-full"
                              >
                                Adicionar manualmente
                              </Button>
                            </div>
                          ) : null}
                        </>
                      )}
                    </InlineSearch>
                  </div>
                </div>
              </div>
            </div>

            {/* Componente modularizado de filtros - COM BUSCA LOCAL */}
            <MediaFilterControls
              statItems={statItems}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
              sortOptions={sortOptions}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              searchQuery={searchQuery}
              onSearchChange={handleLocalSearchChange}
            />

            {/* Results Info com informações de paginação */}
            {!isLoading && filteredMedia.length > 0 && (
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-white/80 text-sm">
                    <span className="font-bold text-white">
                      {(currentPage - 1) * FETCH_MEDIA_ITEMS_LIMIT + 1}-{Math.min(currentPage * FETCH_MEDIA_ITEMS_LIMIT, filteredMedia.length)}
                    </span>
                    {' de '}
                    <span className="font-bold text-white">{filteredMedia.length}</span>
                    {' séri'}{filteredMedia.length !== 1 ? 'es' : 'e'}
                    <span className="ml-2 text-white/60">
                      (pág. {currentPage} de {totalPages})
                    </span>
                    {selectedStatus !== 'all' && (
                      <span className="ml-2">
                        · Status: <span className="font-bold text-white">
                          {statItems.find(s => s.valueKey === selectedStatus)?.label}
                        </span>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="ml-2">
                        · Busca: <span className="font-bold text-white">"{searchQuery}"</span>
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span>Ordenado por:</span>
                    <span className="font-medium text-white">
                      {sortOptions.find(s => s.value === sortBy)?.label}
                    </span>
                  </div>
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
                      Erro ao carregar séries
                    </h3>
                    <p className="text-white/60 mb-4">{error}</p>
                    <Button
                      variant="primary"
                      onClick={handleRefresh}
                      icon={RefreshCw}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      Tentar novamente
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Media List com paginação */}
                    {filteredMedia.length > 0 ? (
                      <>
                        <div className={cn(
                          viewMode === 'grid'
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
                            : "space-y-4 mb-8",
                          "fade-in"
                        )}>
                          {paginatedMedia.map((item) => (
                            <div key={item._id} className="relative group">
                              <MediaCard
                                item={item}
                                mediaType="series"
                                viewMode={viewMode}
                                isLibrary={true}
                                onEditClick={handleEditClick}
                                onDeleteClick={handleDeleteClick}
                                onIncreaseProgress={handleIncreaseProgress}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Componente de Paginação */}
                        {filteredMedia.length > FETCH_MEDIA_ITEMS_LIMIT && (
                          <div className="mt-8 pt-6 border-t border-white/10">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={handlePageChange}
                              className="max-w-2xl mx-auto"
                              showPageSelect={true}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-16 fade-in">
                        <div className="glass border border-white/10 rounded-2xl p-12 max-w-md mx-auto">
                          <div className="text-6xl mb-6 opacity-50">📺</div>
                          <h3 className="text-2xl font-bold text-white mb-3">
                            Nenhuma série encontrada
                          </h3>
                          <p className="text-white/60 mb-8">
                            {searchQuery
                              ? `Não foi possível encontrar séries com o título "${searchQuery}"`
                              : 'Não foi possível encontrar séries correspondentes aos filtros selecionados'
                            }
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            {searchQuery && (
                              <Button
                                variant="outline"
                                onClick={() => setSearchQuery('')}
                                className="border-white/20 hover:bg-white/10"
                              >
                                Limpar busca
                              </Button>
                            )}
                            <Button
                              variant="primary"
                              onClick={handleRefresh}
                              icon={RefreshCw}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-w-[180px]"
                            >
                              Recarregar Página
                            </Button>
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
          mediaType="series"
          initialData={{
            _id: editingItem._id,
            genres: editingItem.mediaCacheId?.essentialData?.genres,
            sourceId: editingItem.mediaCacheId?.sourceId,
            title: editingItem.mediaCacheId?.essentialData?.title,
            description: editingItem.mediaCacheId?.essentialData?.description,
            seasons: editingItem.mediaCacheId?.essentialData?.seasons,
            episodes: editingItem.mediaCacheId?.essentialData?.episodes,
            episodesPerSeason: editingItem.mediaCacheId?.essentialData?.episodesPerSeason,
            category: editingItem.mediaCacheId?.essentialData?.category,
            coverImage: editingItem.mediaCacheId?.essentialData?.coverImage,
            releaseYear: editingItem.mediaCacheId?.essentialData?.releaseYear,
            userRating: editingItem.userRating || null,
            personalNotes: editingItem.personalNotes || '',
            status: editingItem.status,
            progress: {
              seasons: editingItem.progress?.seasons || 1,
              episodes: editingItem.progress?.episodes || 0,
            }
          }}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Modal para adicionar nova série */}
      <MediaFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        mediaType="series"
        initialData={undefined}
        externalData={selectedSeriesData}
        manualCreateQuery={manualCreateQuery}
        onSubmit={handleAddSeries}
      />
    </>
  );
}