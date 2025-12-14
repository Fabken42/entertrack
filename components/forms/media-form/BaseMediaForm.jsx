'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, Rating as RatingComponent, TextArea } from '@/components/ui';
import { Users, TrendingUp, Star, Calendar, BookOpen, Film, Tv, GamepadIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const baseMediaSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'perfect']).optional(),
  comment: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  // Campos específicos para anime/mangá
  progress: z.object({
    currentEpisode: z.number().min(0).optional(),
    currentSeason: z.number().min(1).optional(),
  }).optional(),
  // Campos específicos para anime
  episodes: z.number().optional(),
  popularity: z.number().optional(),
  members: z.number().optional(),
  rank: z.number().optional(),
  // Campos específicos para mangá
  volumes: z.number().optional(),
  chapters: z.number().optional(),
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

const BaseMediaForm = ({
  mediaType,
  initialData,
  externalData,
  manualCreateQuery,
  onCancel,
  loading = false,
  children,
  selectedRating,
  onRatingChange,
  onSubmit, // Recebe a função submit do componente pai
  customSchema, // Permite passar schemas personalizados
}) => {
  const [selectedGenres, setSelectedGenres] = React.useState(
    initialData?.genres || externalData?.genres || []
  );

  const isEditMode = !!initialData;
  const hasExternalData = !!externalData;
  const isManualEntry = !hasExternalData && !isEditMode;

  // Usa o schema customizado se fornecido, caso contrário usa o base
  const schemaToUse = customSchema || baseMediaSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm({
    resolver: zodResolver(schemaToUse),
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
      ...(mediaType === 'anime' && {
        episodes: initialData.episodes,
        popularity: initialData.popularity,
        members: initialData.members,
        rank: initialData.rank,
      }),
      ...(mediaType === 'manga' && {
        volumes: initialData.volumes,
        chapters: initialData.chapters,
      }),
    } : externalData ? {
      title: externalData.title,
      description: externalData.description,
      releaseYear: externalData.releaseYear,
      genres: externalData.genres,
      status: 'planned',
      imageUrl: externalData.imageUrl,
      progress: {},
      ...(mediaType === 'anime' && {
        episodes: externalData.episodes,
        popularity: externalData.popularity,
        members: externalData.members,
        rank: externalData.rank,
      }),
      ...(mediaType === 'manga' && {
        volumes: externalData.volumes,
        chapters: externalData.chapters,
      }),
    } : manualCreateQuery ? {
      title: manualCreateQuery,
      status: 'planned',
      genres: [],
      progress: {},
    } : {
      status: 'planned',
      genres: [],
      progress: {},
    },
  });

  const currentStatus = watch('status');
  const showRatingAndComment = currentStatus === 'completed' || currentStatus === 'dropped';
  const showProgressFields = currentStatus === 'in_progress' || currentStatus === 'dropped';

  const getMediaIcon = () => {
    switch (mediaType) {
      case 'movie': return Film;
      case 'series': return Tv;
      case 'anime': return Tv;
      case 'manga': return BookOpen;
      case 'book': return BookOpen;
      case 'game': return GamepadIcon;
      default: return Sparkles;
    }
  };

  const getMediaColor = () => {
    switch (mediaType) {
      case 'movie': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'series': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'anime': return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'manga': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'book': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'game': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getApiSourceLabel = () => {
    switch (mediaType) {
      case 'movie':
      case 'series':
        return 'TMDB';
      case 'anime':
      case 'manga':
        return 'MyAnimeList';
      case 'game':
        return 'RAWG';
      case 'book':
        return 'Google Books';
      default:
        return 'API';
    }
  };

  const handleGenreToggle = (genre) => {
    if (hasExternalData && !isEditMode) return;

    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];

    setSelectedGenres(newGenres);
    setValue('genres', newGenres, { shouldValidate: true });
  };

  const handleRatingChangeInternal = (rating) => {
    if (onRatingChange) {
      onRatingChange(rating);
    }
    setValue('rating', rating, { shouldValidate: true });
  };

  const onSubmitForm = (data) => {
    console.log('BaseMediaForm: onSubmitForm chamado com:', data);
    
    // if (onSubmit) {
    //   // Prepara os dados para enviar
    //   const formData = {
    //     ...data,
    //     rating: showRatingAndComment ? selectedRating : undefined,
    //     comment: showRatingAndComment ? data.comment : undefined,
    //     genres: selectedGenres,
    //     mediaType: mediaType, // Inclui o tipo de mídia
    //     ...(externalData && {
    //       externalId: externalData.externalId,
    //       apiRating: externalData.apiRating,
    //       apiVoteCount: externalData.apiVoteCount,
    //       ...(mediaType === 'anime' && {
    //         episodes: externalData.episodes,
    //         popularity: externalData.popularity,
    //         members: externalData.members,
    //         rank: externalData.rank,
    //       }),
    //       ...(mediaType === 'manga' && {
    //         volumes: externalData.volumes,
    //         chapters: externalData.chapters,
    //         popularity: externalData.popularity,
    //         members: externalData.members,
    //         rank: externalData.rank,
    //       }),
    //     }),
    //   };
      
    //   console.log('BaseMediaForm: Enviando dados para onSubmit:', formData);
    //   onSubmit(formData);
    // } else {
    //   console.error('BaseMediaForm: onSubmit não definido');
    // }
  };

  const formatApiRating = (rating, mediaType) => {
    if (!rating) return null;

    const base10Apis = ['movie', 'series', 'anime', 'manga'];
    const base5Apis = ['game', 'book'];

    if (base10Apis.includes(mediaType)) {
      return {
        display: (rating / 2).toFixed(1),
        original: rating.toFixed(1),
        base: 10
      };
    } else if (base5Apis.includes(mediaType)) {
      return {
        display: rating.toFixed(1),
        original: rating.toFixed(1),
        base: 5
      };
    }

    return {
      display: rating.toFixed(1),
      original: rating.toFixed(1),
      base: 10
    };
  };

  const statusOptions = [
    { value: 'planned', label: '🟡 Planejado' },
    { value: 'in_progress', label: '🔵 Em Progresso' },
    { value: 'completed', label: '🟢 Concluído' },
    { value: 'dropped', label: '🔴 Abandonado' },
  ];

  const availableGenres = ['Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Ficção Científica', 'Terror', 'Romance'];

  const MediaIcon = getMediaIcon();
  const mediaColor = getMediaColor();

  // Função para injetar props nos children
  const renderChildren = () => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        // Passa todas as props necessárias para os children
        return React.cloneElement(child, {
          currentStatus,
          register,
          errors,
          watch,
          setValue,
          control,
          selectedGenres,
          onGenreToggle: handleGenreToggle,
          mediaType,
          showProgressFields,
        });
      }
      return child;
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
      {hasExternalData && (
        <div className={cn("glass border rounded-xl p-6 space-y-4", mediaColor.replace('bg-', 'border-'))}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", mediaColor)}>
              <MediaIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                Dados importados de {getApiSourceLabel()}
              </h3>
              <p className="text-sm text-white/60">Estes dados foram obtidos automaticamente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Dados da API */}
            {externalData.apiRating && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <div>
                  <span className="text-white/80">Nota:</span>
                  <div className="font-medium text-white">
                    {formatApiRating(externalData.apiRating, mediaType)?.display}/5
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
          </div>
        </div>
      )}

      {hasExternalData && externalData.imageUrl && (
        <div className="flex justify-center">
          <div className={cn(
            "rounded-xl overflow-hidden border glass",
            mediaType === 'book' ? 'w-32 h-48' : 'w-48 h-64'
          )}>
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
              <MediaIcon className="w-5 h-5" />
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
              placeholder={`Título do ${mediaType}`}
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
              placeholder={`Descreva o ${mediaType}...`}
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
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
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

      {/* Renderiza os children com as props injetadas */}
      {renderChildren()}

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
          className="min-w-[100px]"
        >
          {initialData ? 'Atualizar' : hasExternalData ? 'Adicionar à minha lista' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};

export default BaseMediaForm;