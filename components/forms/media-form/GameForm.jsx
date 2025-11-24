// /entertrack/components/forms/media-form/GameForm.jsx

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseMediaForm from './BaseMediaForm';
import { Input } from '@/components/ui';

// Schema específico para jogos
const gameSchema = z.object({
  // Campos base
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'great', 'perfect']).optional(),
  comment: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  // Campos específicos de jogos
  progress: z.object({
    completionPercentage: z.number().min(0).max(100).optional(),
    playTime: z.number().min(0).optional(),
    isPlatinum: z.boolean().optional(),
  }).optional(),
});

const GameForm = (props) => {
  const {
    register,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(gameSchema),
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
      mediaType: 'game',
      progress: showProgressFields ? {
        completionPercentage: baseData.progress?.completionPercentage || 0,
        playTime: baseData.progress?.playTime || 0,
        isPlatinum: baseData.progress?.isPlatinum || false,
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
      mediaType="game"
      initialData={props.initialData}
      externalData={props.externalData}
      onCancel={props.onCancel}
      loading={props.loading}
      onSubmit={handleSubmit}
      selectedRating={selectedRating}
      onRatingChange={handleRatingChange}
    >
      {/* Campos específicos de jogos */}
      {showProgressFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-700">
          <Input
            label="Porcentagem de Conclusão"
            type="number"
            min="0"
            max="100"
            {...register('progress.completionPercentage', { valueAsNumber: true })}
            error={errors.progress?.completionPercentage?.message}
            placeholder="75"
          />

          <Input
            label="Tempo de Jogo (horas)"
            type="number"
            min="0"
            {...register('progress.playTime', { valueAsNumber: true })}
            error={errors.progress?.playTime?.message}
            placeholder="35"
          />

          <div className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              {...register('progress.isPlatinum')}
              className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
            />
            <label className="text-sm font-medium text-gray-300">
              Platina Conquistada
            </label>
          </div>
        </div>
      )}
    </BaseMediaForm>
  );
};

export default GameForm;