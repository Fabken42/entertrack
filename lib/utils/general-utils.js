import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatApiRating = (rating, divideBy = 2) => {
  if (!rating) return null;

  return {
    display: (rating / divideBy).toFixed(1),
    original: rating.toFixed(1),
    base: 10
  };
};

export const formatRuntime = (minutes) => {
  if (!minutes && minutes !== 0) return '—';

  const mins = parseInt(minutes, 10);

  if (isNaN(mins)) return '—';

  if (mins < 60) {
    return `${mins}m`;
  }

  const hours = Math.floor(mins / 60);
  const remainingMinutes = mins % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

export const convertToMinutes = (hours, minutes) => {
  return (hours || 0) * 60 + (minutes || 0);
};

export const convertFromMinutes = (totalMinutes) => {
  if (!totalMinutes && totalMinutes !== 0) return { hours: 0, minutes: 0 };
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
};

export const validateProgress = (hours, minutes) => {
  if ((!hours && hours !== 0) && (!minutes && minutes !== 0)) {
    return true; // Permite campo vazio
  }

  const totalMins = convertToMinutes(hours || 0, minutes || 0);

  // Não pode ser negativo
  if (totalMins < 0) {
    return 'Tempo não pode ser negativo';
  }

  // Se temos runtime total, valida contra ele
  if (totalMinutes && totalMins > totalMinutes) {
    return `Tempo não pode ser maior que ${totalMinutes} minutos (${formatRuntime(totalMinutes)})`;
  }

  return true;
};

export const formatNumber = (num) => {
  if (!num || num === 0) return '—';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const formatPopularity = (popularity) => {
  if (!popularity || popularity === 0) return '—';
  return `#${popularity.toLocaleString('pt-BR')}`;
};

export const formatMembers = (members) => {
  if (!members) return '—';
  if (members >= 1000000) return (members / 1000000).toFixed(1) + 'M';
  if (members >= 1000) return (members / 1000).toFixed(1) + 'K';
  return members.toString();
};

export const shouldShowCount = (count) => {
  return count && count > 0;
};