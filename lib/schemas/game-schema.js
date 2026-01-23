import { z } from 'zod';


export const gameSchema = z.object({
  title: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'perfect'])
    .optional()
    .or(z.literal(''))
    .or(z.null())
    .or(z.undefined()),
  comment: z.string().optional(),
  coverImage: z.string().url('URL inválida').optional().or(z.literal('')),
  hours: z.number().min(0).max(9999).optional(),
});