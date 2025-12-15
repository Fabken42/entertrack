// /components/forms/media-form/MovieForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, Rating as RatingComponent, TextArea } from '@/components/ui';
import { Film, Hourglass, Clock, Star, Calendar, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRuntime, formatCurrency, formatApiRating, statusOptions } from '@/lib/utils';

// Schema específico para filmes
const movieSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'perfect']).optional(),
  comment: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  progress: z.object({
    currentTimeHours: z.number().min(0).max(23).optional(),
    currentTimeMinutes: z.number().min(0).max(59).optional(),
    currentTimeSeconds: z.number().min(0).max(59).optional(),
  }).optional(),
  // Campos específicos do TMDB
  runtime: z.number().optional(),
  director: z.string().optional(),
  cast: z.array(z.string()).optional(),
  popularity: z.number().optional(),
  voteCount: z.number().optional(),
  budget: z.number().optional(),
  revenue: z.number().optional(),
});

const MovieForm = (props) => {
  const {
    initialData,
    externalData,
    manualCreateQuery,
    onCancel,
    loading = false,
    onSubmit,
  } = props;

  console.log('MovieForm props:', props);

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
    resolver: zodResolver(movieSchema),
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
      runtime: initialData.runtime,
      director: initialData.director,
      cast: initialData.cast,
      popularity: initialData.popularity,
      voteCount: initialData.voteCount,
      budget: initialData.budget,
      revenue: initialData.revenue,
    } : externalData ? {
      title: externalData.title,
      description: externalData.description,
      releaseYear: externalData.releaseYear,
      genres: externalData.genres,
      status: 'planned',
      imageUrl: externalData.imageUrl,
      progress: {},
      rating: undefined,
      runtime: externalData.runtime,
      director: externalData.director,
      cast: externalData.cast,
      popularity: externalData.popularity,
      voteCount: externalData.voteCount,
      budget: externalData.budget,
      revenue: externalData.revenue,
    } : manualCreateQuery ? {
      title: manualCreateQuery,
      status: 'planned',
      genres: [],
      progress: {},
      cast: [],
    } : {
      status: 'planned',
      genres: [],
      progress: {},
      cast: [],
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
    console.log('MovieForm: onSubmitForm chamado com:', data);
    
    if (onSubmit) {
      const formData = {
        ...data,
        mediaType: 'movie',
        rating: showRatingAndComment ? selectedRating : undefined,
        comment: showRatingAndComment ? data.comment : undefined,
        genres: selectedGenres,
        progress: (showProgressFields) ? {
          currentTimeHours: data.progress?.currentTimeHours || 0,
          currentTimeMinutes: data.progress?.currentTimeMinutes || 0,
          currentTimeSeconds: data.progress?.currentTimeSeconds || 0,
        } : undefined,
        ...(externalData && {
          externalId: externalData.externalId,
          apiRating: externalData.apiRating,
          apiVoteCount: externalData.apiVoteCount,
          runtime: externalData.runtime,
          director: externalData.director,
          cast: externalData.cast,
          popularity: externalData.popularity,
          voteCount: externalData.voteCount,
          budget: externalData.budget,
          revenue: externalData.revenue,
        }),
      };
      
      console.log('MovieForm: Enviando dados para onSubmit:', formData);
      onSubmit(formData);
    } else {
      console.error('MovieForm: onSubmit não definido');
    }
  };

  const availableGenres = [
    'Ação', 'Aventura', 'Animação', 'Comédia', 'Crime', 'Documentário',
    'Drama', 'Família', 'Fantasia', 'História', 'Terror', 'Mistério',
    'Musical', 'Romance', 'Ficção Científica', 'Suspense', 'Guerra',
    'Faroeste', 'Biografia', 'Esportes', 'Thriller'
  ];

  const mediaColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
      {hasExternalData && (
        <div className={cn("glass border rounded-xl p-6 space-y-4", "border-blue-500/30")}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", mediaColor)}>
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                Dados importados do TMDB
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
                    {formatApiRating(externalData.apiRating)?.display}/5
                  </div>
                  {externalData.apiVoteCount && (
                    <div className="text-xs text-white/60">
                      ({externalData.apiVoteCount.toLocaleString()} votos)
                    </div>
                  )}
                </div>
              </div>
            )}

            {externalData.runtime && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Clock className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-white/80">Duração:</span>
                  <div className="font-medium text-white">{formatRuntime(externalData.runtime)}</div>
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

            {externalData.popularity && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <div>
                  <span className="text-white/80">Popularidade:</span>
                  <div className="font-medium text-white">{externalData.popularity.toFixed(1)}</div>
                </div>
              </div>
            )}

            {externalData.director && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Film className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-white/80">Diretor:</span>
                  <div className="font-medium text-white">{externalData.director}</div>
                </div>
              </div>
            )}

            {externalData.cast && externalData.cast.length > 0 && (
              <div className="md:col-span-2 flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                <Users className="w-4 h-4 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-white/80">Elenco principal:</span>
                  <div className="font-medium text-white text-xs">
                    {externalData.cast.slice(0, 3).join(', ')}
                    {externalData.cast.length > 3 && ` e mais ${externalData.cast.length - 3}`}
                  </div>
                </div>
              </div>
            )}

            {externalData.budget && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-white/80">Orçamento:</span>
                  <div className="font-medium text-white">{formatCurrency(externalData.budget)}</div>
                </div>
              </div>
            )}

            {externalData.revenue && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <div>
                  <span className="text-white/80">Receita:</span>
                  <div className="font-medium text-white">{formatCurrency(externalData.revenue)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {hasExternalData && externalData.imageUrl && (
        <div className="flex justify-center">
          <div className="rounded-xl overflow-hidden border glass w-48 h-64">
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
              <Film className="w-5 h-5" />
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
              <Film className="w-5 h-5" />
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
              placeholder="Título do filme"
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

            <Input
              label="Duração (minutos)"
              type="number"
              icon={Clock}
              {...register('runtime', { valueAsNumber: true })}
              error={errors.runtime?.message}
              placeholder="120"
              variant="glass"
            />

            <Input
              label="Diretor"
              {...register('director')}
              error={errors.director?.message}
              placeholder="Nome do diretor"
              variant="glass"
            />

            <div className="md:col-span-2">
              <Input
                label="Elenco"
                {...register('cast')}
                error={errors.cast?.message}
                placeholder="Ator 1, Ator 2, Ator 3"
                variant="glass"
                helperText="Separe os atores com vírgula"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Sinopse
            </label>
            <TextArea
              {...register('description')}
              placeholder="Descreva o filme..."
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
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
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

      {/* Campos específicos do filme */}
      {showProgressFields && (
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
                <span className="text-white/40 text-xs ml-auto">Ex: 1:30:45 = 1h 30min 45s</span>
              </div>
            </div>
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
          className="min-w-[100px] bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          {initialData ? 'Atualizar' : hasExternalData ? 'Adicionar à minha lista' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};

export default MovieForm;