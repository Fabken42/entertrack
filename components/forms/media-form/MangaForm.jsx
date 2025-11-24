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
    totalVolumes: z.number().min(1).optional(),
    currentChapter: z.number().min(0).optional(),
    totalChapters: z.number().min(1).optional(),
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

  const status = watch('status');
  const showProgressFields = status === 'in_progress' || status === 'completed';

  const handleSubmit = (baseData) => {
    const formData = {
      ...baseData,
      mediaType: 'manga',
      progress: showProgressFields ? {
        currentVolume: baseData.progress?.currentVolume || 0,
        totalVolumes: baseData.progress?.totalVolumes || 0,
        currentChapter: baseData.progress?.currentChapter || 0,
        totalChapters: baseData.progress?.totalChapters || 0,
      } : undefined,
    };
    props.onSubmit(formData);
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
      {showProgressFields && (
        <div className="space-y-6 pt-6 border-t border-gray-700">
          <h4 className="text-md font-medium text-white">Progresso de Leitura</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Volumes */}
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-300">Volumes</h5>
              <Input
                label="Volume Atual"
                type="number"
                {...register('progress.currentVolume', { valueAsNumber: true })}
                error={errors.progress?.currentVolume?.message}
                placeholder="5"
              />

              <Input
                label="Total de Volumes"
                type="number"
                {...register('progress.totalVolumes', { valueAsNumber: true })}
                error={errors.progress?.totalVolumes?.message}
                placeholder="20"
              />
            </div>

            {/* Capítulos */}
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-300">Capítulos</h5>
              <Input
                label="Capítulo Atual"
                type="number"
                {...register('progress.currentChapter', { valueAsNumber: true })}
                error={errors.progress?.currentChapter?.message}
                placeholder="187"
              />

              <Input
                label="Total de Capítulos"
                type="number"
                {...register('progress.totalChapters', { valueAsNumber: true })}
                error={errors.progress?.totalChapters?.message}
                placeholder="250"
              />
            </div>
          </div>
        </div>
      )}
    </BaseMediaForm>
  );
};

export default MangaForm;