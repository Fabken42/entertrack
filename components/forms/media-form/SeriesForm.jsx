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

  const SeriesSpecificFields = ({ currentStatus, register, errors }) => {
    const showSeasonEpisode = currentStatus === 'in_progress';

    if (!showSeasonEpisode) return null;

    return (
      <div className={cn(
        "glass border border-white/10 rounded-xl p-6 space-y-4",
        "border-l-4 border-green-500/30"
      )}>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
            <Tv className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Progresso da Série</h3>
            <p className="text-sm text-white/60">Em qual temporada e episódio você está?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-white/5">
                <Calendar className="w-4 h-4 text-green-400" />
              </div>
              <h5 className="text-sm font-medium text-white">Temporada Atual</h5>
            </div>

            <Input
              label="Temporada"
              type="number"
              icon={Calendar}
              {...register('progress.currentSeason', { valueAsNumber: true })}
              error={errors.progress?.currentSeason?.message}
              placeholder="1"
              variant="glass"
              min={1}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-white/5">
                <Hash className="w-4 h-4 text-green-400" />
              </div>
              <h5 className="text-sm font-medium text-white">Episódio Atual</h5>
            </div>

            <Input
              label="Episódio"
              type="number"
              icon={Hash}
              {...register('progress.currentEpisode', { valueAsNumber: true })}
              error={errors.progress?.currentEpisode?.message}
              placeholder="5"
              variant="glass"
              min={0}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm text-white/80">Dica:</p>
            <p className="text-xs text-white/60">Episódio 0 indica que ainda não começou a temporada</p>
          </div>
        </div>
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
        currentStatus={watch('status')}
        register={register}
        errors={errors}
      />
    </BaseMediaForm>
  );
};

export default SeriesForm;