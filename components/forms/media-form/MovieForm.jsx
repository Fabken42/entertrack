// /entertrack/components/forms/media-form/MovieForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseMediaForm from './BaseMediaForm';
import { Input } from '@/components/ui';

// Schema específico para filmes
const movieSchema = z.object({
  // Campos base
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'great', 'perfect']).optional(),
  comment: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  // Campos específicos de filmes
  progress: z.object({
    currentTime: z.number().min(0).optional(),
    totalTime: z.number().min(1).optional(),
  }).optional(),
});

const MovieForm = (props) => {
  const {
    register,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(movieSchema),
    defaultValues: props.initialData ? {
      ...props.initialData,
      progress: props.initialData.progress || {},
    } : props.externalData ? {
      // Pré-preenche com dados externos
      title: props.externalData.title,
      description: props.externalData.description,
      releaseYear: props.externalData.releaseYear,
      genres: props.externalData.genres,
      status: 'planned',
      imageUrl: props.externalData.imageUrl,
      progress: {},
    } : {
      progress: {},
    },
  });

  const status = watch('status');
  const showProgressFields = status === 'in_progress' || status === 'completed';

  const handleSubmit = (baseData) => {
    const formData = {
      ...baseData,
      mediaType: 'movie',
      progress: showProgressFields ? {
        currentTime: baseData.progress?.currentTime || 0,
        totalTime: baseData.progress?.totalTime || 0,
      } : undefined,
    };
    props.onSubmit(formData);
  };

  const [selectedRating, setSelectedRating] = React.useState(
    props.initialData?.rating
  );

  // E a função handleRatingChange:
  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
    setValue('rating', rating, { shouldValidate: true });
  };

  return (
    <BaseMediaForm
      mediaType="movie"
      initialData={props.initialData}
      externalData={props.externalData}
      onCancel={props.onCancel}
      loading={props.loading}
      onSubmit={handleSubmit}
      selectedRating={selectedRating}
      onRatingChange={handleRatingChange}
    >
      {/* Campos específicos de filmes */}
      {showProgressFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-700">
          <Input
            label="Tempo Atual (minutos)"
            type="number"
            {...register('progress.currentTime', { valueAsNumber: true })}
            error={errors.progress?.currentTime?.message}
            placeholder="90"
          />

          <Input
            label="Duração Total (minutos)"
            type="number"
            {...register('progress.totalTime', { valueAsNumber: true })}
            error={errors.progress?.totalTime?.message}
            placeholder="120"
          />
        </div>
      )}
    </BaseMediaForm>
  );
};

export default MovieForm;