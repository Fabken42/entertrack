import z from 'zod';

const genreSchema = z.object({
  id: z.union([
    z.string(),
    z.number()
  ]),
  name: z.string()
});

const taskSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  completed: z.boolean().default(false)
});

export const gameSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional().default(''),
  releasePeriod: z.object({
    year: z.union([
      z.number().min(1950).max(new Date().getFullYear() + 5),
      z.string().transform(val => val === '' ? undefined : Number(val)).optional(),
      z.null(),
      z.undefined()
    ]).optional(),
    month: z.union([
      z.number().min(1).max(12),
      z.string().transform(val => val === '' ? undefined : Number(val)).optional(),
      z.null(),
      z.undefined()
    ]).optional(),
  }).optional().nullable().default(null),
  genres: z.array(genreSchema).optional().default([]),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  userRating: z.union([
    z.number().min(1).max(5),
    z.literal(''),
    z.null(),
    z.undefined()
  ]).optional(),
  personalNotes: z.string().max(3000, 'Notas pessoais não podem exceder 3000 caracteres').optional().default(''),
  coverImage: z.string().url('URL inválida').optional().or(z.literal('')).or(z.undefined()),
  // Campos específicos de jogos
  metacritic: z.union([
    z.number().int().min(0).max(100),
    z.string().transform(val => val === '' ? undefined : Number(val)).optional(),
    z.null(),
    z.undefined()
  ]).optional(),
  platforms: z.array(z.string()).optional().default([]),
  progress: z.object({
    hours: z.union([
      z.number().min(0),
      z.string().transform(val => val === '' ? 0 : Number(val)),
      z.null()
    ]).optional().default(0),
    tasks: z.array(taskSchema).optional().default([])
  }).optional().nullable().default(null),
});