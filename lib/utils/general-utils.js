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