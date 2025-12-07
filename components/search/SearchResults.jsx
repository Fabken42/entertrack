'use client';

import React from 'react';
import { Loader2, Tv, Film, Book, GamepadIcon, Users, TrendingUp, Star } from 'lucide-react';

// Função para normalizar os resultados de diferentes APIs
const normalizeSearchResults = (results, mediaType) => {
  if (!results || !Array.isArray(results)) return [];
  
  if (mediaType === 'book') {
    return results.map(book => ({
      id: book.id,
      title: book.title,
      description: book.description,
      imageUrl: book.imageUrl,
      releaseYear: book.releaseYear || (book.publishedDate ? new Date(book.publishedDate).getFullYear() : undefined),
      genres: book.categories || [],
      rating: book.averageRating,
      scoreCount: book.ratingsCount,
      englishTitle: book.subtitle,
      metadata: {
        authors: book.authors || [],
        pageCount: book.pageCount,
        publisher: book.publisher,
        isbn: book.isbn
      }
    }));
  } else if (mediaType === 'game') {
    return results.map(game => ({
      id: game.id,
      title: game.name,
      description: game.description,
      imageUrl: game.imageUrl,
      releaseYear: game.released ? new Date(game.released).getFullYear() : undefined,
      genres: game.genres || [],
      rating: game.rating,
      scoreCount: game.ratingsCount,
      metadata: {
        platforms: game.platforms,
        metacritic: game.metacritic,
        playtime: game.playtime
      }
    }));
  } else if (mediaType === 'movie' || mediaType === 'series') {
    return results.map(item => ({
      id: item.id,
      title: mediaType === 'movie' ? item.title : item.name,
      description: item.overview,
      imageUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      releaseYear: mediaType === 'movie' ? 
        (item.release_date ? new Date(item.release_date).getFullYear() : undefined) :
        (item.first_air_date ? new Date(item.first_air_date).getFullYear() : undefined),
      genres: [], // TMDB não fornece gêneros na busca básica
      rating: item.vote_average,
      scoreCount: item.vote_count,
      ...(mediaType === 'series' && {
        numberOfSeasons: item.number_of_seasons,
        numberOfEpisodes: item.number_of_episodes
      }),
      ...(mediaType === 'movie' && {
        runtime: item.runtime
      })
    }));
  }
  // Para anime e manga (MyAnimeList) - já estão no formato correto
  return results.map(item => ({
    ...item,
    // Garantir que os campos existam
    rating: item.rating || item.score,
    scoreCount: item.scoreCount || item.scored_by,
    releaseYear: item.releaseYear || item.year
  }));
};

