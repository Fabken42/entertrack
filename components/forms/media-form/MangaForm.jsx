// /components/forms/media-form/MangaForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseMediaForm from './BaseMediaForm';
import { Input } from '@/components/ui';
import { BookOpen, Layers, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

const mangaSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'perfect']).optional(),
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
      progress: (baseData.status === 'in_progress' || baseData.status === 'dropped') ? {
        currentVolume: baseData.progress?.currentVolume || 0,
        currentPage: baseData.progress?.currentPage || 0,
      } : undefined,
    };
    props.onSubmit(formData);
  };

  const MangaSpecificFields = ({ currentStatus, register, errors }) => {
    const showVolumePage = currentStatus === 'in_progress' || currentStatus === 'dropped';

    if (!showVolumePage) return null;

    return (
      <div className={cn(
        "glass border border-white/10 rounded-xl p-6 space-y-4",
        "border-l-4 border-red-500/30"
      )}>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20">
            <BookOpen className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Progresso do Mangá</h3>
            <p className="text-sm text-white/60">Em qual volume e capítulo você está?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-white/5">
                <Layers className="w-4 h-4 text-red-400" />
              </div>
              <h5 className="text-sm font-medium text-white">Volume Atual</h5>
            </div>

            <Input
              label="Volume"
              type="number"
              icon={Layers}
              {...register('progress.currentVolume', { valueAsNumber: true })}
              error={errors.progress?.currentVolume?.message}
              placeholder="5"
              variant="glass"
              min={0}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-white/5">
                <Hash className="w-4 h-4 text-red-400" />
              </div>
              <h5 className="text-sm font-medium text-white">Capítulo Atual</h5>
            </div>

            <Input
              label="Capítulo"
              type="number"
              icon={Hash}
              {...register('progress.currentChapter', { valueAsNumber: true })}
              error={errors.progress?.currentChapter?.message}
              placeholder="42"
              variant="glass"
              min={0}
            />
          </div>
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
        currentStatus={watch('status')}
        register={register}
        errors={errors}
      />
    </BaseMediaForm>
  );
};

export default MangaForm;