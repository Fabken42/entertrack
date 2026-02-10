'use client';

import { Loader2, Tv, Film, Book, GamepadIcon, Users, TrendingUp, Star, Calendar, Clock, BookOpen, Search, Target, Trophy } from 'lucide-react';
import { cn, formatRuntime } from '@/lib/utils/general-utils';
import { normalizeSearchResults, formatRating, formatReleasePeriod } from '@/lib/utils/media-utils';
import { formatMembers, formatPopularity } from '@/lib/utils/general-utils';

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
        plural: 'animes',
        color: 'text-pink-400'
      },
      movie: {
        title: 'Filmes',
        icon: Film,
        singular: 'filme',
        plural: 'filmes',
        color: 'text-cyan-400'
      },
      series: {
        title: 'Séries',
        icon: Tv,
        singular: 'série',
        plural: 'séries',
        color: 'text-green-400'
      },
      manga: {
        title: 'Mangás',
        icon: BookOpen,
        singular: 'mangá',
        plural: 'mangás',
        color: 'text-red-400'
      },
      book: {
        title: 'Livros',
        icon: Book,
        singular: 'livro',
        plural: 'livros',
        color: 'text-yellow-400'
      },
      game: {
        title: 'Jogos',
        icon: GamepadIcon,
        singular: 'jogo',
        plural: 'jogos',
        color: 'text-purple-400'
      }
    };
    return configs[mediaType] || { title: 'Resultados', icon: null, singular: 'item', plural: 'itens', color: 'text-gray-400' };
  };

  const config = getMediaTypeConfig();
  const MediaIcon = config.icon;
  console.log('Raw Results:', results[0]);
  const normalizedResults = normalizeSearchResults(results, mediaType);
  console.log('Normalized Results:', normalizedResults[0]);

  if (loading) {
    return (
      <div className="glass border border-white/10 rounded-2xl shadow-2xl max-h-96 overflow-y-auto">
        <div className="p-8 text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-12 h-12 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          </div>
          <div>
            <p className="text-white/90 font-medium">Buscando {config.plural}</p>
            <p className="text-sm text-white/60 mt-1">Aguarde enquanto procuramos por você...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass border border-red-500/20 rounded-2xl shadow-lg">
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/10 rounded-full mb-3">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <p className="text-red-300 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!query || normalizedResults.length === 0) {
    if (query && normalizedResults.length === 0) {
      return (
        <div className="glass border border-white/10 rounded-2xl shadow-lg">
          <div className="p-8 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-full">
              <Search className="w-6 h-6 text-white/40" />
            </div>
            <div>
              <p className="text-white/90 font-medium">Nenhum resultado encontrado</p>
              <p className="text-sm text-white/60 mt-1">Não encontramos "<span className="text-white/80">{query}</span>"</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="glass border border-white/10 rounded-2xl shadow-2xl max-h-[500px] overflow-y-auto backdrop-blur-xl">
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 border-b border-white/10 bg-gray-900/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {MediaIcon && (
              <div className={cn("p-2 rounded-xl bg-white/5", config.color)}>
                <MediaIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-white">
                {normalizedResults.length} {normalizedResults.length === 1 ? `${config.singular} encontrado` : `${config.plural} encontrados`}
              </h3>
              <p className="text-sm text-white/60">Para: "<span className="text-white/80">{query}</span>"</p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-white/5 rounded-full text-sm text-white/60">
            {normalizedResults.length} itens
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="p-3 space-y-2">
        {normalizedResults.map((item, index) => {
          const ratingInfo = formatRating(item.averageRating, mediaType);
          const ratingDisplay = ratingInfo?.display || (item.averageRating ? item.averageRating.toFixed(1) : 'N/A');
          const isHighRating = item.averageRating && item.averageRating >= (mediaType === 'game' ? 4 : 7.5);

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={cn(
                'w-full flex items-start gap-4 p-4 rounded-xl text-left group relative overflow-hidden transition-all duration-300',
                'hover:bg-white/10 hover:border-white/20 border border-white/5',
                'hover:shadow-lg hover:shadow-blue-500/10',
                'hover-lift'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              {/* Imagem */}
              <div className="relative flex-shrink-0">
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/images/icons/placeholder-image.png';
                    }}
                  />
                ) : (
                  <div className="w-16 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-white/10">
                    {MediaIcon && <MediaIcon className="w-8 h-8 text-white/20" />}
                  </div>
                )}

                {/* Badge de rating */}
                {ratingDisplay && ratingDisplay !== 'N/A' && (
                  <div className={cn(
                    "absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
                    "border border-white/10 shadow-lg",
                    isHighRating
                      ? "bg-gradient-to-r from-yellow-900/80 to-yellow-800/80 text-yellow-200"
                      : "bg-gradient-to-r from-gray-900/80 to-gray-800/80 text-white/80"
                  )}>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{ratingDisplay}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Título e informações básicas */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors truncate">
                      {item.title}
                    </h4>
                  </div>
                </div>

                {/* Informações específicas */}
                <div className="flex flex-wrap gap-2">
                  {/* Anos e status */}
                  {item.releasePeriod && (
                    <div className="flex items-center gap-1 text-xs text-white/60 bg-white/5 px-2 py-1 rounded-full">
                      <Calendar className="w-3 h-3" />
                      <span>{formatReleasePeriod(item.releasePeriod)}</span>
                    </div>
                  )}

                  {/* Animes */}
                  {mediaType === 'anime' && item.episodes && (
                    <div className="flex items-center gap-1 text-xs text-white/60 bg-white/5 px-2 py-1 rounded-full">
                      <span>{item.episodes} episódio(s)</span>
                    </div>
                  )}

                  {/* Mangás */}
                  {mediaType === 'manga' && (
                    <div className="flex items-center gap-1 text-xs text-white/60 bg-white/5 px-2 py-1 rounded-full">
                      <span>
                        {item.volumes ? `${item.volumes} vol` : '? vol'}
                        {item.chapters && ` • ${item.chapters} cap`}
                      </span>
                    </div>
                  )}

                  {/* Filmes */}
                  {mediaType === 'movie' && item.runtime && (
                    <div className="flex items-center gap-1 text-xs text-white/60 bg-white/5 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span>{formatRuntime(item.runtime)}</span>
                    </div>
                  )}
                </div>

                {/* Descrição */}
                {item.description && (
                  <p className="text-sm text-white/60 line-clamp-2 group-hover:line-clamp-3 transition-all">
                    {item.description}
                  </p>
                )}

                {/* Estatísticas */}
                <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                  {item.ratingCount != null && item.ratingCount > 0 ? (
                    <div className="flex items-center gap-1 text-xs text-white/60">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span className="font-medium text-white/80">{item.ratingCount.toLocaleString()}</span>
                      <span>votos</span>
                    </div>
                  ) : null}

                  {/* Popularidade */}
                  {item.popularity && (
                    <div className="flex items-center gap-1 text-xs text-white/60">
                      <TrendingUp className="w-3 h-3" />
                      <span>{formatPopularity(item.popularity)}</span>
                    </div>
                  )}

                  {/* Membros */}
                  {item.members && (
                    <div className="flex items-center gap-1 text-xs text-white/60">
                      <Users className="w-3 h-3" />
                      <span>{formatMembers(item.members)} membros</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchResults;