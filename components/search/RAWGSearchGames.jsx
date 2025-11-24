// /entertrack/components/search/RAWGSearchGames.jsx

'use client';

import React, { useState } from 'react';
import { useRAWGSearch } from '@/lib/hooks/use-rawg-games';
import { Modal, Button, Input } from '@/components/ui';
import { Search, X, GamepadIcon, Star, Plus, Clock, Trophy } from 'lucide-react';
import { rawgClient } from '@/lib/api/rawg';

const RAWGSearchGames = ({ 
  isOpen, 
  onClose, 
  onSelectGame,
  onManualCreate 
}) => {
  const [query, setQuery] = useState('');
  const { games, loading, error } = useRAWGSearch(query);

  const handleSelectGame = (game) => {
    const mediaData = {
      externalId: game.id.toString(),
      title: game.name,
      description: game.description,
      imageUrl: game.imageUrl,
      releaseYear: game.released ? new Date(game.released).getFullYear() : undefined,
      genres: game.genres || [],
      mediaType: 'game',
      apiRating: game.rating,
      apiVoteCount: game.ratingsCount,
      // Campos específicos para games
      metadata: {
        platforms: game.platforms,
        developers: game.developers,
        publishers: game.publishers,
        metacritic: game.metacritic,
        playtime: game.playtime,
        esrbRating: game.esrbRating,
        tags: game.tags
      }
    };
    
    onSelectGame(mediaData);
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

  const formatRating = (rating) => {
    if (!rating) return 'N/A';
    return rating.toFixed(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
  };

  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Buscar Jogos"
    size="xl"
  >
    <div className="p-6 bg-gray-800">
      {/* Barra de busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Buscar jogos..."
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
            <p className="text-gray-400 mt-2">Buscando jogos...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && query && (
          <>
            {/* Jogos encontrados */}
            {games.length > 0 && (
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                  <GamepadIcon className="w-5 h-5" />
                  Jogos encontrados ({games.length})
                </h3>
                <div className="space-y-3">
                  {games.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      className="w-full flex items-start gap-4 p-4 rounded-lg border border-gray-600 hover:border-blue-500 hover:bg-gray-700 transition-colors text-left"
                    >
                      {game.imageUrl ? (
                        <img
                          src={game.imageUrl}
                          alt={game.name}
                          className="w-16 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-20 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <GamepadIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white text-lg">{game.name}</h4>
                          <div className="flex items-center gap-2">
                            {game.metacritic && (
                              <div className="flex items-center gap-1 bg-green-900 text-green-300 px-2 py-1 rounded-full text-sm font-medium">
                                <Trophy className="w-3 h-3" />
                                <span>{game.metacritic}</span>
                              </div>
                            )}
                            {game.rating > 0 && (
                              <div className="flex items-center gap-1 bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full text-sm font-medium">
                                <Star className="w-4 h-4 fill-current" />
                                <span>{formatRating(game.rating)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-2">
                          {game.released && (
                            <span>
                              {formatDate(game.released)}
                            </span>
                          )}
                          {game.playtime > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {game.playtime}h
                            </span>
                          )}
                          {game.platforms && game.platforms.length > 0 && (
                            <span className="max-w-xs truncate">
                              {game.platforms.slice(0, 2).join(', ')}
                              {game.platforms.length > 2 && '...'}
                            </span>
                          )}
                        </div>
                        
                        {game.genres && game.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {game.genres.slice(0, 3).map((genre, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {game.description && (
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {game.description}
                          </p>
                        )}
                        
                        {/* Informações da API */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {game.rating > 0 && (
                            <span>
                              Nota RAWG: <strong className="text-gray-400">{game.rating.toFixed(2)}/5</strong>
                            </span>
                          )}
                          {game.ratingsCount > 0 && (
                            <span>
                              <strong className="text-gray-400">{game.ratingsCount.toLocaleString()}</strong> avaliações
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
                  {games.length === 0 
                    ? `Não encontramos "${query}" no RAWG.`
                    : `Não encontrou o jogo que procura?`
                  }
                </p>
                <Button
                  variant="outline"
                  icon={Plus}
                  onClick={handleManualCreate}
                >
                  {games.length === 0 
                    ? `Adicionar "${query}" manualmente` 
                    : 'Criar jogo manualmente'
                  }
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Instruções */}
        {!query && (
          <div className="text-center py-8 text-gray-400">
            Digite o nome de um jogo para buscar no RAWG
          </div>
        )}
      </div>
    </div>
  </Modal>
);
};

export default RAWGSearchGames;