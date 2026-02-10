// /app/discover/[mediaType]/page.jsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button, Select, Input } from '@/components/ui';
import { Grid, List, Star, TrendingUp, Calendar, Search, Users, Filter, ArrowUpDown, Layers, Tag, RefreshCw, Film, Tv, Tv2, BookOpen, Gamepad, ChevronDown, ChevronUp, Sliders } from 'lucide-react';
import Pagination from '@/components/ui/pagination/Pagination';
import MediaCard from '@/components/media/MediaCard';
import MediaFormModal from '@/components/forms/media-form/MediaFormModal';
import { useMediaStore } from '@/store/media-store';
import { cn } from '@/lib/utils/general-utils';
import { FETCH_MEDIA_ITEMS_LIMIT } from '@/constants';

// Adicione esta função auxiliar para obter a temporada atual
const getCurrentSeason = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() retorna 0-11
  const year = now.getFullYear();

  // Determinar temporada baseada no mês
  let season;
  if (month >= 1 && month <= 3) {
    season = 'winter';
  } else if (month >= 4 && month <= 6) {
    season = 'spring';
  } else if (month >= 7 && month <= 9) {
    season = 'summer';
  } else {
    season = 'fall';
  }

  return { year, season };
};

export default function DiscoverPage() {
  const params = useParams();
  const mediaType = params.mediaType;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMediaData, setSelectedMediaData] = useState(null);

  // Obter temporada atual uma vez
  const currentSeason = getCurrentSeason();

  const [filters, setFilters] = useState({
    minRating: '',
    minVotes: '',
    minScore: '',
    minMetacritic: '',
    // Inicializar com valores vazios
    seasonYear: '',
    season: ''
  });

  const [searchMode, setSearchMode] = useState('discover');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const fetchTimeoutRef = useRef(null);
  const { addMedia } = useMediaStore();

  const fetchDiscoveryItems = useCallback(async () => {
    // Cancelar fetch anterior pendente
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Adicionar um pequeno delay para agrupar chamadas rápidas
    fetchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          sortBy,
          page: currentPage.toString(),
          ...(selectedGenre && { genre: selectedGenre }),
          ...(searchQuery && { query: searchQuery }),
          ...(filters.minRating && { minRating: filters.minRating }),
          ...(filters.minVotes && { minVotes: filters.minVotes }),
          ...(filters.minScore && { minScore: filters.minScore }),
          ...(filters.minMetacritic && { minMetacritic: filters.minMetacritic }),
          // Adicione os parâmetros de temporada
          ...(mediaType === 'anime' && filters.seasonYear && { seasonYear: filters.seasonYear }),
          ...(mediaType === 'anime' && filters.season && { season: filters.season }),
          // Adicione o modo de busca
          ...(mediaType === 'anime' && searchMode && { searchMode })
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
    }, 100); // 100ms de debounce
  }, [mediaType, sortBy, selectedGenre, searchQuery, currentPage, filters, searchMode]);

  useEffect(() => {
    if (mediaType) {
      fetchDiscoveryItems();
    }

    // Cleanup
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [mediaType, sortBy, selectedGenre, searchQuery, currentPage, fetchDiscoveryItems]);

  useEffect(() => {
    if (mediaType) {
      fetchGenres();
    }
  }, [mediaType]);

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

  // Função para atualizar filtros quando o modo de busca muda
  const handleSearchModeChange = (mode) => {
    if (mode === 'season') {
      // Quando mudar para "Animes da Temporada", preencher automaticamente com a temporada atual
      setFilters({
        ...filters,
        seasonYear: currentSeason.year.toString(),
        season: currentSeason.season
      });
    } else {
      // Quando mudar para outro modo, limpar os filtros de temporada
      setFilters({
        ...filters,
        seasonYear: '',
        season: ''
      });
    }
    setSearchMode(mode);
    setCurrentPage(1);
  };

  const handleAddToLibrary = (item) => {
    setSelectedMediaData(item);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedMediaData(null);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddMedia = async (data) => {
    try {
      await addMedia({
        ...data,
        mediaType,
      });
    } catch (error) {
      console.error('DiscoverPage: addMedia error:', error);
    }
  };

  const getMediaTypeLabel = () => {
    const labels = {
      movie: 'Filme',
      series: 'Série',
      anime: 'Anime',
      manga: 'Mangá',
      game: 'Jogo'
    };
    return labels[mediaType] || 'Mídia';
  };

  const getMediaTypeIcon = () => {
    const icons = {
      movie: Film,
      series: Tv,
      anime: Tv2, // Usar Tv2 igual em /anime
      manga: BookOpen,
      game: Gamepad
    };
    return icons[mediaType] || null;
  };

  const getMediaTypeColor = () => {
    const colors = {
      movie: 'bg-cyan-500/20 text-cyan-400',
      series: 'bg-green-500/20 text-green-400',
      anime: 'bg-red-500/20 text-red-400',
      manga: 'bg-orange-500/20 text-orange-400',
      game: 'bg-purple-500/20 text-purple-400'
    };
    return colors[mediaType] || 'bg-gray-500/20 text-gray-400';
  };

  const refreshItems = () => {
    setCurrentPage(1);
    if (mediaType === 'anime') {
      setSearchMode('discover');
    }
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
      case 'manga':
      case 'anime':
        return [
          { value: 'popularity', label: 'Mais Populares', icon: TrendingUp },
          { value: 'rating', label: 'Melhores Avaliados', icon: Star },
          { value: 'newest', label: 'Mais Recentes', icon: Calendar },
        ];
      case 'game':
        return [
          { value: 'popularity', label: 'Mais Populares', icon: TrendingUp },
          { value: 'rating', label: 'Melhores Avaliados', icon: Star },
          { value: 'newest', label: 'Mais Recentes', icon: Calendar },
        ];
      case 'movie':
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
          {/* Cabeçalho */}
          <div className="mb-8 glass rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg w-12 h-12 flex items-center justify-center ${getMediaTypeColor().split(' ')[0]}`}>
                  {(() => {
                    const IconComponent = getMediaTypeIcon();
                    const colorClass = getMediaTypeColor().split(' ')[1];
                    return IconComponent ? (
                      <IconComponent className={`w-6 h-6 ${colorClass}`} />
                    ) : (
                      <span className="text-2xl leading-none">{getMediaTypeIcon()}</span>
                    );
                  })()}
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

          {/* Container Principal de Filtros */}
          <div className="glass mb-8 rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-xl overflow-hidden">
            {/* Barra Superior de Filtros Principais */}
            <div className="p-6 border-b border-white/10">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-4 items-start justify-between">
                {/* Filtros Principais */}
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-wrap">
                  {/* Campo de Busca */}
                  <div className="w-full sm:flex-1 min-w-[250px] lg:w-64">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Input
                        type="text"
                        placeholder={`Buscar ${getMediaTypeLabel().toLowerCase()}...`}
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        variant="glass"
                        className="pl-10 bg-gray-800/50 border-white/10 text-white placeholder:text-white/40 h-11"
                        iconLeft={Search}
                      />
                    </div>
                  </div>

                  {/* Filtro de Gênero */}
                  <div className="w-full sm:flex-1 min-w-[250px] lg:w-56">
                    <Select
                      value={selectedGenre}
                      onChange={(e) => {
                        setSelectedGenre(e.target.value);
                        setCurrentPage(1);
                      }}
                      options={genres.map(genre => ({
                        value: genre.id,
                        label: genre.name,
                        icon: genre.id === '' ? Layers : Tag
                      }))}
                      variant="glass"
                      className="bg-gray-800/50 border-white/10 h-11"
                      placeholder="Todos os Gêneros"
                      icon={Filter}
                    />
                  </div>

                  {/* Ordenação */}
                  <div className="w-full sm:flex-1 min-w-[250px] lg:w-56">
                    <Select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                      options={getSortOptions().map(option => ({
                        value: option.value,
                        label: option.label,
                        icon: option.icon
                      }))}
                      variant="glass"
                      className="bg-gray-800/50 border-white/10 h-11"
                      placeholder="Ordenar por"
                      icon={ArrowUpDown}
                    />
                  </div>
                </div>

                {/* Controles à Direita */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
                  {/* Botão de Visualização */}
                  <div className="flex bg-gray-800/50 rounded-xl p-1 border border-white/10">
                    <Button
                      variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`!p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      icon={Grid}
                      tooltip="Visualização em Grid"
                    />
                    <Button
                      variant={viewMode === 'list' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={`!p-2 rounded-lg transition-all duration-300 ${viewMode === 'list'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      icon={List}
                      tooltip="Visualização em Lista"
                    />
                  </div>

                  {/* Botão Filtros Avançados */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="bg-gray-800/50 border-white/10 text-white hover:bg-gray-700/50 h-11 px-4 w-full sm:w-auto"
                    icon={showAdvancedFilters ? ChevronUp : ChevronDown}
                    iconPosition="right"
                  >
                    {showAdvancedFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Filtros Avançados (Abrível/Fechável) */}
            {showAdvancedFilters && (
              <div className="p-6 bg-gray-800/30 animate-fadeIn">
                <div className="flex items-center gap-2 mb-4">
                  <Sliders className="w-4 h-4 text-white/60" />
                  <h3 className="text-sm font-medium text-white/80">Filtros Avançados</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Modo de Busca para Animes - ATUALIZADO */}
                  {mediaType === 'anime' && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Modo de Busca
                      </label>
                      <Select
                        value={searchMode}
                        onChange={(e) => {
                          handleSearchModeChange(e.target.value);
                        }}
                        options={[
                          { value: 'discover', label: 'Descobrir Animes' },
                          { value: 'season', label: 'Animes da Temporada' }
                        ]}
                        variant="glass"
                        className="bg-gray-800/50 border-white/10 h-10 text-sm w-full"
                      />
                    </div>
                  )}

                  {/* Filtros Específicos por Tipo de Mídia */}
                  {(mediaType === 'movie' || mediaType === 'series') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Nota Mínima (0-5)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={filters.minRating}
                          onChange={(e) => {
                            setFilters({ ...filters, minRating: e.target.value });
                            setCurrentPage(1);
                          }}
                          placeholder="Ex: 3.5"
                          variant="glass"
                          className="bg-gray-800/50 border-white/10 h-10 text-sm w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Mín. de Votos
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="100"
                          value={filters.minVotes}
                          onChange={(e) => {
                            setFilters({ ...filters, minVotes: e.target.value });
                            setCurrentPage(1);
                          }}
                          placeholder="Ex: 1000"
                          variant="glass"
                          className="bg-gray-800/50 border-white/10 h-10 text-sm w-full"
                        />
                      </div>
                    </>
                  )}

                  {mediaType === 'anime' && searchMode === 'season' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Ano da Temporada
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            min="2000"
                            max={new Date().getFullYear() + 1}
                            value={filters.seasonYear}
                            onChange={(e) => {
                              setFilters({ ...filters, seasonYear: e.target.value });
                              setCurrentPage(1);
                            }}
                            placeholder="Ex: 2024"
                            variant="glass"
                            className="bg-gray-800/50 border-white/10 h-10 text-sm w-full"
                          />
                          {filters.seasonYear === currentSeason.year.toString() && (
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              Atual
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Temporada
                        </label>
                        <div className="relative">
                          <Select
                            value={filters.season}
                            onChange={(e) => {
                              setFilters({ ...filters, season: e.target.value });
                              setCurrentPage(1);
                            }}
                            options={[
                              { value: 'winter', label: 'Inverno' },
                              { value: 'spring', label: 'Primavera' },
                              { value: 'summer', label: 'Verão' },
                              { value: 'fall', label: 'Outono' }
                            ]}
                            variant="glass"
                            className="bg-gray-800/50 border-white/10 h-10 text-sm w-full"
                            placeholder="Selecionar temporada"
                          />
                          {filters.season === currentSeason.season && (
                            <span className="absolute right-10 top-1/2 transform -translate-y-1/2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              Atual
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {mediaType === 'anime' && searchMode === 'discover' && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Nota Mínima (0-5)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={filters.minScore}
                        onChange={(e) => {
                          setFilters({ ...filters, minScore: e.target.value });
                          setCurrentPage(1);
                        }}
                        placeholder="Ex: 3.5"
                        variant="glass"
                        className="bg-gray-800/50 border-white/10 h-10 text-sm w-full"
                      />
                    </div>
                  )}

                  {mediaType === 'manga' && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Nota Mínima (0-5)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={filters.minScore}
                        onChange={(e) => {
                          setFilters({ ...filters, minScore: e.target.value });
                          setCurrentPage(1);
                        }}
                        placeholder="Ex: 3.5"
                        variant="glass"
                        className="bg-gray-800/50 border-white/10 h-10 text-sm w-full"
                      />
                    </div>
                  )}

                  {mediaType === 'game' && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Metacritic Mínimo
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.minMetacritic}
                        onChange={(e) => {
                          setFilters({ ...filters, minMetacritic: e.target.value });
                          setCurrentPage(1);
                        }}
                        placeholder="Ex: 75"
                        variant="glass"
                        className="bg-gray-800/50 border-white/10 h-10 text-sm w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Botões de Ação - ATUALIZADO */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-white/10">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilters({
                          minRating: '',
                          minVotes: '',
                          minScore: '',
                          minMetacritic: '',
                          seasonYear: searchMode === 'season' ? currentSeason.year.toString() : '',
                          season: searchMode === 'season' ? currentSeason.season : ''
                        });
                        if (searchMode === 'season') {
                          // Manter o modo season
                          setCurrentPage(1);
                        } else {
                          setSearchMode('discover');
                          setCurrentPage(1);
                        }
                      }}
                      icon={RefreshCw}
                      className="bg-gray-800/50 border-white/10 text-white hover:bg-gray-700/50 h-10"
                    >
                      Limpar Filtros
                    </Button>
                    {/* Botão para usar temporada atual */}
                    {mediaType === 'anime' && searchMode === 'season' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFilters({
                            ...filters,
                            seasonYear: currentSeason.year.toString(),
                            season: currentSeason.season
                          });
                          setCurrentPage(1);
                        }}
                        className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 h-10"
                        icon={Calendar}
                      >
                        Usar Temporada Atual
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {!loading && items.length > 0 && (
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-white/80 text-sm">
                  <span className="font-bold text-white">
                    {(currentPage - 1) * FETCH_MEDIA_ITEMS_LIMIT + 1}-{Math.min(currentPage * FETCH_MEDIA_ITEMS_LIMIT, totalResults)}
                  </span>
                  {' de '}
                  <span className="font-bold text-white">{totalResults.toLocaleString()}</span>
                  {' '}{getMediaTypeLabel().toLowerCase()}{totalResults !== 1 ? 's' : ''}
                  <span className="ml-2 text-white/60">
                    (pág. {currentPage} de {totalPages})
                  </span>
                  {searchQuery && (
                    <span className="ml-2">
                      · Busca: <span className="font-bold text-white">"{searchQuery}"</span>
                    </span>
                  )}
                  {selectedGenre && (
                    <span className="ml-2">
                      · Gênero: <span className="font-bold text-white">
                        {genres.find(g => g.id === selectedGenre)?.name || selectedGenre}
                      </span>
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span>Ordenado por:</span>
                  <span className="font-medium text-white">
                    {getSortOptions().find(s => s.value === sortBy)?.label}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16 fade-in">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white/60"></div>
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

          {/* Estado Vazio ou Erro */}
          {(!loading && items.length === 0) || error ? (
            <div className="text-center py-20 fade-in">
              <div className="glass border border-white/10 rounded-2xl p-12 max-w-md mx-auto fade-in">
                <div className="text-6xl mb-6 opacity-50">
                  🔍
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Nenhum resultado encontrado!
                </h3>
                <p className="text-white/60 mb-8">
                  {error ? 'Ocorreu um erro ao buscar os itens.' : 'Tente ajustar os filtros ou buscar outro termo.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (error) {
                        setError(null);
                        refreshItems();
                      } else {
                        setSearchQuery('');
                        setSelectedGenre('');
                        setSortBy('popularity');
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
        externalData={selectedMediaData}
        onSubmit={handleAddMedia}
        mediaType={mediaType}
      />
    </div>
  );
}