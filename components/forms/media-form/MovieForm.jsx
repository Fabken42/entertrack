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

  const MovieSpecificFields = ({ currentStatus, register, errors }) => {
    const showCurrentTime = currentStatus === 'in_progress';

    if (!showCurrentTime) return null;

    return (
      <div className={cn(
        "glass border border-white/10 rounded-xl p-6 space-y-4",
        "border-l-4 border-blue-500/30"
      )}>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
            <Film className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Minutagem do Filme</h3>
            <p className="text-sm text-white/60">Em que ponto você parou de assistir?</p>
          </div>
        </div>

        {showCurrentTime && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-white/5">
                <Hourglass className="w-4 h-4 text-blue-400" />
              </div>
              <h5 className="text-sm font-medium text-white">Tempo Atual</h5>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-2">Horas</label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  icon={Clock}
                  {...register('progress.currentTimeHours', { valueAsNumber: true })}
                  error={errors.progress?.currentTimeHours?.message}
                  placeholder="1"
                  variant="glass"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-2">Minutos</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  icon={Clock}
                  {...register('progress.currentTimeMinutes', { valueAsNumber: true })}
                  error={errors.progress?.currentTimeMinutes?.message}
                  placeholder="30"
                  variant="glass"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-2">Segundos</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  icon={Clock}
                  {...register('progress.currentTimeSeconds', { valueAsNumber: true })}
                  error={errors.progress?.currentTimeSeconds?.message}
                  placeholder="45"
                  variant="glass"
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/60">Formato:</span>
                <code className="px-2 py-1 bg-white/10 rounded text-white text-xs">
                  HH:MM:SS
                </code>
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
        currentStatus={watch('status')}
        register={register}
        errors={errors}
      />
    </BaseMediaForm>
  );
};

export default MovieForm;