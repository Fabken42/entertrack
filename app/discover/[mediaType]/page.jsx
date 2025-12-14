// /app/discover/[mediaType]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, Select, Input } from '@/components/ui';
import { Grid, List, Star, TrendingUp, Calendar, Search, Users, Filter, ArrowUpDown, Layers, Tag, RefreshCw, X, AlertCircle } from 'lucide-react';
import Pagination from '../../../components/ui/pagination/Pagination';
import MediaCard from '../../../components/media/MediaCard';
import MediaFormModal from '@/components/forms/media-form/MediaFormModal';
import { useMediaStore } from '@/store/media-store';
import { cn } from '@/lib/utils';

export default function DiscoverPage() {
  const params = useParams();
  const mediaType = params.mediaType;

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
  }, [mediaType, sortBy, selectedGenre, searchQuery]);

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
      setError('Erro ao carregar');
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
        ...(searchQuery && { query: searchQuery })
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
      setError('Erro ao carregar');
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
    console.log('DiscoverPage: handleAddMedia called with:', data);
    console.log('Current mediaType in DiscoverPage:', mediaType);
    console.log('Store media type:', getStoreMediaType());

    try {
      const result = await addMedia({
        ...data,
        mediaType: getStoreMediaType(),
      });
      console.log('DiscoverPage: addMedia successful, result:', result);
    } catch (error) {
      console.error('DiscoverPage: addMedia error:', error);
      alert('Erro ao adicionar mídia: ' + error.message);
    }
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

  const getMediaTypeColor = () => {
    const colors = {
      movies: 'from-blue-500/20 to-blue-600/20',
      series: 'from-purple-500/20 to-purple-600/20',
      animes: 'from-red-500/20 to-pink-600/20',
      mangas: 'from-indigo-500/20 to-indigo-600/20',
      books: 'from-emerald-500/20 to-emerald-600/20',
      games: 'from-orange-500/20 to-orange-600/20'
    };
    return colors[mediaType] || 'from-gray-500/20 to-gray-600/20';
  };

  const handleAddToLibrary = (item) => {
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
      synopsis: item.description || item.overview || item.summary,
    };

    setSelectedMediaData(mediaData);
    setIsFormOpen(true);
  };

  const refreshItems = () => {
    setCurrentPage(1);
    fetchDiscoveryItems();
  };

  if (!mediaType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">❓</div>
          <h3 className="text-lg font-medium text-white mb-2">
            Tipo de mídia não especificado
          </h3>
        </div>
      </div>
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
    <div className="min-h-screen">
      <div className="p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header com gradiente e glass effect - REMOVIDO hover-lift */}
          <div className="mb-8 glass rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <div className="flex items-center gap-3">
                {/* Container quadrado para o ícone */}
                <div className={`p-3 rounded-lg w-12 h-12 flex items-center justify-center bg-gradient-to-br ${getMediaTypeColor()}`}>
                  <span className="text-2xl leading-none">{getMediaTypeIcon()}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Descobrir <span className="text-gradient-primary">{getMediaTypeLabel()}s</span>
                  </h1>
                  <p className="text-white/60 mt-2">
                    Explore {getMediaTypeLabel().toLowerCase()}s populares, bem avaliados e recém-lançados
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros com estilo glass escuro - IGUAL AO MediaCard */}
          <div className="glass mb-8 p-6 rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Container principal dos filtros */}
              <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto md:items-center">
                {/* Campo de Busca */}
                <div className="w-full md:w-72">
                  <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Buscar {getMediaTypeLabel().toLowerCase()}s
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Input
                      type="text"
                      placeholder={`Digite o nome do ${getMediaTypeLabel().toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      variant="glass"
                      className="pl-10 bg-gray-800/50 border-white/10 text-white placeholder:text-white/40"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4 group-hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Filtro de Gênero */}
                <div className="w-full md:w-56">
                  <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtrar por Gênero
                  </label>
                  <Select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    options={genres.map(genre => ({
                      value: genre.id,
                      label: genre.name,
                      icon: genre.id === '' ? Layers : Tag
                    }))}
                    variant="glass"
                    className="bg-gray-800/50 border-white/10"
                  />
                </div>

                {/* Ordenação */}
                <div className="w-full md:w-56">
                  <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    Ordenar por
                  </label>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    options={getSortOptions().map(option => ({
                      value: option.value,
                      label: option.label,
                      icon: option.icon
                    }))}
                    variant="glass"
                    className="bg-gray-800/50 border-white/10"
                  />
                </div>
              </div>

              {/* Modo de Visualização */}
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <label className="block text-sm font-medium text-white whitespace-nowrap">
                  Visualização
                </label>
                <div className="flex bg-gray-800/50 rounded-xl p-1.5 border border-white/10">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`!p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'grid'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    icon={Grid}
                  />
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`!p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'list'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    icon={List}
                  />
                </div>
              </div>
            </div>


          </div>

          {/* Informações de página */}
          {!loading && items.length > 0 && (
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-white/80 text-sm">
                  <span className="font-bold text-white">
                    {((currentPage - 1) * 20) + 1}-{((currentPage - 1) * 20) + items.length}
                  </span> de <span className="font-bold text-white">{totalResults.toLocaleString()}</span> {getMediaTypeLabel().toLowerCase()}{totalResults !== 1 ? 's' : ''}
                  {searchQuery && (
                    <span className="text-blue-300"> para "{searchQuery}"</span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-white/80">
                  Página <span className="font-bold text-white">{currentPage}</span> de <span className="font-bold text-white">{totalPages}</span>
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16 fade-in">
              <p className="text-white/60 mt-4 text-lg">Carregando {getMediaTypeLabel().toLowerCase()}s...</p>
              <p className="text-white/40 text-sm mt-2">Buscando os melhores conteúdos para você</p>
            </div>
          ) : (
            <>
              {/* Grid/List de Resultados */}
              <div className={cn(
                viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
                  : "space-y-4 mb-8",
                "fade-in"
              )}>
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

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="mt-12 fade-in">
                  <div className="glass border border-white/10 rounded-2xl p-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      className="justify-center"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Estado Vazio ou Erro - COMPONENTE UNIFICADO */}
          {(!loading && items.length === 0) || error ? (
            <div className="text-center py-20 fade-in">
              <div className="glass border border-white/10 rounded-2xl p-12 max-w-md mx-auto hover-lift">
                {/* Ícone dinâmico baseado no estado */}
                <div className="text-6xl mb-6 opacity-50">
                  🔍
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Nenhum resultado encontrado!
                </h3>
                <p className="text-white/60 mb-8">
                  Ocorreu um erro ao buscar os itens. Tente novamente
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">

                  {/* Botão principal de ação */}
                  <Button
                    variant="primary"
                    onClick={() => {
                      // Se for erro, apenas tenta recarregar
                      if (error) {
                        setError(null);
                        refreshItems();
                      } else {
                        // Se for estado vazio, limpa tudo e recarrega
                        setSearchQuery('');
                        setSelectedGenre('');
                        setSortBy(mediaType === 'books' ? 'relevance' : 'popularity');
                        setTimeout(refreshItems, 100);
                      }
                    }}
                    className="bg-gradient-primary hover:bg-gradient-secondary"
                    icon={RefreshCw}
                  >
                    Tentar novamente
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal de Formulário */}
      <MediaFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        mediaType={getStoreMediaType()}
        initialData={editingMedia || undefined}
        externalData={selectedMediaData}
        onSubmit={editingMedia ? handleEditMedia : handleAddMedia}
      />
    </div>
  );
}