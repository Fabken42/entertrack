// /app/discover/[mediaType]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Button, Card, CardContent, Select, Input } from '@/components/ui';
import { Grid, List, Star, TrendingUp, Calendar, Search, Users } from 'lucide-react';
import Pagination from '../../../components/ui/pagination/Pagination';
import MediaCard from '../../../components/media/media-card/MediaCard';
// Remova os imports dos componentes de busca
import MediaFormModal from '@/components/forms/media-form/MediaFormModal';
import { useMediaStore } from '@/store/media-store';

export default function DiscoverPage() {
  const params = useParams();
  const mediaType = params.mediaType;

  // ESTADOS EXISTENTES
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(mediaType === 'books' ? 'relevance' : 'popularity');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // NOVO ESTADO para busca
  const [searchQuery, setSearchQuery] = useState('');

  // ESTADOS para formulário (mantidos apenas para adicionar à biblioteca)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMediaData, setSelectedMediaData] = useState(null);
  const [editingMedia, setEditingMedia] = useState(null);

  const { addMedia, updateMedia } = useMediaStore();

  useEffect(() => {
    if (mediaType) {
      fetchGenres();
    }
  }, [mediaType]);

  useEffect(() => {
    if (mediaType) {
      setCurrentPage(1);
      fetchDiscoveryItems();
    }
  }, [mediaType, sortBy, selectedGenre, searchQuery]); // Adicionado searchQuery

  useEffect(() => {
    if (mediaType) {
      fetchDiscoveryItems();
    }
  }, [currentPage]);

  const fetchGenres = async () => {
    try {
      const response = await fetch(`/api/genres/${mediaType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }
      const data = await response.json();
      setGenres([{ id: '', name: 'Todos os Gêneros' }, ...data]);
      setError(null);
    } catch (error) {
      console.error('Error fetching genres:', error);
      setError('Erro ao carregar gêneros');
      setGenres([{ id: '', name: 'Todos os Gêneros' }]);
    }
  };

  const fetchDiscoveryItems = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        sortBy,
        page: currentPage.toString(),
        limit: '20',
        ...(selectedGenre && { genre: selectedGenre }),
        ...(searchQuery && { query: searchQuery }) // Adicionado query
      });

      const response = await fetch(`/api/discover/${mediaType}?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch discovery items');
      }
      const data = await response.json();

      setItems(data.results || []);
      setTotalResults(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (error) {
      console.error('Error fetching discovery items:', error);
      setError('Erro ao carregar itens');
      setItems([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedMediaData(null);
    setEditingMedia(null);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddMedia = async (data) => {
    await addMedia({
      ...data,
      userId: 'user-1',
      mediaType: getStoreMediaType(),
    });
  };

  const handleEditMedia = async (data) => {
    if (editingMedia) {
      await updateMedia(editingMedia.id, data);
      setEditingMedia(null);
    }
  };

  const getStoreMediaType = () => {
    const mapping = {
      'movies': 'movie',
      'series': 'series',
      'animes': 'anime',
      'mangas': 'manga',
      'books': 'book',
      'games': 'game'
    };
    return mapping[mediaType] || mediaType;
  };

  const getMediaTypeLabel = () => {
    const labels = {
      movies: 'Filme',
      series: 'Série',
      animes: 'Anime',
      mangas: 'Mangá',
      books: 'Livro',
      games: 'Jogo'
    };
    return labels[mediaType] || 'Conteúdo';
  };

  const getMediaTypeIcon = () => {
    const icons = {
      movies: '🎬',
      series: '📺',
      animes: '🇯🇵',
      mangas: '📚',
      books: '📖',
      games: '🎮'
    };
    return icons[mediaType] || '✨';
  };

  const handleAddToLibrary = (item) => {
    // Converte o item do discover para o formato do formulário
    const mediaData = {
      externalId: item.id?.toString(),
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      releaseYear: item.releaseYear,
      genres: item.genres || [],
      mediaType: getStoreMediaType(),
      apiRating: item.rating,
      apiVoteCount: item.ratingsCount,
      // Campos específicos por tipo
      ...(mediaType === 'animes' && {
        episodes: item.episodes,
        popularity: item.popularity,
        members: item.members,
        rank: item.rank,
      }),
      ...(mediaType === 'mangas' && {
        volumes: item.volumes,
        chapters: item.chapters,
        popularity: item.popularity,
        members: item.members,
        rank: item.rank,
      }),
      ...(mediaType === 'movies' && {
        runtime: item.runtime,
      }),
      ...(mediaType === 'series' && {
        numberOfSeasons: item.numberOfSeasons,
        numberOfEpisodes: item.numberOfEpisodes,
      }),
    };

    setSelectedMediaData(mediaData);
    setIsFormOpen(true);
  };

  if (!mediaType) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">❓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tipo de mídia não especificado
            </h3>
          </div>
        </div>
      </Layout>
    );
  }

  const getSortOptions = () => {
    switch (mediaType) {
      case 'books':
        return [
          { value: 'relevance', label: 'Mais Relevantes', icon: TrendingUp },
          { value: 'newest', label: 'Mais Recentes', icon: Calendar },
        ];

      case 'mangas':
      case 'animes':
        return [
          { value: 'popularity', label: 'Mais Populares', icon: TrendingUp },
          { value: 'rating', label: 'Melhores Avaliados', icon: Star },
          { value: 'newest', label: 'Mais Recentes', icon: Calendar },
        ];
      case 'games':
        return [
          { value: 'popularity', label: 'Mais Populares', icon: TrendingUp },
          { value: 'rating', label: 'Melhores Avaliados', icon: Star },
          { value: 'newest', label: 'Mais Recentes', icon: Calendar },
        ];
      case 'movies':
      case 'series':
      default:
        return [
          { value: 'popularity', label: 'Tendências', icon: TrendingUp },
          { value: 'most_rated', label: 'Mais Populares', icon: Users },
          { value: 'rating', label: 'Melhores Avaliados', icon: Star },
          { value: 'newest', label: 'Mais Recentes', icon: Calendar },
        ];
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getMediaTypeIcon()}</span>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Descobrir {getMediaTypeLabel()}s
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Explore {getMediaTypeLabel().toLowerCase()}s populares, bem avaliados e recém-lançados
                  </p>
                </div>
              </div>
              {/* Botão removido - a busca agora está integrada nos filtros */}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="bg-card p-4 rounded-lg border border-border mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {/* Campo de Busca COM LABEL */}
                <div className="w-full sm:w-64">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Buscar {getMediaTypeLabel().toLowerCase()}s
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder={`Digite o nome...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                {/* Genre Filter */}
                <div className="w-full sm:w-48">
                  <Select
                    label="Filtrar por Gênero"
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    options={genres.map(genre => ({
                      value: genre.id,
                      label: genre.name
                    }))}
                  />
                </div>

                {/* Sort Filter */}
                <div className="w-full sm:w-48">
                  <Select
                    label="Ordenar por"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    options={getSortOptions().map(option => ({
                      value: option.value,
                      label: option.label
                    }))}
                  />
                </div>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-2 mt-4 lg:mt-0">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Visualização:</span>
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="!p-2"
                    icon={Grid}
                  />
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="!p-2"
                    icon={List}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Count - MODIFICADO para incluir informação da busca */}
          {!loading && items.length > 0 && (
            <div className="mb-4 flex justify-between items-center">
              <p className="text-muted-foreground">
                Mostrando {((currentPage - 1) * 20) + 1}-{((currentPage - 1) * 20) + items.length} de {totalResults} {getMediaTypeLabel().toLowerCase()}{totalResults !== 1 ? 's' : ''}
                {searchQuery && ` para "${searchQuery}"`}
                {selectedGenre && genres.find(g => g.id === selectedGenre) &&
                  ` no gênero ${genres.find(g => g.id === selectedGenre).name}`
                }
              </p>
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Carregando {getMediaTypeLabel().toLowerCase()}...</p>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
                : "space-y-4 mb-8"
              }>
                {items.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    mediaType={mediaType}
                    viewMode={viewMode}
                    onAddToLibrary={handleAddToLibrary}
                  />
                ))}
              </div>

              {/* PAGINAÇÃO */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mt-8"
                />
              )}
            </>
          )}

          {!loading && items.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `Não encontramos ${getMediaTypeLabel().toLowerCase()}s para "${searchQuery}"`
                  : selectedGenre
                    ? `Não encontramos ${getMediaTypeLabel().toLowerCase()} no gênero selecionado. Tente outro gênero.`
                    : `Tente alterar os filtros de ordenação.`
                }
              </p>
              {searchQuery && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                  >
                    Limpar busca
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FORMULÁRIO MODAL (mantido para adicionar à biblioteca) */}
      <MediaFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        mediaType={getStoreMediaType()}
        initialData={editingMedia || undefined}
        externalData={selectedMediaData}
        onSubmit={editingMedia ? handleEditMedia : handleAddMedia}
      />
    </Layout>
  );
}