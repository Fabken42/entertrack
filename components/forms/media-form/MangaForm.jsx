// /components/forms/media-form/MangaForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, Rating as RatingComponent, TextArea } from '@/components/ui';
import { BookOpen, Hash, Star, Calendar, Users, TrendingUp } from 'lucide-react';
import { cn, formatApiRating } from '@/lib/utils/general-utils';
import { statusColors } from '@/constants';

// Schema específico para mangá
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
    currentChapter: z.number().min(0).optional(),
  }).optional(),
});

const formatMembers = (members) => {
  if (!members) return '—';
  if (members >= 1000000) return (members / 1000000).toFixed(1) + 'M';
  if (members >= 1000) return (members / 1000).toFixed(1) + 'K';
  return members.toString();
};

const formatPopularity = (popularity) => {
  if (!popularity) return '—';
  return `#${popularity.toLocaleString('pt-BR')}`;
};

const MangaForm = (props) => {
  const {
    initialData,
    externalData,
    manualCreateQuery,
    onCancel,
    loading = false,
    onSubmit,
  } = props;

  // Converte genres de objetos {id, name} para array de strings
  const getInitialGenres = () => {
    if (initialData?.genres) {
      return initialData.genres.map(g => typeof g === 'object' ? g.name : g);
    }
    if (externalData?.genres) {
      return externalData.genres.map(g => typeof g === 'object' ? g.name : g);
    }
    return [];
  };

  const [selectedGenres, setSelectedGenres] = React.useState(getInitialGenres);
  const [selectedRating, setSelectedRating] = React.useState(
    initialData?.rating
  );

  const isEditMode = !!initialData;
  const hasExternalData = !!externalData;
  const isManualEntry = !hasExternalData && !isEditMode;

  // Prepara os valores padrão com genres convertidos para strings
  const getDefaultValues = () => {
    if (initialData) {
      return {
        title: initialData.title,
        description: initialData.description,
        releaseYear: initialData.releaseYear,
        genres: initialData.genres?.map(g => typeof g === 'object' ? g.name : g) || [],
        rating: initialData.rating,
        comment: initialData.comment,
        imageUrl: initialData.imageUrl,
        status: initialData.status,
        progress: initialData.progress || {},
      };
    }
    
    if (externalData) {
      return {
        title: externalData.title,
        description: externalData.description,
        releaseYear: externalData.releaseYear,
        genres: externalData.genres?.map(g => typeof g === 'object' ? g.name : g) || [],
        status: 'planned',
        imageUrl: externalData.imageUrl,
        progress: {},
        rating: undefined,
      };
    }
    
    if (manualCreateQuery) {
      return {
        title: manualCreateQuery,
        status: 'planned',
        genres: [],
        progress: {},
      };
    }
    
    return {
      status: 'planned',
      genres: [],
      progress: {},
    };
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(mangaSchema),
    defaultValues: getDefaultValues(),
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
    if (onSubmit) {
      const formData = {
        ...data,
        mediaType: 'manga',
        sourceApi: 'jikan', // Adicionar sourceApi
        rating: showRatingAndComment ? selectedRating : undefined,
        comment: showRatingAndComment ? data.comment : undefined,
        genres: selectedGenres,
        progress: (showProgressFields) ? {
          currentVolume: data.progress?.currentVolume || 0,
          currentChapter: data.progress?.currentChapter || 0,
        } : undefined,
        ...(externalData && {
          externalId: externalData.externalId,
          sourceApi: externalData.sourceApi || 'jikan',
          apiRating: externalData.apiRating,
          apiVoteCount: externalData.apiVoteCount,
          volumes: externalData.volumes,
          chapters: externalData.chapters,
          popularity: externalData.popularity,
          members: externalData.members,
          rank: externalData.rank,
          authors: externalData.authors || [],
          serialization: externalData.serialization || '',
        }),
      };

      console.log('MangaForm: Enviando dados para onSubmit:', formData);
      onSubmit(formData);
    } else {
      console.error('MangaForm: onSubmit não definido');
    }
  };

  const availableGenres = ['Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Ficção Científica', 'Terror', 'Romance', 'Slice of Life', 'Sobrenatural', 'Mistério', 'Esportes', 'Seinen', 'Shounen', 'Shoujo', 'Josei'];

  const mediaColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
      {hasExternalData && (
        <div className={cn("glass border rounded-xl p-6 space-y-4", "border-indigo-500/30")}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", mediaColor)}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                Dados importados do MyAnimeList
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

            {externalData.popularity && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-white/80">Popularidade:</span>
                  <div className="font-medium text-white">{formatPopularity(externalData.popularity)}</div>
                </div>
              </div>
            )}

            {externalData.members && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Users className="w-4 h-4 text-green-400" />
                <div>
                  <span className="text-white/80">Membros:</span>
                  <div className="font-medium text-white">{formatMembers(externalData.members)}</div>
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

            {externalData.chapters && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="text-white/80">Capítulos:</span>
                  <div className="font-medium text-white">{externalData.chapters}</div>
                </div>
              </div>
            )}

            {externalData.volumes && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Hash className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-white/80">Volumes:</span>
                  <div className="font-medium text-white">{externalData.volumes}</div>
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
              placeholder="Título do mangá"
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
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Sinopse
            </label>
            <TextArea
              {...register('description')}
              placeholder="Descreva o mangá..."
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
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
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
          options={statusColors}
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

      {/* Campos específicos do mangá */}
      {showProgressFields && (
        <div className={cn(
          "glass border border-white/10 rounded-xl p-6 space-y-4",
          "border-l-4 border-indigo-500/30"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Progresso do Mangá</h3>
              <p className="text-sm text-white/60">Em qual volume/capítulo você está?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Volume Atual"
              type="number"
              icon={Hash}
              {...register('progress.currentVolume', { valueAsNumber: true })}
              error={errors.progress?.currentVolume?.message}
              placeholder="5"
              variant="glass"
              min={0}
              helperText="Em que volume você está?"
            />

            <Input
              label="Capítulo Atual"
              type="number"
              icon={BookOpen}
              {...register('progress.currentChapter', { valueAsNumber: true })}
              error={errors.progress?.currentChapter?.message}
              placeholder="42"
              variant="glass"
              min={0}
              helperText="Em que capítulo você está?"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-white/50 mt-2">
            <div className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full"></div>
            <span>Para mangás com leitura em andamento</span>
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
          className="min-w-[100px] bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
        >
          {initialData ? 'Atualizar' : hasExternalData ? 'Adicionar à minha lista' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};

export default MangaForm;