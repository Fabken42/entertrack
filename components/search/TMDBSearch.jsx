// /components/search/TMDBSearch.jsx
'use client';

import React, { useState } from 'react';
import { useTMDBSearch } from '@/lib/hooks/use-tmdb';
import { Modal, Button, Input } from '@/components/ui';
import { Search, X, Film, Tv, Star, Plus } from 'lucide-react';
import { tmdbClient } from '@/lib/api/tmdb';

const TMDBSearch = ({ 
  isOpen, 
  onClose, 
  onSelectMedia,
  onManualCreate,
  mediaType = 'movie' // 'movie' ou 'series'
}) => {
  const [query, setQuery] = useState('');
  const { results, loading, error } = useTMDBSearch(query, mediaType);

  const handleSelectMedia = (item) => {
    const mediaData = {
      externalId: item.id.toString(),
      title: mediaType === 'movie' ? item.title : item.name,
      description: item.overview,
      imageUrl: tmdbClient.getPosterURL(item.poster_path),
      releaseYear: getReleaseYear(item),
      genres: [],
      mediaType: mediaType,
      apiRating: item.vote_average,
      apiVoteCount: item.vote_count,
      ...(mediaType === 'series' && {
        firstAirDate: item.first_air_date,
        lastAirDate: item.last_air_date,
        numberOfSeasons: item.number_of_seasons,
        numberOfEpisodes: item.number_of_episodes,
        status: item.status
      }),
      ...(mediaType === 'movie' && {
        releaseDate: item.release_date,
        runtime: item.runtime
      })
    };
    
    onSelectMedia(mediaData);
    onClose();
  };

  const handleManualCreate = () => {
    if (query.trim()) {
      onManualCreate(query);
      onClose();
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  const getReleaseYear = (item) => {
    const date = mediaType === 'movie' ? item.release_date : item.first_air_date;
    return date ? new Date(date).getFullYear() : undefined;
  };

  const formatRating = (rating) => {
    return (rating / 2).toFixed(1);
  };

  const getMediaTypeConfig = () => {
    const configs = {
      movie: {
        title: 'Filmes',
        placeholder: 'Buscar filmes...',
        icon: Film,
        singular: 'filme',
        plural: 'filmes'
      },
      series: {
        title: 'Séries',
        placeholder: 'Buscar séries...',
        icon: Tv,
        singular: 'série',
        plural: 'séries'
      }
    };
    return configs[mediaType];
  };

  const config = getMediaTypeConfig();
  const MediaIcon = config.icon;

  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={`Buscar ${config.title}`}
    size="xl"
  >
    <div className="p-6 bg-gray-800">
      {/* Barra de busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder={config.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Resultados */}
      <div className="max-h-96 overflow-y-auto">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Buscando {config.plural}...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && query && (
          <>
            {/* Resultados encontrados */}
            {results.length > 0 && (
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                  <MediaIcon className="w-5 h-5" />
                  {config.title} encontrados ({results.length})
                </h3>
                <div className="space-y-3">
                  {results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectMedia(item)}
                      className="w-full flex items-start gap-4 p-4 rounded-lg border border-gray-600 hover:border-blue-500 hover:bg-gray-700 transition-colors text-left"
                    >
                      {item.poster_path ? (
                        <img
                          src={tmdbClient.getPosterURL(item.poster_path) || ''}
                          alt={mediaType === 'movie' ? item.title : item.name}
                          className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-24 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MediaIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white text-lg">
                            {mediaType === 'movie' ? item.title : item.name}
                          </h4>
                          {item.vote_average > 0 && (
                            <div className="flex items-center gap-1 bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full text-sm font-medium">
                              <Star className="w-4 h-4 fill-current" />
                              <span>{formatRating(item.vote_average)}</span>
                              <span className="text-xs text-yellow-400">
                                ({item.vote_count.toLocaleString()})
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Informações específicas por tipo */}
                        {mediaType === 'movie' && item.release_date && (
                          <p className="text-sm text-gray-400 mb-2">
                            {new Date(item.release_date).getFullYear()}
                            {item.runtime && ` • ${item.runtime} min`}
                          </p>
                        )}
                        
                        {mediaType === 'series' && item.first_air_date && (
                          <p className="text-sm text-gray-400 mb-2">
                            Estreia: {new Date(item.first_air_date).getFullYear()}
                            {item.number_of_seasons && ` • ${item.number_of_seasons} temporada${item.number_of_seasons > 1 ? 's' : ''}`}
                            {item.number_of_episodes && ` • ${item.number_of_episodes} episódios`}
                          </p>
                        )}
                        
                        {item.overview && (
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {item.overview}
                          </p>
                        )}
                        
                        {/* Informações da API */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {item.vote_average > 0 && (
                            <span>
                              Nota TMDB: <strong className="text-gray-400">{item.vote_average.toFixed(1)}/10</strong>
                            </span>
                          )}
                          {item.vote_count > 0 && (
                            <span>
                              <strong className="text-gray-400">{item.vote_count.toLocaleString()}</strong> votos
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Opção de criação manual */}
            <div className="border-t border-gray-600 pt-4">
              <div className="text-center">
                <p className="text-gray-400 mb-3">
                  {results.length === 0 
                    ? `Não encontramos "${query}" no TMDB.`
                    : `Não encontrou o ${config.singular} que procura?`
                  }
                </p>
                <Button
                  variant="outline"
                  icon={Plus}
                  onClick={handleManualCreate}
                >
                  {results.length === 0 
                    ? `Adicionar "${query}" manualmente` 
                    : `Criar ${config.singular} manualmente`
                  }
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Instruções */}
        {!query && (
          <div className="text-center py-8 text-gray-400">
            Digite o nome de um {config.singular} para buscar no TMDB
          </div>
        )}
      </div>
    </div>
  </Modal>
);
};

export default TMDBSearch;