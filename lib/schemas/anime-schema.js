// /lib/schemas/anime-schema.js
import { z } from 'zod';

export const animeSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional().or(z.null()),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  userRating: z.number().min(1).max(5).optional().or(z.literal('')).or(z.null()),
  personalNotes: z.string().max(3000, 'Notas pessoais não podem exceder 3000 caracteres').optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')).or(z.undefined()),
  episodes: z.number().int().min(1, 'Número de episódios é obrigatório').optional(),
  progress: z.object({
    currentEpisode: z.number().min(0).optional().or(z.null()),
  }).optional().or(z.null()),
});
