import z from "zod";

export const movieSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional().default(''),
  releaseYear: z.union([
    z.number().min(1800).max(new Date().getFullYear() + 5),
    z.string().transform(val => val === '' ? undefined : Number(val)).optional(),
    z.null(),
    z.undefined()
  ]).optional(),
  genres: z.array(z.string()).optional().default([]),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  userRating: z.union([
    z.number().min(1).max(5),
    z.literal(''),
    z.null(),
    z.undefined()
  ]).optional(),
  personalNotes: z.string().max(3000, 'Notas pessoais não podem exceder 3000 caracteres').optional().default(''),
  coverImage: z.string().url('URL inválida').optional().or(z.literal('')).or(z.undefined()),
  runtime: z.union([
    z.number().int().min(1),
    z.string().transform(val => val === '' ? undefined : Number(val)).optional(),
    z.null(),
    z.undefined()
  ]).optional(),
  progress: z.object({
    hours: z.union([
      z.number().min(0).max(24),
      z.string().transform(val => val === '' ? 0 : Number(val)),
      z.null()
    ]).optional().default(0),
    minutes: z.union([
      z.number().min(0).max(59),
      z.string().transform(val => val === '' ? 0 : Number(val)),
      z.null()
    ]).optional().default(0),
  }).optional().nullable().default(null),
});