// /entertrack/components/forms/media-form/BookForm.jsx

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseMediaForm from './BaseMediaForm';
import { Input } from '@/components/ui';

// Schema específico para livros
const bookSchema = z.object({
  // Campos base
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'great', 'perfect']).optional(),
  comment: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  // Campos específicos de livros
  progress: z.object({
    currentPage: z.number().min(0).optional(),
    totalPages: z.number().min(1).optional(),
  }).optional(),
});

const BookForm = (props) => {
  const {
    register,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(bookSchema),
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
      mediaType: 'book',
      progress: showProgressFields ? {
        currentPage: baseData.progress?.currentPage || 0,
        totalPages: baseData.progress?.totalPages || 0,
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
      mediaType="book"
      initialData={props.initialData}
      externalData={props.externalData}
      onCancel={props.onCancel}
      loading={props.loading}
      onSubmit={handleSubmit}
      selectedRating={selectedRating}
      onRatingChange={handleRatingChange}
    >
      {/* Campos específicos de livros */}
      {showProgressFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-700">
          <Input
            label="Página Atual"
            type="number"
            {...register('progress.currentPage', { valueAsNumber: true })}
            error={errors.progress?.currentPage?.message}
            placeholder="150"
          />

          <Input
            label="Total de Páginas"
            type="number"
            {...register('progress.totalPages', { valueAsNumber: true })}
            error={errors.progress?.totalPages?.message}
            placeholder="300"
          />
        </div>
      )}
    </BaseMediaForm>
  );
};

export default BookForm;