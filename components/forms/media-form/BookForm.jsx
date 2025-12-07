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
  }).optional(),
});

const BookForm = (props) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(bookSchema),
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
      mediaType: 'book',
      progress: baseData.status === 'in_progress' ? {
        currentPage: baseData.progress?.currentPage || 0,
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
  const BookSpecificFields = ({ currentStatus, register, errors }) => {
    const showCurrentPage = currentStatus === 'in_progress';
    
    if (!showCurrentPage) return null;
    
    return (
      <div className="pt-6 border-t border-gray-700">
        <Input
          label="Página Atual"
          type="number"
          {...register('progress.currentPage', { valueAsNumber: true })}
          error={errors.progress?.currentPage?.message}
          placeholder="150"
        />
      </div>
    );
  };

  return (
    <BaseMediaForm
      mediaType="book"
      initialData={props.initialData}
      externalData={props.externalData}
      manualCreateQuery={props.manualCreateQuery}
      onCancel={props.onCancel}
      loading={props.loading}
      onSubmit={handleSubmit}
      selectedRating={selectedRating}
      onRatingChange={handleRatingChange}
    >
      <BookSpecificFields 
        register={register}
        errors={errors}
      />
    </BaseMediaForm>
  );
};

export default BookForm;