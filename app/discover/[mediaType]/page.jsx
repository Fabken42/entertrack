// /app/discover/[mediaType]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Button, Card, CardContent, Select } from '@/components/ui';
import { Grid, List, Star, TrendingUp, Calendar, Users, BookOpen, Tv, GamepadIcon } from 'lucide-react';
import Pagination from '../../../components/ui/pagination/Pagination';

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
  // NOVOS ESTADOS para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (mediaType) {
      fetchGenres();
    }
  }, [mediaType]);

  useEffect(() => {
    if (mediaType) {
      setCurrentPage(1); // Reset para página 1 quando mudar filtros
      fetchDiscoveryItems();
    }
  }, [mediaType, sortBy, selectedGenre]);

  useEffect(() => {
    if (mediaType && currentPage > 1) {
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
        limit: '50',
        ...(selectedGenre && { genre: selectedGenre })
      });

      console.log('Frontend - Fetching:', {
        mediaType,
        sortBy,
        selectedGenre,
        currentPage,
        limit: 50,
        url: `/api/discover/${mediaType}?${queryParams}`
      });

      const response = await fetch(`/api/discover/${mediaType}?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch discovery items');
      }
      const data = await response.json();

      console.log('Frontend - Received:', {
        totalItems: data.results?.length || 0,
        totalResults: data.total,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        itemsPerPage: data.itemsPerPage
      });

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

  // NOVA FUNÇÃO: Mudar página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getMediaTypeLabel = () => {
    const labels = {
      movies: 'Filme',
      series: 'Série',
      animes: 'Anime',
      mangas: 'Mangá', // NOVO
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
      mangas: '📚', // NOVO - ícone diferente dos livros
      books: '📖',
      games: '🎮'
    };
    return icons[mediaType] || '✨';
  };

  const handleAddToLibrary = (item) => {
    // Implementar a lógica para adicionar à biblioteca
    console.log('Adicionar à biblioteca:', item);
    // Aqui você pode abrir o modal de formulário como nas outras páginas
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
    if (mediaType === 'books') {
      // Google Books só suporta 'relevance' e 'newest'
      return [
        { value: 'popularity', label: 'Mais Relevantes', icon: TrendingUp },
        { value: 'newest', label: 'Mais Recentes', icon: Calendar },
      ];
    }

    // Mangás têm as mesmas opções de ordenação que animes
    if (mediaType === 'mangas' || mediaType === 'animes') {
      return [
        { value: 'popularity', label: 'Mais Populares', icon: TrendingUp },
        { value: 'rating', label: 'Melhores Avaliados', icon: Star },
        { value: 'newest', label: 'Mais Recentes', icon: Calendar },
      ];
    }

    return [
      { value: 'popularity', label: 'Mais Populares', icon: TrendingUp },
      { value: 'rating', label: 'Melhores Avaliados', icon: Star },
      { value: 'newest', label: 'Mais Recentes', icon: Calendar },
    ];
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
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
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Filters - CORES AJUSTADAS PARA O TEMA ESCURO */}
          <div className="bg-card p-4 rounded-lg border border-border mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Visualização:</span>
                <div className="flex bg-secondary rounded-lg p-1">
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

          {/* Results Count - ATUALIZADO */}
          {!loading && items.length > 0 && (
            <div className="mb-4 flex justify-between items-center">
              <p className="text-muted-foreground">
                Mostrando {((currentPage - 1) * 50) + 1}-{((currentPage - 1) * 50) + items.length} de {totalResults} {getMediaTypeLabel().toLowerCase()}{totalResults !== 1 ? 's' : ''}
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
                {selectedGenre
                  ? `Não encontramos ${getMediaTypeLabel().toLowerCase()} no gênero selecionado. Tente outro gênero.`
                  : `Tente alterar os filtros de ordenação.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Componente MediaCard ATUALIZADO com suporte a mangás e cores do tema escuro
function MediaCard({ item, mediaType, viewMode, onAddToLibrary }) {
  const formatNumber = (num) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPopularity = (popularity) => {
    if (!popularity) return 'N/A';
    return `#${popularity.toLocaleString('pt-BR')}`; // Número completo com separadores brasileiros
  };

  const getRatingColor = (rating, maxRating = 10) => {
    if (!rating) return 'text-gray-500';
    const percentage = (rating / maxRating) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  if (viewMode === 'list') {
    return (
      <div className="flex items-start gap-4 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors bg-card">
        <img
          src={item.imageUrl || '/placeholder-image.jpg'}
          alt={item.title}
          className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg mb-1">{item.title}</h3>

          {/* Informações básicas */}
          <div className="flex flex-wrap items-center gap-4 mb-2 text-sm text-muted-foreground">
            {item.releaseYear && (
              <span>{item.releaseYear}</span>
            )}
            {item.rating && (
              <span className={`flex items-center gap-1 font-medium ${getRatingColor(item.rating)}`}>
                <Star className="w-4 h-4 fill-current" />
                {item.rating.toFixed(1)}
                {item.ratingsCount && (
                  <span className="text-muted-foreground text-xs">
                    ({formatNumber(item.ratingsCount)})
                  </span>
                )}
              </span>
            )}
            
            {/* Informações específicas por tipo de mídia */}
            {mediaType === 'animes' && item.episodes && (
              <span>{item.episodes} episódios</span>
            )}
            {mediaType === 'mangas' && item.volumes && (
              <span>{item.volumes} volumes</span>
            )}
            {mediaType === 'mangas' && item.chapters && (
              <span>• {item.chapters} capítulos</span>
            )}
            {mediaType === 'books' && item.pageCount && (
              <span>{item.pageCount} páginas</span>
            )}
            
            {/* ADICIONADO: Número de membros */}
            {item.members && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {formatNumber(item.members)}
              </span>
            )}
          </div>

          {/* Autores para mangás */}
          {mediaType === 'mangas' && item.authors && item.authors.length > 0 && (
            <div className="mb-2">
              <span className="text-sm text-muted-foreground">
                por <span className="font-medium text-foreground">{item.authors.join(', ')}</span>
              </span>
            </div>
          )}

          {/* Informações adicionais */}
          <div className="flex flex-wrap gap-2 mb-3">
            {item.voteCount && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                {formatNumber(item.voteCount)} votos
              </span>
            )}
            {/* MODIFICADO: Popularidade com # */}
            {item.popularity && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                {formatPopularity(item.popularity)}
              </span>
            )}
            {item.metacritic && (
              <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full border border-green-800/50">
                Metacritic: {item.metacritic}
              </span>
            )}
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
        <Button variant="primary" size="sm" onClick={() => onAddToLibrary(item)}>
          Adicionar
        </Button>
      </div>
    );
  }

  // View Mode Grid (ATUALIZADO para mangás e cores do tema escuro)
  return (
    <Card variant="elevated" className="hover:shadow-lg transition-shadow h-full flex flex-col group bg-card border-border">
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Imagem */}
        <div className="relative mb-4">
          <img
            src={item.imageUrl || '/placeholder-image.jpg'}
            alt={item.title}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
          {/* Badge de avaliação */}
          {item.rating && (
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-card/90 border border-border ${getRatingColor(item.rating)}`}>
              ⭐ {item.rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Título */}
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        {/* Informações básicas */}
        <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
          {item.releaseYear && (
            <span>{item.releaseYear}</span>
          )}
          {/* Informações específicas por tipo */}
          {mediaType === 'animes' && item.episodes && (
            <span>• {item.episodes} eps</span>
          )}
          {mediaType === 'mangas' && item.volumes && (
            <span>• {item.volumes} vol</span>
          )}
          {mediaType === 'mangas' && item.chapters && (
            <span>• {item.chapters} cap</span>
          )}
          {mediaType === 'books' && item.pageCount && (
            <span>• {item.pageCount} pág</span>
          )}
        </div>

        {/* Autores para mangás */}
        {mediaType === 'mangas' && item.authors && item.authors.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground line-clamp-1">
              por <span className="font-medium text-foreground">{item.authors.join(', ')}</span>
            </p>
          </div>
        )}

        {/* Estatísticas detalhadas */}
        <div className="space-y-2 mb-4 flex-1">
          {/* ADICIONADO: Número de membros */}
          {item.members && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Membros:</span>
              <span className="font-medium text-foreground">{formatNumber(item.members)}</span>
            </div>
          )}
          {item.ratingsCount && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Avaliações:</span>
              <span className="font-medium text-foreground">{formatNumber(item.ratingsCount)}</span>
            </div>
          )}
          {item.voteCount && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Votos:</span>
              <span className="font-medium text-foreground">{formatNumber(item.voteCount)}</span>
            </div>
          )}
          {/* MODIFICADO: Popularidade com # */}
          {item.popularity && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Popularidade:</span>
              <span className="font-medium text-foreground">{formatPopularity(item.popularity)}</span>
            </div>
          )}
          {item.metacritic && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Metacritic:</span>
              <span className="font-medium text-green-400">{item.metacritic}</span>
            </div>
          )}
        </div>

        {/* Descrição */}
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
            {item.description}
          </p>
        )}

        {/* Botão de ação */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {item.rating && item.ratingsCount && (
              <span>
                {item.rating.toFixed(1)} ⭐ ({formatNumber(item.ratingsCount)})
              </span>
            )}
          </div>
          <Button variant="primary" size="sm" onClick={() => onAddToLibrary(item)}>
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}