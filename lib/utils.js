import { STATUS_LABELS, RATING_LABELS, MEDIA_TYPES } from '@/constants';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Funções utilitárias para trabalhar com os dados
export const getStatusLabel = (status) => {
  return STATUS_LABELS[status];
};

export const getRatingLabel = (rating) => {
  return RATING_LABELS[rating];
};

export const getMediaTypeLabel = (mediaType) => {
  return MEDIA_TYPES[mediaType];
};

export const filterMediaByType = (media, mediaType) => {
  return media.filter(item => item.mediaType === mediaType);
};

export const filterMediaByStatus = (media, status) => {
  return media.filter(item => item.status === status);
};

export const getProgressPercentage = (media) => {
  if (!media.progress) return 0;

  switch (media.mediaType) {
    case 'movie':
      if (media.progress.currentTime && media.progress.totalTime) {
        return (media.progress.currentTime / media.progress.totalTime) * 100;
      }
      break;
    
    case 'series':
    case 'anime':
      if (media.progress.currentEpisode && media.progress.totalEpisodes) {
        return (media.progress.currentEpisode / media.progress.totalEpisodes) * 100;
      }
      break;
    
    case 'book':
      if (media.progress.currentPage && media.progress.totalPages) {
        return (media.progress.currentPage / media.progress.totalPages) * 100;
      }
      break;
    
    case 'game':
      return media.progress.completionPercentage || 0;
  }

  return 0;
};

// Formatar tempo em segundos para string legível
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Formatar data
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};