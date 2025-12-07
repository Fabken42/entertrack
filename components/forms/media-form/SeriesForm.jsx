// /components/forms/media-form/SeriesForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseMediaForm from './BaseMediaForm';
import { Input } from '@/components/ui';

const seriesSchema = z.object({
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

const SeriesForm = (props) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(seriesSchema),
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
      mediaType: 'series',
      progress: baseData.status === 'in_progress' ? {
        currentEpisode: baseData.progress?.currentEpisode || 0,
        currentSeason: baseData.progress?.currentSeason || 1,
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
  const SeriesSpecificFields = ({ currentStatus, register, errors }) => {
    const showSeasonEpisode = currentStatus === 'in_progress';
    
    if (!showSeasonEpisode) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-700">
        {showSeasonEpisode && (
          <Input
            label="Temporada Atual"
            type="number"
            {...register('progress.currentSeason', { valueAsNumber: true })}
            error={errors.progress?.currentSeason?.message}
            placeholder="1"
          />
        )}
        
        {showSeasonEpisode && (
          <Input
            label="Episódio Atual"
            type="number"
            {...register('progress.currentEpisode', { valueAsNumber: true })}
            error={errors.progress?.currentEpisode?.message}
            placeholder="5"
          />
        )}
      </div>
    );
  };

  return (
    <BaseMediaForm
      mediaType="series"
      initialData={props.initialData}
      externalData={props.externalData}
      manualCreateQuery={props.manualCreateQuery}
      onCancel={props.onCancel}
      loading={props.loading}
      onSubmit={handleSubmit}
      selectedRating={selectedRating}
      onRatingChange={handleRatingChange}
    >
      <SeriesSpecificFields 
        register={register}
        errors={errors}
      />
    </BaseMediaForm>
  );
};

export default SeriesForm;