// lib/schemas/series-schema.ts
import z from "zod";

const genreSchema = z.object({
  id: z.number().int().min(0),
  name: z.string()
});

export const seriesSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional().default(''),
  releasePeriod: z.object({
    year: z.union([
      z.number().min(1900).max(new Date().getFullYear() + 5),
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
  seasons: z.union([
    z.number().int().min(1),
    z.string().transform(val => val === '' ? undefined : Number(val)).optional(),
    z.null(),
    z.undefined()
  ]).optional(),
  episodes: z.union([
    z.number().int().min(1),
    z.string().transform(val => val === '' ? undefined : Number(val)).optional(),
    z.null(),
    z.undefined()
  ]).optional(),
  episodesPerSeason: z.array(z.number().int().min(1)).optional().default([]),
  progress: z.object({
    seasons: z.union([
      z.number().min(1),
      z.string().transform(val => val === '' ? 1 : Number(val)),
      z.null()
    ]).optional().default(1),
    episodes: z.union([
      z.number().min(0),
      z.string().transform(val => val === '' ? 0 : Number(val)),
      z.null()
    ]).optional().default(0),
  }).optional().nullable().default(null),
});