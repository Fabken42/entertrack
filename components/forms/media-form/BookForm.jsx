// /components/forms/media-form/BookForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, Rating as RatingComponent, TextArea } from '@/components/ui';
import { BookOpen, Hash, Star, Calendar, Users, TrendingUp } from 'lucide-react';
import { cn, formatApiRating, statusOptions } from '@/lib/utils';

// Schema específico para livros
const bookSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'perfect']).optional(),
  comment: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  progress: z.object({
    currentPage: z.number().min(0).optional(),
  }).optional(),
  // Campos específicos do Google Books
  pageCount: z.number().optional(),
  authors: z.array(z.string()).optional(),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
});

const BookForm = (props) => {
  const {
    initialData,
    externalData,
    manualCreateQuery,
    onCancel,
    loading = false,
    onSubmit,
  } = props;

  console.log('BookForm props:', props);

  const [selectedGenres, setSelectedGenres] = React.useState(
    initialData?.genres || externalData?.genres || []
  );
  const [selectedRating, setSelectedRating] = React.useState(
    initialData?.rating
  );

  const isEditMode = !!initialData;
  const hasExternalData = !!externalData;
  const isManualEntry = !hasExternalData && !isEditMode;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      releaseYear: initialData.releaseYear,
      genres: initialData.genres,
      rating: initialData.rating,
      comment: initialData.comment,
      imageUrl: initialData.imageUrl,
      status: initialData.status,
      progress: initialData.progress || {},
      pageCount: initialData.pageCount,
      authors: initialData.authors,
      publisher: initialData.publisher,
      isbn: initialData.isbn,
    } : externalData ? {
      title: externalData.title,
      description: externalData.description,
      releaseYear: externalData.releaseYear,
      genres: externalData.genres,
      status: 'planned',
      imageUrl: externalData.imageUrl,
      progress: {},
      rating: undefined,
      pageCount: externalData.pageCount,
      authors: externalData.authors,
      publisher: externalData.publisher,
      isbn: externalData.isbn,
    } : manualCreateQuery ? {
      title: manualCreateQuery,
      status: 'planned',
      genres: [],
      progress: {},
      authors: [],
    } : {
      status: 'planned',
      genres: [],
      progress: {},
      authors: [],
    },
  });

  const currentStatus = watch('status');
  const showRatingAndComment = currentStatus === 'completed' || currentStatus === 'dropped';
  const showProgressFields = currentStatus === 'in_progress' || currentStatus === 'dropped';

  const handleGenreToggle = (genre) => {
    if (hasExternalData && !isEditMode) return;

    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];

    setSelectedGenres(newGenres);
    setValue('genres', newGenres, { shouldValidate: true });
  };

  const handleRatingChangeInternal = (rating) => {
    setSelectedRating(rating);
    setValue('rating', rating, { shouldValidate: true });
  };

  const onSubmitForm = (data) => {
    console.log('BookForm: onSubmitForm chamado com:', data);
    
    if (onSubmit) {
      const formData = {
        ...data,
        mediaType: 'book',
        rating: showRatingAndComment ? selectedRating : undefined,
        comment: showRatingAndComment ? data.comment : undefined,
        genres: selectedGenres,
        progress: (showProgressFields) ? {
          currentPage: data.progress?.currentPage || 0,
        } : undefined,
        ...(externalData && {
          externalId: externalData.externalId,
          apiRating: externalData.apiRating,
          apiVoteCount: externalData.apiVoteCount,
          pageCount: externalData.pageCount,
          authors: externalData.authors,
          publisher: externalData.publisher,
          isbn: externalData.isbn,
        }),
      };
      
      console.log('BookForm: Enviando dados para onSubmit:', formData);
      onSubmit(formData);
    } else {
      console.error('BookForm: onSubmit não definido');
    }
  };

  const availableGenres = [
    'Ficção', 'Não-Ficção', 'Romance', 'Fantasia', 'Ficção Científica',
    'Mistério', 'Terror', 'Biografia', 'História', 'Autoajuda',
    'Poesia', 'Drama', 'Comédia', 'Aventura', 'Infantil',
    'Young Adult', 'Distopia', 'Contos', 'Ensaios', 'Filosofia'
  ];

  const mediaColor = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
      {hasExternalData && (
        <div className={cn("glass border rounded-xl p-6 space-y-4", "border-yellow-500/30")}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", mediaColor)}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                Dados importados do Google Books
              </h3>
              <p className="text-sm text-white/60">Estes dados foram obtidos automaticamente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {externalData.apiRating && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <div>
                  <span className="text-white/80">Nota:</span>
                  <div className="font-medium text-white">
                    {formatApiRating(externalData.apiRating, 1)?.display}/5
                  </div>
                  {externalData.apiVoteCount && (
                    <div className="text-xs text-white/60">
                      ({externalData.apiVoteCount.toLocaleString()} avaliações)
                    </div>
                  )}
                </div>
              </div>
            )}

            {externalData.pageCount && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-white/80">Páginas:</span>
                  <div className="font-medium text-white">{externalData.pageCount}</div>
                </div>
              </div>
            )}

            {externalData.releaseYear && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Calendar className="w-4 h-4 text-white/60" />
                <div>
                  <span className="text-white/80">Ano:</span>
                  <div className="font-medium text-white">{externalData.releaseYear}</div>
                </div>
              </div>
            )}

            {externalData.authors && externalData.authors.length > 0 && (
              <div className="md:col-span-2 flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                <Users className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-white/80">Autores:</span>
                  <div className="font-medium text-white">
                    {externalData.authors.join(', ')}
                  </div>
                </div>
              </div>
            )}

            {externalData.publisher && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-white/80">Editora:</span>
                  <div className="font-medium text-white">{externalData.publisher}</div>
                </div>
              </div>
            )}

            {externalData.isbn && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Hash className="w-4 h-4 text-orange-400" />
                <div>
                  <span className="text-white/80">ISBN:</span>
                  <div className="font-medium text-white">{externalData.isbn}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {hasExternalData && externalData.imageUrl && (
        <div className="flex justify-center">
          <div className="rounded-xl overflow-hidden border glass w-32 h-48">
            <img
              src={externalData.imageUrl}
              alt={externalData.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {externalData?.description && (
        <div className="glass border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", mediaColor)}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">
                Sinopse
              </h3>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                {externalData.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {isManualEntry && (
        <div className="glass border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", mediaColor)}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Informações Básicas</h3>
              <p className="text-sm text-white/60">Preencha os dados manualmente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Título *"
              {...register('title')}
              error={errors.title?.message}
              placeholder="Título do livro"
              variant="glass"
            />

            <Input
              label="Ano de Lançamento"
              type="number"
              icon={Calendar}
              {...register('releaseYear', { valueAsNumber: true })}
              error={errors.releaseYear?.message}
              placeholder="2024"
              variant="glass"
            />

            <div className="md:col-span-2">
              <Input
                label="URL da Imagem"
                {...register('imageUrl')}
                error={errors.imageUrl?.message}
                placeholder="https://exemplo.com/imagem.jpg"
                variant="glass"
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Autores"
                {...register('authors')}
                error={errors.authors?.message}
                placeholder="Autor 1, Autor 2"
                variant="glass"
                helperText="Separe os autores com vírgula"
              />
            </div>

            <Input
              label="Número de Páginas"
              type="number"
              icon={BookOpen}
              {...register('pageCount', { valueAsNumber: true })}
              error={errors.pageCount?.message}
              placeholder="300"
              variant="glass"
            />

            <Input
              label="Editora"
              {...register('publisher')}
              error={errors.publisher?.message}
              placeholder="Editora"
              variant="glass"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Sinopse
            </label>
            <TextArea
              {...register('description')}
              placeholder="Descreva o livro..."
              variant="glass"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Gêneros *
            </label>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover-lift",
                    selectedGenres.includes(genre)
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
            {errors.genres && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                {errors.genres.message}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="glass border border-white/10 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {hasExternalData ? 'Sua experiência' : 'Sua avaliação'}
            </h3>
            <p className="text-sm text-white/60">Como você avalia este conteúdo?</p>
          </div>
        </div>

        <Select
          label="Status *"
          {...register('status')}
          error={errors.status?.message}
          options={statusOptions}
          variant="glass"
        />

        {showRatingAndComment && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Sua avaliação
              </label>
              <RatingComponent
                value={selectedRating}
                onChange={handleRatingChangeInternal}
                showLabel
                size="lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Seu comentário
              </label>
              <TextArea
                {...register('comment')}
                placeholder="Compartilhe suas impressões..."
                variant="glass"
                rows={3}
              />
            </div>
          </>
        )}
      </div>

      {/* Campos específicos do livro */}
      {showProgressFields && (
        <div className={cn(
          "glass border border-white/10 rounded-xl p-6 space-y-4",
          "border-l-4 border-yellow-500/30"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
              <BookOpen className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Progresso da Leitura</h3>
              <p className="text-sm text-white/60">Em que página você está?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Página Atual"
              type="number"
              icon={Hash}
              {...register('progress.currentPage', { valueAsNumber: true })}
              error={errors.progress?.currentPage?.message}
              placeholder="150"
              variant="glass"
              min={0}
              helperText="Em que página você parou de ler?"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-white/50 mt-2">
            <div className="w-1.5 h-1.5 bg-yellow-500/50 rounded-full"></div>
            <span>Para livros com progresso em andamento</span>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="min-w-[100px]"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="min-w-[100px] bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
        >
          {initialData ? 'Atualizar' : hasExternalData ? 'Adicionar à minha lista' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};

export default BookForm;