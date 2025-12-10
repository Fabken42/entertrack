// /media/media-card/MediaCard.jsx

import React from 'react';
import Card from '../../ui/card/Card';
import { CardContent } from '../../ui/card/Card';
import Button from '../../ui/button/Button';
import { Star, Users, TrendingUp, Edit, Calendar, Clock, BookOpen, Film, Tv, GamepadIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MediaCard({
  item,
  mediaType,
  viewMode,
  onAddToLibrary,
  onEditClick,
  isLibrary = false
}) {
  const formatNumber = (num) => {
    if (!num || num === 0) return '—';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPopularity = (popularity) => {
    if (!popularity || popularity === 0) return '—';
    return `#${popularity.toLocaleString('pt-BR')}`;
  };

  const formatRating = (rating) => {
    if (!rating || rating === 0) return null;

    const numericRating = Number(rating);
    if (isNaN(numericRating)) return null;

    // Para animes e mangás, converte de base 10 para base 5
    if (mediaType === 'animes' || mediaType === 'mangas' || mediaType === 'movies' || mediaType === 'series') {
      return {
        display: (numericRating / 2).toFixed(1),
        max: 5,
        original: numericRating.toFixed(1)
      };
    }

    return {
      display: numericRating.toFixed(1),
      max: 5,
      original: numericRating.toFixed(1)
    };
  };

  const getRatingColor = (rating, maxRating = 10) => {
    if (!rating || rating === 0) return 'text-white/40';

    const adjustedRating = mediaType === 'animes' || mediaType === 'mangas'
      ? (rating / 2)
      : rating;

    const percentage = (adjustedRating / maxRating) * 100;
    if (percentage >= 80) return 'text-emerald-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getMediaIcon = () => {
    switch (mediaType) {
      case 'animes': return Tv;
      case 'movies': return Film;
      case 'series': return Tv;
      case 'mangas': return BookOpen;
      case 'books': return BookOpen;
      case 'games': return GamepadIcon;
      default: return Sparkles;
    }
  };

  const getMediaColor = () => {
    switch (mediaType) {
      case 'animes': return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'movies': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'series': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'mangas': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'books': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'games': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'dropped': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'planned': return 'Planejado';
      case 'in_progress': return 'Em Progresso';
      case 'completed': return 'Concluído';
      case 'dropped': return 'Abandonado';
      default: return status;
    }
  };

  const formatChaptersVolumes = (value, status) => {
    if (value === 0 && status !== 'finished') return '?';
    return value;
  };

  const shouldShowCount = (count) => {
    return count && count > 0;
  };

  const handleCardClick = () => {
    if (!isLibrary && onAddToLibrary) {
      onAddToLibrary(item);
    }
  };

  const MediaIcon = getMediaIcon();
  const mediaColor = getMediaColor();
  const ratingInfo = formatRating(item.rating);

  if (viewMode === 'list') {
    return (
      <div
        className="glass flex items-start gap-4 p-4 border border-white/10 rounded-xl hover:border-white/30 hover:bg-white/5 transition-all duration-300 cursor-pointer group hover-lift"
        onClick={handleCardClick}
      >
        {/* Imagem */}
        <div className="relative flex-shrink-0">
          <img
            src={item.imageUrl || '/images/icons/placeholder-image.png'}
            alt={item.title}
            className="w-20 h-28 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/images/icons/placeholder-image.png';
            }}
          />
          
          {/* Badge de tipo */}
          <div className={cn(
            "absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border",
            mediaColor
          )}>
            <div className="flex items-center gap-1">
              <MediaIcon className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between">
            <div>
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
            
            {/* Rating */}
            {ratingInfo && (
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10",
                getRatingColor(item.rating, ratingInfo.max)
              )}>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{ratingInfo.display}/5</span>
                </div>
              </div>
            )}
          </div>

          {/* Informações específicas */}
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

          {/* Status da biblioteca */}
          {isLibrary && item.status && (
            <div className={cn(
              "inline-flex px-3 py-1 rounded-full text-xs font-medium border",
              getStatusColor(item.status)
            )}>
              {getStatusLabel(item.status)}
            </div>
          )}

          {/* Descrição */}
          {item.description && (
            <p className="text-sm text-white/60 line-clamp-2 group-hover:line-clamp-3 transition-all">
              {item.description}
            </p>
          )}
        </div>

        {/* Botão Editar */}
        {isLibrary && onEditClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(item);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity !p-2 hover:bg-white/10"
            icon={Edit}
          />
        )}
      </div>
    );
  }

  // View Mode Grid
  return (
    <Card
      variant="glass"
      className="h-full flex flex-col group cursor-pointer hover-lift relative overflow-hidden"
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
                getRatingColor(item.rating, ratingInfo.max)
              )}>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{ratingInfo.display}/5</span>
                </div>
              </div>
            )}
          </div>

          {/* Botão Editar */}
          {isLibrary && onEditClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditClick(item);
              }}
              className="absolute bottom-2 right-2 p-2 bg-gray-900/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-gray-900 border border-white/20 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
              title="Editar"
            >
              <Edit className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Título */}
        <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {item.title}
        </h3>

        {/* Informações básicas */}
        <div className="flex items-center gap-2 mb-3 text-sm text-white/60">
          {item.releaseYear && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{item.releaseYear}</span>
            </div>
          )}
          {mediaType === 'animes' && item.episodes && (
            <span className="flex items-center gap-1">
              <span>•</span>
              <span>{item.episodes} eps</span>
            </span>
          )}
          {mediaType === 'mangas' && item.volumes && (
            <span className="flex items-center gap-1">
              <span>•</span>
              <span>{formatChaptersVolumes(item.volumes, item.status)} vol</span>
            </span>
          )}
          {mediaType === 'books' && item.pageCount && (
            <span className="flex items-center gap-1">
              <span>•</span>
              <span>{item.pageCount} pág</span>
            </span>
          )}
        </div>

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

        {/* Estatísticas */}
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

        {/* Descrição */}
        {item.description && (
          <p className="text-sm text-white/60 line-clamp-3 mb-4 flex-1 group-hover:line-clamp-4 transition-all">
            {item.description}
          </p>
        )}

        {/* Footer com estatísticas de rating */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
          {ratingInfo && shouldShowCount(item.ratingsCount) && (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="font-medium text-white">{ratingInfo.display}/5</span>
              </div>
              <span className="text-white/40">•</span>
              <span>{formatNumber(item.ratingsCount)} avaliações</span>
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