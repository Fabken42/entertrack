// /components/forms/media-form/MangaForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseMediaForm from './BaseMediaForm';
import { Input } from '@/components/ui';

const mangaSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'great', 'perfect']).optional(),
  comment: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  progress: z.object({
    currentVolume: z.number().min(0).optional(),
    currentPage: z.number().min(0).optional(),
  }).optional(),
});

const MangaForm = (props) => {
  const [selectedRating, setSelectedRating] = React.useState(
    props.initialData?.rating
  );

  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(mangaSchema),
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
      mediaType: 'manga',
      progress: baseData.status === 'in_progress' ? {
        currentVolume: baseData.progress?.currentVolume || 0,
        currentPage: baseData.progress?.currentPage || 0,
      } : undefined,
    };
    props.onSubmit(formData);
  };

  // Componente para os campos específicos
  const MangaSpecificFields = ({ currentStatus, register, errors }) => {
    const showVolumePage = currentStatus === 'in_progress';
    
    if (!showVolumePage) return null;
    
    return (
      <div className="space-y-6 pt-6 border-t border-gray-700">
        <h4 className="text-md font-medium text-white">Progresso de Leitura</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {showVolumePage && (
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-300">Posição Atual</h5>
              <Input
                label="Volume Atual"
                type="number"
                {...register('progress.currentVolume', { valueAsNumber: true })}
                error={errors.progress?.currentVolume?.message}
                placeholder="5"
              />

              <Input
                label="Página Atual"
                type="number"
                {...register('progress.currentPage', { valueAsNumber: true })}
                error={errors.progress?.currentPage?.message}
                placeholder="42"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <BaseMediaForm
      mediaType="manga"
      initialData={props.initialData}
      externalData={props.externalData}
      manualCreateQuery={props.manualCreateQuery}
      onCancel={props.onCancel}
      loading={props.loading}
      onSubmit={handleSubmit}
      selectedRating={selectedRating}
      onRatingChange={handleRatingChange}
    >
      <MangaSpecificFields 
        register={register}
        errors={errors}
      />
    </BaseMediaForm>
  );
};

export default MangaForm;