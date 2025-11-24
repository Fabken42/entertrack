import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getProgressPercentage, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui';
import { Rating } from '@/components/ui';
import ProgressBar from '@/components/ui/progress-bar/ProgressBar';
import { Eye, Clock, BookOpen, GamepadIcon, Tv, Edit } from 'lucide-react';

const MediaCard = ({ media, className, onEditClick }) => {
    const progressPercentage = getProgressPercentage(media);

    const getMediaIcon = () => {
        switch (media.mediaType) {
            case 'movie': return <Clock className="w-4 h-4" />;
            case 'series': return <Tv className="w-4 h-4" />;
            case 'anime': return <Eye className="w-4 h-4" />;
            case 'book': return <BookOpen className="w-4 h-4" />;
            case 'game': return <GamepadIcon className="w-4 h-4" />;
            default: return <Eye className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'planned': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'dropped': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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

    const getProgressText = () => {
        if (!media.progress) return null;

        switch (media.mediaType) {
            case 'movie':
                if (media.progress.currentTime && media.progress.totalTime) {
                    const currentMinutes = Math.floor(media.progress.currentTime / 60);
                    const totalMinutes = Math.floor(media.progress.totalTime / 60);
                    return `${currentMinutes}m / ${totalMinutes}m`;
                }
                break;

            case 'series':
            case 'anime':
                if (media.progress.currentEpisode && media.progress.totalEpisodes) {
                    return `Episódio ${media.progress.currentEpisode} / ${media.progress.totalEpisodes}`;
                }
                break;

            case 'book':
                if (media.progress.currentPage && media.progress.totalPages) {
                    return `Página ${media.progress.currentPage} / ${media.progress.totalPages}`;
                }
                break;

            case 'game':
                if (media.progress.completionPercentage) {
                    return `${media.progress.completionPercentage}% completo`;
                }
                break;
        }

        return null;
    };

    return (
  <Card variant="elevated" className={cn('hover:shadow-lg transition-shadow duration-200 bg-gray-800 border-gray-700', className)}>
    <Link href={`/${media.mediaType}s/${media.id}`}>
      <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg bg-gray-700">
        {media.imageUrl ? (
          <img
            src={media.imageUrl}
            alt={media.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-700">
            <div className="text-center text-gray-400">
              {getMediaIcon()}
              <p className="text-sm mt-2">Sem imagem</p>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className={cn(
          'absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium',
          getStatusColor(media.status)
        )}>
          {getStatusLabel(media.status)}
        </div>

        {/* Rating Badge */}
        {media.rating && (
          <div className="absolute top-3 right-3">
            <Rating value={media.rating} size="sm" readonly />
          </div>
        )}

        {onEditClick && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEditClick(media);
            }}
            className="absolute bottom-3 right-3 p-2 bg-gray-600 bg-opacity-90 rounded-full shadow-sm hover:bg-opacity-100 transition-all"
            title="Editar"
          >
            <Edit className="w-4 h-4 text-gray-300" />
          </button>
        )}
      </div>
    </Link>

    <CardContent className="p-4">
      <Link href={`/${media.mediaType}s/${media.id}`}>
        <h3 className="font-semibold text-white hover:text-blue-400 transition-colors mb-2 overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {media.title}
        </h3>
      </Link>

      {media.releaseYear && (
        <p className="text-sm text-gray-400 mb-2">
          {media.releaseYear}
        </p>
      )}

      {media.genres.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {media.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md"
            >
              {genre}
            </span>
          ))}
          {media.genres.length > 2 && (
            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md">
              +{media.genres.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Progress */}
      {media.status === 'in_progress' && progressPercentage > 0 && (
        <div className="space-y-2 mb-3">
          <ProgressBar
            value={progressPercentage}
            size="sm"
            variant={
              progressPercentage < 30 ? 'danger' :
                progressPercentage < 70 ? 'warning' : 'success'
            }
          />
          <p className="text-xs text-gray-400 text-center">
            {getProgressText()}
          </p>
        </div>
      )}

      {/* Dates */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        {media.startedAt && (
          <span>Início: {formatDate(media.startedAt)}</span>
        )}
        {media.finishedAt && (
          <span>Fim: {formatDate(media.finishedAt)}</span>
        )}
      </div>

      {/* Comment Preview */}
      {media.comment && (
        <p className="text-sm text-gray-400 mt-2 overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          "{media.comment}"
        </p>
      )}
    </CardContent>
  </Card>
);
};

export default MediaCard;