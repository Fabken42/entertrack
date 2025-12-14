// /entertrack/components/forms/media-form/BookForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseMediaForm from './BaseMediaForm';
import { Input } from '@/components/ui';
import { BookOpen, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

// Schema específico para livros
const bookSchema = z.object({
  // Campos base
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'perfect']).optional(),
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
      progress: (baseData.status === 'in_progress' || baseData.status === 'dropped') ? {
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

  const BookSpecificFields = ({ currentStatus, register, errors }) => {
    const showCurrentPage = currentStatus === 'in_progress' || currentStatus === 'dropped';

    if (!showCurrentPage) return null;

    return (
      <div className={cn(
        "glass border border-white/10 rounded-xl p-6 space-y-4",
        "border-l-4 border-yellow-500/30"
      )}>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
            <BookOpen className="w-5 h-5 text-yellow-400" />
          </div>
          <h3 className="font-semibold text-white">Progresso da Leitura</h3>
        </div>

        <Input
          label="Página Atual"
          type="number"
          icon={Hash}
          {...register('progress.currentPage', { valueAsNumber: true })}
          error={errors.progress?.currentPage?.message}
          placeholder="150"
          variant="glass"
          helperText="Em que página você parou de ler?"
        />

        <div className="flex items-center gap-2 text-xs text-white/50 mt-2">
          <div className="w-1.5 h-1.5 bg-yellow-500/50 rounded-full"></div>
          <span>Para livros com progresso em andamento</span>
        </div>
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
        currentStatus={watch('status')}
        register={register}
        errors={errors}
      />
    </BaseMediaForm>
  );
};
export default BookForm;