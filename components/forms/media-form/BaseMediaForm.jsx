'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, Rating as RatingComponent } from '@/components/ui';
import { Users, TrendingUp, Star } from 'lucide-react';

const baseMediaSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'great', 'perfect']).optional(),
  comment: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

// Função para formatar números (membros)
const formatMembers = (members) => {
  if (!members) return 'N/A';
  if (members >= 1000000) {
    return (members / 1000000).toFixed(1) + 'M';
  }
  if (members >= 1000) {
    return (members / 1000).toFixed(1) + 'K';
  }
  return members.toString();
};

// Função para formatar popularidade
const formatPopularity = (popularity) => {
  if (!popularity) return 'N/A';
  return `#${popularity.toLocaleString('pt-BR')}`;
};

const BaseMediaForm = ({
  mediaType,
  initialData,
  externalData,
  manualCreateQuery,
  onSubmit,
  onCancel,
  loading = false,
  children,
  selectedRating,
  onRatingChange,
}) => {
  const [selectedGenres, setSelectedGenres] = React.useState(
    initialData?.genres || externalData?.genres || []
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
    resolver: zodResolver(baseMediaSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      releaseYear: initialData.releaseYear,
      genres: initialData.genres,
      rating: initialData.rating,
      comment: initialData.comment,
      imageUrl: initialData.imageUrl,
    } : externalData ? {
      title: externalData.title,
      description: externalData.description,
      releaseYear: externalData.releaseYear,
      genres: externalData.genres,
      status: 'planned',
      imageUrl: externalData.imageUrl,
    } : manualCreateQuery ? {
      title: manualCreateQuery,
      status: 'planned',
      genres: [],
    } : {
      status: 'planned',
      genres: [],
    },
  });

  const currentStatus = watch('status');

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

  // FUNÇÃO CORRIGIDA - usar nome diferente e chamar a prop
  const handleRatingChangeInternal = (rating) => {
    // Atualizar estado local se necessário
    if (setSelectedRating) {
      setSelectedRating(rating);
    }
    setValue('rating', rating, { shouldValidate: true });
    // Chamar a prop onRatingChange se existir
    if (onRatingChange) {
      onRatingChange(rating);
    }
  };

  const onSubmitForm = (data) => {
    onSubmit({
      ...data,
      rating: selectedRating,
      genres: selectedGenres,
      ...(externalData && {
        externalId: externalData.externalId,
        apiRating: externalData.apiRating,
        apiVoteCount: externalData.apiVoteCount,
        // Adicionar dados específicos do MyAnimeList
        ...(mediaType === 'anime' && {
          episodes: externalData.episodes,
          popularity: externalData.popularity,
          members: externalData.members,
          rank: externalData.rank,
        }),
        ...(mediaType === 'manga' && {
          volumes: externalData.volumes,
          chapters: externalData.chapters,
          popularity: externalData.popularity,
          members: externalData.members,
          rank: externalData.rank,
        }),
      }),
    });
  };

  const formatApiRating = (rating, mediaType) => {
    if (!rating) return null;

    // APIs que usam base 10: TMDB (filmes/séries) e MyAnimeList (animes/mangás)
    const base10Apis = ['movie', 'series', 'anime', 'manga'];
    // APIs que usam base 5: RAWG (jogos) e Google Books (livros)
    const base5Apis = ['game', 'book'];

    if (base10Apis.includes(mediaType)) {
      return {
        display: (rating / 2).toFixed(1), // Converte para base 5
        original: rating.toFixed(1),
        base: 10
      };
    } else if (base5Apis.includes(mediaType)) {
      return {
        display: rating.toFixed(1), // Mantém base 5
        original: rating.toFixed(1),
        base: 5
      };
    }

    return {
      display: rating.toFixed(1),
      original: rating.toFixed(1),
      base: 10 // Padrão
    };
  };

  const statusOptions = [
    { value: 'planned', label: 'Planejado' },
    { value: 'in_progress', label: 'Em Progresso' },
    { value: 'completed', label: 'Concluído' },
    { value: 'dropped', label: 'Abandonado' },
  ];

  const availableGenres = ['Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Ficção Científica', 'Terror', 'Romance'];

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {hasExternalData && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-300 mb-2">
            📋 Dados importados {getApiSourceLabel()}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Avaliação */}
            {externalData.apiRating && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-blue-300">Nota:</span>{' '}
                <span className="font-medium text-white">
                  {formatApiRating(externalData.apiRating, mediaType)?.display}/5
                </span>
                {externalData.apiVoteCount && (
                  <span className="text-blue-400 text-xs">
                    ({externalData.apiVoteCount.toLocaleString()} votos)
                  </span>
                )}
              </div>
            )}

            {/* Popularidade */}
            {externalData.popularity && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300">Popularidade:</span>{' '}
                <span className="font-medium text-white">{formatPopularity(externalData.popularity)}</span>
              </div>
            )}

            {/* Membros */}
            {externalData.members && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-blue-300">Membros:</span>{' '}
                <span className="font-medium text-white">{formatMembers(externalData.members)}</span>
              </div>
            )}

            {/* Rank */}
            {externalData.rank && (
              <div>
                <span className="text-blue-300">Rank:</span>{' '}
                <span className="font-medium text-white">#{externalData.rank}</span>
              </div>
            )}

            {/* Ano */}
            {externalData.releaseYear && (
              <div>
                <span className="text-blue-300">Ano:</span>{' '}
                <span className="font-medium text-white">{externalData.releaseYear}</span>
              </div>
            )}

            {/* Episódios (anime) */}
            {mediaType === 'anime' && externalData.episodes && (
              <div>
                <span className="text-blue-300">Episódios:</span>{' '}
                <span className="font-medium text-white">{externalData.episodes}</span>
              </div>
            )}

            {/* Volumes (manga) */}
            {mediaType === 'manga' && (
              <div>
                <span className="text-blue-300">Volumes:</span>{' '}
                <span className="font-medium text-white">
                  {externalData.volumes || '?'}
                </span>
              </div>
            )}

            {/* Capítulos (manga) */}
            {mediaType === 'manga' && (
              <div>
                <span className="text-blue-300">Capítulos:</span>{' '}
                <span className="font-medium text-white">
                  {externalData.chapters || '?'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {hasExternalData && externalData.imageUrl && (
        <div className="flex justify-center">
          <div className={`rounded-lg overflow-hidden border border-gray-600 ${mediaType === 'book' ? 'w-32 h-48' : 'w-48 h-64'}`}>
            <img
              src={externalData.imageUrl}
              alt={externalData.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {isManualEntry && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-white">Informações Básicas</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Título *"
              {...register('title')}
              error={errors.title?.message}
              placeholder={`Título do ${mediaType}`}
            />

            <Input
              label="Ano de Lançamento"
              type="number"
              {...register('releaseYear', { valueAsNumber: true })}
              error={errors.releaseYear?.message}
              placeholder="2024"
            />

            <div className="md:col-span-2">
              <Input
                label="URL da Imagem"
                {...register('imageUrl')}
                error={errors.imageUrl?.message}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição/Sinopse
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              placeholder={`Descreva o ${mediaType}...`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gêneros *
            </label>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedGenres.includes(genre)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            {errors.genres && (
              <p className="mt-1 text-sm text-red-400">{errors.genres.message}</p>
            )}
          </div>
        </div>
      )}

      {hasExternalData && (
        <div className="space-y-4 border-t border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-white">
            Informações do {getApiSourceLabel()}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Título
            </label>
            <p className="text-white font-medium">{externalData.title}</p>
          </div>

          {externalData.releaseYear && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ano de Lançamento
              </label>
              <p className="text-white">{externalData.releaseYear}</p>
            </div>
          )}

          {/* Informações específicas para animes */}
          {mediaType === 'anime' && externalData.episodes && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Episódios
              </label>
              <p className="text-white">{externalData.episodes}</p>
            </div>
          )}

          {/* Informações específicas para mangás */}
          {mediaType === 'manga' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Volumes
              </label>
              <p className="text-white">{externalData.volumes || '?'}</p>
            </div>
          )}

          {mediaType === 'manga' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Capítulos
              </label>
              <p className="text-white">{externalData.chapters || '?'}</p>
            </div>
          )}

          {externalData.description && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Sinopse
              </label>
              <p className="text-gray-400 text-sm leading-relaxed">
                {externalData.description}
              </p>
            </div>
          )}

          {externalData.genres && externalData.genres.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gêneros
              </label>
              <div className="flex flex-wrap gap-2">
                {externalData.genres.map((genre, index) => (
                  <span
                    key={typeof genre === 'object' ? genre.id || genre.name || index : genre}
                    className={`px-3 py-1 text-sm rounded-full ${mediaType === 'book'
                      ? 'bg-purple-900 text-purple-300'
                      : mediaType === 'game'
                        ? 'bg-green-900 text-green-300'
                        : mediaType === 'anime' || mediaType === 'manga'
                          ? 'bg-pink-900 text-pink-300'
                          : 'bg-blue-900 text-blue-300'
                      }`}
                  >
                    {typeof genre === 'object' ? genre.name : genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-700 pt-6 space-y-6">
        <h3 className="text-lg font-medium text-white">
          {hasExternalData ? 'Sua experiência' : 'Sua avaliação'}
        </h3>

        <Select
          label="Status *"
          {...register('status')}
          error={errors.status?.message}
          options={statusOptions}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sua avaliação
          </label>
          <RatingComponent
            value={selectedRating}
            onChange={handleRatingChangeInternal}
            showLabel
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Seu comentário
          </label>
          <textarea
            {...register('comment')}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
            placeholder="Compartilhe suas impressões..."
          />
        </div>
      </div>

      {children}

      <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {initialData ? 'Atualizar' : hasExternalData ? 'Adicionar à minha lista' : 'Criar manualmente'}
        </Button>
      </div>
    </form>
  );
};

export default BaseMediaForm;