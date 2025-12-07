// /components/forms/media-form/AnimeForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseMediaForm from './BaseMediaForm';
import { Input } from '@/components/ui';

const animeSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'great', 'perfect']).optional(),
  comment: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  progress: z.object({
    currentEpisode: z.number().min(0).optional(),
    currentSeason: z.number().min(1).optional(),
  }).optional(),
});

const AnimeForm = (props) => {
  const [selectedRating, setSelectedRating] = React.useState(
    props.initialData?.rating
  );

  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(animeSchema),
    defaultValues: props.initialData ? {
      ...props.initialData,
      progress: props.initialData.progress || {},
      rating: props.initialData.rating,
    } : props.externalData ? {
      title: props.externalData.title,
      description: props.externalData.description,
      releaseYear: props.externalData.releaseYear,
      genres: props.externalData.genres,
      status: 'planned',
      imageUrl: props.externalData.imageUrl,
      progress: {},
      rating: undefined,
    } : {
      progress: {},
      rating: undefined,
    },
  });

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
    setValue('rating', rating, { shouldValidate: true });
  };

  const handleSubmit = (baseData) => {
    const formData = {
      ...baseData,
      mediaType: 'anime',
      progress: baseData.status === 'in_progress' ? {
        currentEpisode: baseData.progress?.currentEpisode || 0,
        currentSeason: baseData.progress?.currentSeason || 1,
      } : undefined,
    };
    props.onSubmit(formData);
  };

  // Componente para os campos específicos
  const AnimeSpecificFields = ({ currentStatus, register, errors }) => {
    const showSeasonEpisode = currentStatus === 'in_progress';
    
    if (!showSeasonEpisode) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-700">
        
        {showSeasonEpisode && (
          <Input
            label="Episódio Atual"
            type="number"
            {...register('progress.currentEpisode', { valueAsNumber: true })}
            error={errors.progress?.currentEpisode?.message}
            placeholder="12"
          />
        )}
      </div>
    );
  };

  return (
    <BaseMediaForm
      mediaType="anime"
      initialData={props.initialData}
      externalData={props.externalData}
      manualCreateQuery={props.manualCreateQuery}
      onCancel={props.onCancel}
      loading={props.loading}
      onSubmit={handleSubmit}
      selectedRating={selectedRating}
      onRatingChange={handleRatingChange}
    >
      <AnimeSpecificFields 
        register={register}
        errors={errors}
      />
    </BaseMediaForm>
  );
};

export default AnimeForm;