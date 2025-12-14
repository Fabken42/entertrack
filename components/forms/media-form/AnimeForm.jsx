// /components/forms/media-form/AnimeForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseMediaForm from './BaseMediaForm';
import { Input } from '@/components/ui';
import { Tv, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

const animeSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'perfect']).optional(),
  comment: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  progress: z.object({
    currentEpisode: z.number().min(0).optional(),
    currentSeason: z.number().min(1).optional(),
  }).optional(),
});

const AnimeForm = (props) => {
  console.log('AnimeForm props:', props);
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
      progress: (baseData.status === 'in_progress' || baseData.status === 'dropped') ? {
        currentEpisode: baseData.progress?.currentEpisode || 0,
        currentSeason: baseData.progress?.currentSeason || 1,
      } : undefined,
    };
    props.onSubmit(formData);
  };

  const AnimeSpecificFields = ({ currentStatus, register, errors }) => {
    const showEpisode = currentStatus === 'in_progress' || currentStatus === 'dropped';
    if (!showEpisode) return null;

    return (
      <div className={cn(
        "glass border border-white/10 rounded-xl p-6 space-y-4",
        "border-l-4 border-pink-500/30"
      )}>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
            <Tv className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Progresso do Anime</h3>
            <p className="text-sm text-white/60">Em qual episódio você está?</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-white/5">
              <Hash className="w-4 h-4 text-pink-400" />
            </div>
            <h5 className="text-sm font-medium text-white">Episódio Atual</h5>
          </div>

          <Input
            label="Episódio"
            type="number"
            icon={Hash}
            {...register('progress.currentEpisode', { valueAsNumber: true })}
            error={errors.progress?.currentEpisode?.message}
            placeholder="12"
            variant="glass"
            min={0}
          />
        </div>
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
        currentStatus={watch('status')}
        register={register}
        errors={errors}
      />
    </BaseMediaForm>
  );
};

export default AnimeForm;