const SearchResults = ({
  results,
  loading,
  error,
  mediaType,
  onSelect,
  query
}) => {
  const getMediaTypeConfig = () => {
    const configs = {
      anime: {
        title: 'Animes',
        icon: Tv,
        singular: 'anime',
        plural: 'animes'
      },
      movie: {
        title: 'Filmes',
        icon: Film,
        singular: 'filme',
        plural: 'filmes'
      },
      series: {
        title: 'Séries',
        icon: Tv,
        singular: 'série',
        plural: 'séries'
      },
      manga: {
        title: 'Mangás',
        icon: Book,
        singular: 'mangá',
        plural: 'mangás'
      },
      book: {
        title: 'Livros',
        icon: Book,
        singular: 'livro',
        plural: 'livros'
      },
      game: {
        title: 'Jogos',
        icon: GamepadIcon,
        singular: 'jogo',
        plural: 'jogos'
      }
    };
    return configs[mediaType] || { title: 'Resultados', icon: null, singular: 'item', plural: 'itens' };
  };

  const config = getMediaTypeConfig();
  const MediaIcon = config.icon;

  // Funções auxiliares
  const formatRating = (rating, maxRating = 10) => {
    if (!rating) return null;
    // Para Google Books (0-5) e RAWG (0-5), converte para 0-5
    if (mediaType === 'book' || mediaType === 'game') {
      return rating.toFixed(1);
    }
    // Para TMDB (0-10) e MyAnimeList (0-10), converte para 0-5
    return (rating / 2).toFixed(1);
  };

  const formatMembers = (members) => {
    if (!members) return null;
    if (members >= 1000000) return (members / 1000000).toFixed(1) + 'M';
    if (members >= 1000) return (members / 1000).toFixed(1) + 'K';
    return members.toString();
  };

  const formatPopularity = (popularity) => {
    if (!popularity) return null;
    return `#${popularity.toLocaleString('pt-BR')}`;
  };

  const normalizedResults = normalizeSearchResults(results, mediaType);

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
        <div className="p-4 text-center">
          <Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-500" />
          <p className="text-gray-400 mt-2">Buscando {config.plural}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
        <div className="p-4 text-center text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!query || normalizedResults.length === 0) {
    if (query && normalizedResults.length === 0) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          <div className="p-4 text-center text-gray-400">
            Não encontramos "{query}"
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
          {MediaIcon && <MediaIcon className="w-5 h-5" />}
          <span>{normalizedResults.length} {config.plural} encontrados</span>
        </div>
        
        <div className="space-y-3">
          {normalizedResults.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full flex items-start gap-4 p-4 rounded-lg border border-gray-600 hover:border-blue-500 hover:bg-gray-700 transition-colors text-left group"
            >
              {/* Imagem */}
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              ) : (
                <div className="w-16 h-24 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  {MediaIcon && <MediaIcon className="w-8 h-8 text-gray-500" />}
                </div>
              )}

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                {/* Título e Nota */}
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>
                  
                  {item.rating && (
                    <div className="flex items-center gap-1 bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full text-sm font-medium">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{formatRating(item.rating)}</span>
                      {item.scoreCount && (
                        <span className="text-xs text-yellow-400 ml-1">
                          ({item.scoreCount.toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Título em Inglês (se disponível e diferente) */}
                {item.englishTitle && item.englishTitle !== item.title && (
                  <p className="text-sm text-gray-400 mb-2">
                    {item.englishTitle}
                  </p>
                )}

                {/* Informações específicas */}
                <div className="text-sm text-gray-400 mb-2 space-y-1">
                  {/* Animes */}
                  {mediaType === 'anime' && item.episodes && (
                    <p>{item.episodes} episódios{item.releaseYear && ` • ${item.releaseYear}`}</p>
                  )}

                  {/* Mangás */}
                  {mediaType === 'manga' && (
                    <p>
                      {item.volumes ? `${item.volumes} volumes` : '? volumes'}
                      {item.chapters && ` • ${item.chapters} capítulos`}
                      {item.releaseYear && ` • ${item.releaseYear}`}
                    </p>
                  )}

                  {/* Filmes */}
                  {mediaType === 'movie' && (
                    <p>
                      {item.releaseYear && `${item.releaseYear}`}
                      {item.runtime && ` • ${item.runtime} min`}
                    </p>
                  )}

                  {/* Séries */}
                  {mediaType === 'series' && (
                    <p>
                      {item.releaseYear && `Estreia: ${item.releaseYear}`}
                      {item.numberOfSeasons && ` • ${item.numberOfSeasons} temporada${item.numberOfSeasons > 1 ? 's' : ''}`}
                      {item.numberOfEpisodes && ` • ${item.numberOfEpisodes} episódios`}
                    </p>
                  )}

                  {/* Livros */}
                  {mediaType === 'book' && item.metadata?.authors && item.metadata.authors.length > 0 && (
                    <p>{item.metadata.authors.join(', ')}</p>
                  )}

                  {/* Jogos */}
                  {mediaType === 'game' && item.releaseYear && (
                    <p>Lançamento: {item.releaseYear}</p>
                  )}
                </div>

                {/* Descrição */}
                {item.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                    {item.description}
                  </p>
                )}

                {/* Metadados da API */}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {/* MyAnimeList */}
                  {(item.scoreCount || item.popularity || item.members) && (
                    <>
                      {item.scoreCount && (
                        <span>
                          <strong className="text-gray-400">{item.scoreCount.toLocaleString()}</strong> votos
                        </span>
                      )}
                      {item.popularity && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {formatPopularity(item.popularity)}
                        </span>
                      )}
                      {item.members && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {formatMembers(item.members)}
                        </span>
                      )}
                    </>
                  )}

                  {/* TMDB, Google Books, RAWG */}
                  {item.scoreCount && !item.members && (
                    <span>
                      <strong className="text-gray-400">{item.scoreCount.toLocaleString()}</strong> avaliações
                    </span>
                  )}
                </div>

                {/* Status */}
                {item.status && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-block px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs capitalize">
                      {item.status.replace('_', ' ')}
                    </span>
                    {item.rank && (
                      <span className="inline-block px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs">
                        Rank #{item.rank}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;