// /components/media/MediaCard.jsx

import Card from '../ui/card/Card';
import { CardContent } from '../ui/card/Card';
import { Star, Users, TrendingUp, Calendar, Trash2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils/general-utils';
import { formatNumber, formatPopularity } from '@/lib/utils/general-utils';
import { formatRating, getRatingColor, getProgressInfo, getMediaIcon, getMediaColor, getStatusBorderColor, getStatusColor, getStatusLabel, formatChaptersVolumes } from '@/lib/utils/media-utils';

export default function MediaCard({ 
  item,
  mediaType,
  viewMode,
  onAddToLibrary,
  onDeleteClick,
  onEditClick,
  isLibrary = false
}) {
  const progressInfo = getProgressInfo(item, mediaType, isLibrary);

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('[data-action-button]')) {
      return;
    }

    if (isLibrary && onEditClick) {
      onEditClick(item);
    } else if (!isLibrary && onAddToLibrary) {
      onAddToLibrary(item);
    }
  };

  const MediaIcon = getMediaIcon();
  const mediaColor = getMediaColor();
  const ratingInfo = formatRating(item.rating, mediaType);

  const statusBorderColor = getStatusBorderColor(item.status);
  const shouldShowCount = (count) => !!count && count > 0;

  const showPersonalNotes = isLibrary &&
    (item.status === 'completed' || item.status === 'dropped') &&
    item.personalNotes &&
    item.personalNotes.trim() !== '';

  const shouldShowUserRating = isLibrary &&
    item.userRating &&
    (item.status === 'completed' || item.status === 'dropped');

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          "glass flex items-start gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer group hover-lift relative",
          statusBorderColor,
          "border border-2"
        )}
        onClick={handleCardClick}
      >
        <div className="relative flex-shrink-0">
          <img
            src={item.imageUrl || '/images/icons/placeholder-image.png'}
            alt={item.title}
            className="w-20 h-28 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/images/icons/placeholder-image.png';
            }}
          />

          {/* Ícone do tipo de mídia */}
          <div className={cn(
            "absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border",
            mediaColor
          )}>
            <div className="flex items-center gap-1">
              <MediaIcon className="w-3 h-3" />
            </div>
          </div>

          {/* Botão de deletar - posicionado na imagem */}
          {isLibrary && onDeleteClick && (
            <button
              data-action-button="true"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(item._id);
              }}
              className="absolute -bottom-2 -right-2 p-2 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-500/30 border border-white/20 hover:scale-110 transition-all duration-300 z-10"
              title="Remover da lista"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Cabeçalho com título e informações básicas */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              {item.releaseYear && (
                <div className="flex items-center gap-2 mt-1 text-sm text-white/60">
                  <Calendar className="w-3 h-3" />
                  <span>{item.releaseYear}</span>
                </div>
              )}
            </div>

            {/* Rating geral */}
            {ratingInfo && (
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10",
                "bg-gray-800/60",
                getRatingColor(item.rating, ratingInfo.max)
              )}>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{ratingInfo.display}/5</span>
                </div>
              </div>
            )}
          </div>

          {/* Badges de episódios/volumes */}
          <div className="flex flex-wrap gap-2">
            {mediaType === 'animes' && item.episodes && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 rounded-full text-xs text-white/80">
                {item.episodes} episódios
              </span>
            )}
            {mediaType === 'mangas' && item.volumes && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 rounded-full text-xs text-white/80">
                {formatChaptersVolumes(item.volumes, item.status)} volumes
              </span>
            )}
          </div>

          {/* Status e progresso */}
          <div className="flex items-center gap-3">
            {isLibrary && item.status && (
              <div className={cn(
                "inline-flex px-3 py-1 rounded-full text-xs font-medium border ",
                getStatusColor(item.status)
              )}>
                {getStatusLabel(item.status)}
              </div>
            )}

            {isLibrary && progressInfo && (
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">Progresso</span>
                  <span className="text-white font-medium">
                    {progressInfo.current}/{progressInfo.total} {progressInfo.unit}
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                    style={{ width: `${progressInfo.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Avaliação do usuário */}
          {shouldShowUserRating && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-white/60">Sua avaliação:</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3.5 h-3.5",
                      i < item.userRating
                        ? "text-yellow-400 fill-current"
                        : "text-white/30"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-white">
                ({item.userRating}/5)
              </span>
            </div>
          )}

          {/* Notas pessoais - AGORA logo após a avaliação do usuário */}
          {showPersonalNotes && (
            <div className="mb-3">
              <div className="flex items-center gap-1 mb-1 text-xs text-white/60">
                <MessageSquare className="w-3 h-3" />
                <span className="font-medium">Seu comentário:</span>
              </div>
              <p className="text-sm text-white/70 line-clamp-2 group-hover:line-clamp-3 transition-all bg-white/5 p-2 rounded-lg whitespace-pre-line">
                {item.personalNotes}
              </p>
            </div>
          )}

          {/* Estatísticas - AGORA após as notas pessoais */}
          <div className="space-y-2 mt-3 pt-3 border-t border-white/10">
            {shouldShowCount(item.members) && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Membros:
                </span>
                <span className="font-medium text-white">{formatNumber(item.members)}</span>
              </div>
            )}
            {shouldShowCount(item.ratingsCount) && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Avaliações:
                </span>
                <span className="font-medium text-white">{formatNumber(item.ratingsCount)}</span>
              </div>
            )}
            {shouldShowCount(item.popularity) && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Ranking:
                </span>
                <span className="font-medium text-white">{formatPopularity(item.popularity)}</span>
              </div>
            )}
            {item.metacritic && item.metacritic > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Metacritic:</span>
                <span className="font-medium text-emerald-400">{item.metacritic}</span>
              </div>
            )}
          </div>

          {/* Descrição normal - APENAS para itens NÃO na biblioteca */}
          {!isLibrary && item.description && (
            <p className="text-sm text-white/60 line-clamp-2 group-hover:line-clamp-3 transition-all mt-3 pt-3 border-t border-white/10">
              {item.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card
      variant="glass"
      className={cn(
        "h-full flex flex-col group cursor-pointer hover-lift relative overflow-hidden",
        statusBorderColor
      )}
      onClick={handleCardClick}
    >
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <CardContent className="p-4 flex-1 flex flex-col relative z-10">
        {/* Imagem */}
        <div className="relative mb-4 rounded-xl overflow-hidden">
          <img
            src={item.imageUrl || '/images/icons/placeholder-image.png'}
            alt={item.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = '/images/icons/placeholder-image.png';
            }}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

          {/* Badges superiores */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            {/* Status da biblioteca */}
            {isLibrary && item.status && (
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm border",
                getStatusColor(item.status)
              )}>
                {getStatusLabel(item.status)}
              </div>
            )}

            {/* Rating badge */}
            {ratingInfo && (
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10 shadow-lg",
                "bg-gray-800/60",
                getRatingColor(item.rating, ratingInfo.max)
              )}>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{ratingInfo.display}/5</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Título */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition-colors flex-1">
            {item.title}
          </h3>

          {/* Botão Deletar - SEMPRE VISÍVEL, posicionado ao lado do título */}
          {isLibrary && onDeleteClick && (
            <button
              data-action-button="true"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(item._id);
              }}
              className="p-2 bg-gray-800/60 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-500/20 border border-white/20 hover:scale-110 transition-all duration-300 z-10 flex-shrink-0"
              title="Remover da lista"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>

        {/* Informações básicas */}
        <div className="flex items-center gap-2 mb-3 text-sm text-white/60">
          {item.releaseYear && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{item.releaseYear}</span>
            </div>
          )}

          {mediaType === 'animes' && item.episodes && (
            <>
              <span>•</span>
              <span>{item.episodes} eps</span>
            </>
          )}
          {mediaType === 'mangas' && item.volumes && (
            <>
              <span>•</span>
              <span>{formatChaptersVolumes(item.volumes, item.status)} vol</span>
            </>
          )}
          {mediaType === 'books' && item.pageCount && (
            <>
              <span>•</span>
              <span>{item.pageCount} pág</span>
            </>
          )}
        </div>

        {isLibrary && progressInfo && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">Progresso</span>
              <span className="text-white font-medium">
                {progressInfo.current}/{progressInfo.total} {progressInfo.unit}
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                style={{ width: `${progressInfo.percentage}%` }}
              />
            </div>
            <div className="text-xs text-white/40 text-right mt-0.5">
              {progressInfo.percentage}%
            </div>
          </div>
        )}

        {/* Avaliação do usuário (somente para status concluído/abandonado) */}
        {shouldShowUserRating && (
          <div className="mb-3">
            <div className="flex items-center gap-1">
              <span className="text-xs text-white/60">Sua avaliação:</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3 h-3",
                      i < item.userRating
                        ? "text-yellow-400 fill-current"
                        : "text-white/30"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-white ml-1">
                {item.userRating}/5
              </span>
            </div>
          </div>
        )}

        {/* Autores para mangás */}
        {mediaType === 'mangas' && item.authors && item.authors.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-white/60 line-clamp-1">
              por <span className="font-medium text-white">
                {item.authors.filter(author => author && author.trim() !== '').join(', ')}
              </span>
            </p>
          </div>
        )}

        {showPersonalNotes && (
          <div className="mb-3">
            <div className="flex items-center gap-1 mb-1 text-xs text-white/60">
              <MessageSquare className="w-3 h-3" />
              <span className="font-medium">Seu comentário:</span>
            </div>
            <div className="bg-white/4 p-2 rounded-lg">
              <p className="text-xs text-white/70 line-clamp-3 group-hover:line-clamp-4 transition-all whitespace-pre-line">
                {item.personalNotes}
              </p>
            </div>
          </div>
        )}

        {/* Estatísticas normais - SEMPRE para todos os itens */}
        <div className="space-y-2 mb-4 flex-1">
          {shouldShowCount(item.members) && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Membros:
              </span>
              <span className="font-medium text-white">{formatNumber(item.members)}</span>
            </div>
          )}
          {shouldShowCount(item.ratingsCount) && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60 flex items-center gap-1">
                <Star className="w-3 h-3" />
                Avaliações:
              </span>
              <span className="font-medium text-white">{formatNumber(item.ratingsCount)}</span>
            </div>
          )}
          {shouldShowCount(item.popularity) && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Ranking:
              </span>
              <span className="font-medium text-white">{formatPopularity(item.popularity)}</span>
            </div>
          )}
          {item.metacritic && item.metacritic > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Metacritic:</span>
              <span className="font-medium text-emerald-400">{item.metacritic}</span>
            </div>
          )}
        </div>

        {/* Descrição normal - APENAS para itens NÃO na biblioteca */}
        {!isLibrary && item.description && (
          <p className="text-sm text-white/60 line-clamp-3 mb-4 flex-1 group-hover:line-clamp-4 transition-all">
            {item.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
          {ratingInfo && shouldShowCount(item.ratingsCount) && (
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-900/60 rounded-lg">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="font-medium text-white">{ratingInfo.display}/5</span>
              </div>
              <span className="text-white/40">•</span>
              <span className="text-white/60">{formatNumber(item.ratingsCount)} avaliações</span>
            </div>
          )}

          {/* Indicador de tipo */}
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm border",
            mediaColor
          )}>
            <div className="flex items-center gap-1">
              <MediaIcon className="w-3 h-3" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}