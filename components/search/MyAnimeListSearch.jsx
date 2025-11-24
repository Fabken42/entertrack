// /components/search/MyAnimeListSearch.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Modal } from '@/components/ui';
import { Search, Plus, BookOpen, Tv, Users, TrendingUp, Star, X } from 'lucide-react';
import { useMyAnimeListSearch } from '@/lib/hooks/use-myanimelist';

const MyAnimeListSearch = ({
  isOpen,
  onClose,
  onSelectMedia,
  onManualCreate,
  mediaType = 'anime' // 'anime' ou 'manga' - definido pela página
}) => {
  const [query, setQuery] = useState('');
  const { results, loading, error } = useMyAnimeListSearch(query, mediaType);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const handleSelect = (item) => {
    onSelectMedia(item);
    onClose();
    setQuery('');
  };

  const handleManualCreateClick = () => {
    if (query.trim()) {
      onManualCreate(query.trim());
      onClose();
      setQuery('');
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  // Função para formatar números (membros)
  const formatMembers = (members) => {
    if (!members) return 'N/A';
    if (members >= 1000000) {
      return (members / 1000000).toFixed(1) + 'M';
    }
    if (members >= 1000) {
      return (members / 1000).toFixed(1) + 'K';
    }
    return members.toString();
  };

  // Função para formatar popularidade
  const formatPopularity = (popularity) => {
    if (!popularity) return 'N/A';
    return `#${popularity.toLocaleString('pt-BR')}`;
  };

  // Função para converter nota de 10 para 5
  const formatRating = (rating) => {
    return (rating / 2).toFixed(1);
  };

  const getMediaTypeConfig = () => {
    const configs = {
      anime: {
        title: 'Animes',
        placeholder: 'Buscar animes...',
        icon: Tv,
        singular: 'anime',
        plural: 'animes'
      },
      manga: {
        title: 'Mangás',
        placeholder: 'Buscar mangás...',
        icon: BookOpen,
        singular: 'mangá',
        plural: 'mangás'
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

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Buscando {config.plural}...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              {error}
            </div>
          ) : !loading && !error && query ? (
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
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-start gap-4 p-4 rounded-lg border border-gray-600 hover:border-blue-500 hover:bg-gray-700 transition-colors text-left"
                      >
                        <img
                          src={item.imageUrl || '/placeholder-image.jpg'}
                          alt={item.title}
                          className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-white text-lg">
                              {item.title}
                            </h4>
                            {item.rating && (
                              <div className="flex items-center gap-1 bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full text-sm font-medium">
                                <Star className="w-4 h-4 fill-current" />
                                <span>{formatRating(item.rating)}</span>
                                <span className="text-xs text-yellow-400">
                                  ({item.scoreCount?.toLocaleString() || '0'})
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Título em Inglês */}
                          {item.englishTitle && item.englishTitle !== item.title && (
                            <p className="text-sm text-gray-400 mb-2">
                              {item.englishTitle}
                            </p>
                          )}

                          {/* Informações específicas por tipo */}
                          {mediaType === 'anime' && item.episodes && (
                            <p className="text-sm text-gray-400 mb-2">
                              {item.episodes} episódios
                              {item.releaseYear && ` • ${item.releaseYear}`}
                            </p>
                          )}

                          {mediaType === 'manga' && (
                            <p className="text-sm text-gray-400 mb-2">
                              {item.volumes ? `${item.volumes} volumes` : '? volumes'}
                              {item.chapters ? ` • ${item.chapters} capítulos` : ' • ? capítulos'}
                              {item.releaseYear && ` • ${item.releaseYear}`}
                            </p>
                          )}

                          {/* Descrição */}
                          {item.description && (
                            <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                              {item.description}
                            </p>
                          )}

                          {/* Informações da API */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {item.rating && (
                              <span>
                                Nota MyAnimeList: <strong className="text-gray-400">{item.rating.toFixed(1)}/10</strong>
                              </span>
                            )}
                            {item.scoreCount && (
                              <span>
                                <strong className="text-gray-400">{item.scoreCount.toLocaleString()}</strong> votos
                              </span>
                            )}
                            {item.popularity && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Popularidade: <strong className="text-gray-400">{formatPopularity(item.popularity)}</strong>
                              </span>
                            )}
                            {item.members && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Membros: <strong className="text-gray-400">{formatMembers(item.members)}</strong>
                              </span>
                            )}
                          </div>

                          {/* Status e Rank */}
                          <div className="flex items-center gap-2 mt-2">
                            {item.status && (
                              <span className="inline-block px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs capitalize">
                                {item.status.replace('_', ' ')}
                              </span>
                            )}
                            {item.rank && (
                              <span className="inline-block px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs">
                                Rank #{item.rank}
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
                      ? `Não encontramos "${query}" no MyAnimeList.`
                      : `Não encontrou o ${config.singular} que procura?`
                    }
                  </p>
                  <Button
                    variant="outline"
                    icon={Plus}
                    onClick={handleManualCreateClick}
                  >
                    {results.length === 0
                      ? `Adicionar "${query}" manualmente`
                      : `Criar ${config.singular} manualmente`
                    }
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Instruções quando não há busca */
            !query && (
              <div className="text-center py-8 text-gray-400">
                Digite o nome de um {config.singular} para buscar no MyAnimeList
              </div>
            )
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MyAnimeListSearch;