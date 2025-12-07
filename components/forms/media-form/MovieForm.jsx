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
    currentTimeHours: z.number().min(0).max(23).optional(),
    currentTimeMinutes: z.number().min(0).max(59).optional(),
    currentTimeSeconds: z.number().min(0).max(59).optional(),
  }).optional(),
});

const MovieForm = (props) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(movieSchema),
    defaultValues: props.initialData ? {
      ...props.initialData,
      progress: props.initialData.progress || {},
    } : props.externalData ? {
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

  const handleSubmit = (baseData) => {
    const formData = {
      ...baseData,
      mediaType: 'movie',
      progress: baseData.status === 'in_progress' ? {
        currentTimeHours: baseData.progress?.currentTimeHours || 0,
        currentTimeMinutes: baseData.progress?.currentTimeMinutes || 0,
        currentTimeSeconds: baseData.progress?.currentTimeSeconds || 0,
      } : undefined,
    };
    props.onSubmit(formData);
  };

  const [selectedRating, setSelectedRating] = React.useState(
    props.initialData?.rating
  );

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
    setValue('rating', rating, { shouldValidate: true });
  };

  // Componente para os campos específicos
  const MovieSpecificFields = ({ currentStatus, register, errors }) => {
    const showCurrentTime = currentStatus === 'in_progress';
    
    if (!showCurrentTime) return null;
    
    return (
      <div className="space-y-6 pt-6 border-t border-gray-700">
        <h4 className="text-md font-medium text-white">Minutagem do Filme</h4>
        
        {showCurrentTime && (
          <div>
            <h5 className="text-sm font-medium text-gray-300 mb-3">Minutagem Atual (onde parou)</h5>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Horas</label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  {...register('progress.currentTimeHours', { valueAsNumber: true })}
                  error={errors.progress?.currentTimeHours?.message}
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Minutos</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  {...register('progress.currentTimeMinutes', { valueAsNumber: true })}
                  error={errors.progress?.currentTimeMinutes?.message}
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Segundos</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  {...register('progress.currentTimeSeconds', { valueAsNumber: true })}
                  error={errors.progress?.currentTimeSeconds?.message}
                  placeholder="45"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <BaseMediaForm
      mediaType="movie"
      initialData={props.initialData}
      externalData={props.externalData}
      manualCreateQuery={props.manualCreateQuery}
      onCancel={props.onCancel}
      loading={props.loading}
      onSubmit={handleSubmit}
      selectedRating={selectedRating}
      onRatingChange={handleRatingChange}
    >
      <MovieSpecificFields 
        register={register}
        errors={errors}
      />
    </BaseMediaForm>
  );
};

export default MovieForm;