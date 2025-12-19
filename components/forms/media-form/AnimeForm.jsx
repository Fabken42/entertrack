// /components/forms/media-form/AnimeForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, TextArea } from '@/components/ui';
import { Tv, Hash, Star, Calendar, Users, TrendingUp, Film } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatApiRating, formatMembers, formatPopularity } from '@/lib/utils/general-utils';
import { statusColors } from '@/constants';
import { ratingLabels } from '@/constants';
import { getMediaColor } from '@/lib/utils/media-utils';
import { animeSchema } from '@/lib/schemas/anime-schema';
import { JikanClient } from "@/lib/api/jikan.js";

const AnimeForm = (props) => {
  const {
    initialData,
    externalData,
    manualCreateQuery,
    onCancel,
    loading = false,
    onSubmit,
  } = props;

  // Usando função utilitária para cores
  const mediaColor = getMediaColor('animes');

  // Obter todos os gêneros do Jikan
  const availableGenres = React.useMemo(() => {
    try {
      const genres = JikanClient.getAllGenres();
      return genres || [];
    } catch (error) {
      console.error('Erro ao carregar gêneros:', error);
      return [];
    }
  }, []);

  const getInitialGenres = () => {
    if (initialData?.genres) {
      return initialData.genres.map(g => typeof g === 'object' ? g.id || g.name : g);
    }
    if (externalData?.genres) {
      if (externalData.genres && externalData.genres.length > 0) {
        return externalData.genres.map(g => {
          if (typeof g === 'object') {
            return g.id?.toString() || g.name;
          }
          return g;
        });
      }
      return ['1']; // ID padrão para Ação
    }
    return ['1']; // ID padrão para Ação
  };

  // Estado local
  const [selectedGenres, setSelectedGenres] = React.useState(
    getInitialGenres()
  );
  const [selectedRating, setSelectedRating] = React.useState(
    initialData?.userRating || 3
  );
  const [charCount, setCharCount] = React.useState(
    initialData?.personalNotes?.length || 0
  );
  const [canSubmit, setCanSubmit] = React.useState(true);


  const isEditMode = !!initialData;
  const hasExternalData = !!externalData;
  const isManualEntry = !hasExternalData && !isEditMode;

  const getDefaultValues = () => {
    const defaultValues = {
      status: 'planned',
      genres: getInitialGenres(),
      progress: { currentEpisode: 0 },
      userRating: null,
      personalNotes: '',
      imageUrl: '',
      description: '',
      releaseYear: undefined,
      episodes: '',
    };

    if (initialData) {
      return {
        ...defaultValues,
        title: initialData.title || '',
        description: initialData.description || '',
        releaseYear: initialData.releaseYear || initialData.mediaCacheId?.essentialData?.releaseYear,
        genres: getInitialGenres(),
        userRating: initialData.userRating || null,
        personalNotes: initialData.personalNotes || '',
        imageUrl: initialData.imageUrl || '',
        status: initialData.status || 'planned',
        episodes: initialData.episodes || initialData.mediaCacheId?.essentialData?.episodes || '',
        progress: {
          currentEpisode: initialData.progress?.currentEpisode ||
            initialData.progress?.current || 0
        },
      };
    }

    if (externalData) {
      return {
        ...defaultValues,
        title: externalData.title || '',
        description: externalData.description || '',
        releaseYear: externalData.releaseYear || undefined,
        genres: getInitialGenres(),
        status: 'planned',
        imageUrl: externalData.imageUrl || '',
        episodes: externalData.episodes || '',
        progress: { currentEpisode: 0 },
        userRating: null,
      };
    }

    if (manualCreateQuery) {
      return {
        ...defaultValues,
        title: manualCreateQuery || '',
        status: 'planned',
        episodes: '',
      };
    }

    return defaultValues;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(animeSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange',
  });

  const currentStatus = watch('status');
  const showRatingAndComment = currentStatus === 'completed' || currentStatus === 'dropped';
  const showProgressFields = currentStatus === 'in_progress' || currentStatus === 'dropped';

  React.useEffect(() => {
    setValue('genres', selectedGenres, { shouldValidate: true });
  }, [selectedGenres, setValue]);

  React.useEffect(() => {
    if (initialData) {
      const values = getDefaultValues();
      Object.keys(values).forEach(key => {
        if (key === 'progress') {
          setValue('progress.currentEpisode', values.progress.currentEpisode);
        } else if (key === 'episodes') {
          setValue('episodes', values.episodes);
        } else {
          setValue(key, values[key]);
        }
      });
    }
  }, [initialData, setValue]);

  const handleGenreToggle = (genreId) => {
    if (hasExternalData && !isEditMode) return;

    const newGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter(g => g !== genreId)
      : [...selectedGenres, genreId];

    setSelectedGenres(newGenres);
  };

  const handleRatingChangeInternal = (rating) => {
    setSelectedRating(rating);
    setValue('userRating', rating, { shouldValidate: true });
  };

  // Função para lidar com a mudança nas notas pessoais
  const handlePersonalNotesChange = (e) => {
    const value = e.target.value;
    const count = value.length;

    setCharCount(count);

    // Verificar se excede o limite
    if (count > 3000) {
      setCanSubmit(false);
      toast.error('Notas pessoais não podem exceder 3000 caracteres');
    } else {
      setCanSubmit(true);
    }

    // Atualizar o valor no formulário
    setValue('personalNotes', value, { shouldValidate: true });
  };

  const onSubmitForm = async (e) => {
    try {
      // Previne o comportamento padrão do formulário
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      // Verifica se pode submeter (limite de caracteres)
      if (!canSubmit) {
        toast.error('Notas pessoais não podem exceder 3000 caracteres');
        return;
      }

      // Valida o formulário
      const isValid = await trigger();

      if (!isValid) {
        console.error('❌ Form validation failed:', errors);
        toast.error('Por favor, corrija os erros no formulário');
        return;
      }

      // Obtém os valores do formulário manualmente
      const formData = {
        title: watch('title'),
        description: watch('description'),
        status: watch('status'),
        releaseYear: watch('releaseYear'),
        episodes: watch('episodes'),
        userRating: watch('userRating'),
        personalNotes: watch('personalNotes'),
        progress: {
          currentEpisode: watch('progress.currentEpisode')
        }
      };

      // Verifica novamente o limite de caracteres
      if (formData.personalNotes && formData.personalNotes.length > 3000) {
        toast.error('Notas pessoais não podem exceder 3000 caracteres');
        return;
      }

      if (onSubmit) {
        const finalFormData = {
          ...formData,
          mediaType: 'anime',
          releaseYear: formData.releaseYear || null,
          userRating: formData.userRating || null,
          personalNotes: formData.personalNotes || '',
          genres: selectedGenres,
          episodes: formData.episodes || null,
          progress: showProgressFields ? {
            currentEpisode: formData.progress?.currentEpisode || 0,
          } : undefined,
        };

        if (isEditMode && initialData && initialData._id) {
          finalFormData.userMediaId = initialData._id;
        }

        if (externalData && !isEditMode) {
          finalFormData.externalId = externalData.externalId?.toString();
          finalFormData.sourceApi = 'jikan';
          finalFormData.title = externalData.title || finalFormData.title;
          finalFormData.description = externalData.description || finalFormData.description;
          finalFormData.imageUrl = externalData.imageUrl || finalFormData.imageUrl;
          finalFormData.apiRating = externalData.apiRating;
          finalFormData.apiVoteCount = externalData.apiVoteCount || externalData.ratingsCount;
          finalFormData.episodes = externalData.episodes || formData.episodes;
          finalFormData.popularity = externalData.popularity;
          finalFormData.members = externalData.members;
          finalFormData.studios = externalData.studios || [];

          if (!finalFormData.releaseYear && externalData.releaseYear) {
            finalFormData.releaseYear = externalData.releaseYear;
          }
        }

        if (isManualEntry) {
          finalFormData.externalId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          finalFormData.sourceApi = 'manual';
          finalFormData.imageUrl = '';
        }

        await onSubmit(finalFormData);
      }
    } catch (error) {
      console.error('❌ Erro no onSubmitForm:', error);
    }
  };

  return (
    <form onSubmit={(e) => onSubmitForm(e, handleSubmit(onSubmitForm))} className="space-y-8">
      {hasExternalData && (
        <div className={cn("glass border rounded-xl p-6 space-y-4", "border-pink-500/30")}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", mediaColor)}>
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {externalData.title}
              </h3>
              <p className="text-sm text-white/60">Dados importados do myanimelist</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {externalData.apiRating && externalData.apiVoteCount && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <div>
                  <span className="text-white/80">Nota:</span>
                  <div className="font-medium text-white">
                    {formatApiRating(externalData.apiRating)?.display}/5
                  </div>
                  <div className="text-xs text-white/60">
                    ({externalData.apiVoteCount.toLocaleString()} votos)
                  </div>
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

            {(externalData.releaseYear) && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Calendar className="w-4 h-4 text-white/60" />
                <div>
                  <span className="text-white/80">Ano:</span>
                  <div className="font-medium text-white">
                    {externalData.releaseYear}
                  </div>
                </div>
              </div>
            )}

            {externalData.episodes && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Tv className="w-4 h-4 text-pink-400" />
                <div>
                  <span className="text-white/80">Episódios:</span>
                  <div className="font-medium text-white">{externalData.episodes}</div>
                </div>
              </div>
            )}

            {externalData.studios && externalData.studios.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Film className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-white/80">Estúdio:</span>
                  <div className="font-medium text-white">{externalData.studios[0]}</div>
                  {externalData.studios.length > 1 && (
                    <div className="text-xs text-white/60">
                      +{externalData.studios.length - 1} outro(s)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Imagem com tags de gêneros */}
      {hasExternalData && externalData.imageUrl && (
        <div className="flex flex-col items-center">
          <div className="rounded-xl overflow-hidden border glass w-48 h-64 relative">
            <img
              src={externalData.imageUrl}
              alt={externalData.title}
              className="w-full h-full object-cover"
            />
          </div>

          {externalData.genres && externalData.genres.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-md">
              {externalData.genres.slice(0, 5).map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 
                           text-pink-300 text-sm font-medium rounded-lg border border-pink-500/30 
                           hover:from-pink-500/30 hover:to-purple-500/30 transition-all duration-300"
                >
                  {typeof genre === 'object' ? genre.name : genre}
                </span>
              ))}
              {externalData.genres.length > 5 && (
                <span className="px-3 py-1.5 bg-white/10 text-white/60 text-sm font-medium rounded-lg">
                  +{externalData.genres.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {externalData?.description && (
        <div className="glass border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", mediaColor)}>
              <Tv className="w-5 h-5" />
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
              <Tv className="w-5 h-5" />
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
              placeholder="Título do anime"
              variant="glass"
            />

            <Input
              label="Ano de Lançamento"
              type="number"
              icon={Calendar}
              {...register('releaseYear', {
                valueAsNumber: true,
                setValueAs: (value) => value === '' ? undefined : Number(value)
              })}
              error={errors.releaseYear?.message}
              placeholder="2024"
              variant="glass"
              min={1900}
              max={new Date().getFullYear() + 5}
            />

            <Input
              label="Número de Episódios *"
              type="number"
              icon={Tv}
              {...register('episodes', {
                valueAsNumber: true,
                required: "Número de episódios é obrigatório",
                min: {
                  value: 1,
                  message: "Deve ter pelo menos 1 episódio"
                }
              })}
              error={errors.episodes?.message}
              placeholder="12"
              variant="glass"
              min={1}
            />

          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Sinopse
            </label>
            <TextArea
              {...register('description')}
              placeholder="Descreva o anime..."
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
                  key={genre.id}
                  type="button"
                  onClick={() => handleGenreToggle(genre.id.toString())}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover-lift",
                    selectedGenres.includes(genre.id.toString())
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  )}
                >
                  {genre.name}
                </button>
              ))}
            </div>
            {errors.genres && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                {errors.genres.message}
              </p>
            )}
            {selectedGenres.length === 0 && (
              <p className="mt-2 text-sm text-amber-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                Selecione pelo menos um gênero
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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sua Avaliação
              </label>
              <div className="flex items-center gap-2">
                {/* Sistema de 5 estrelas */}
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChangeInternal(star)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`Avaliar com ${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                  >
                    <Star
                      className={`w-10 h-10 ${selectedRating && selectedRating >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-700 text-gray-700'
                        } transition-colors duration-200`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-white/80 font-medium">
                  {selectedRating ? (
                    <span className={ratingLabels[selectedRating]?.color}>
                      {ratingLabels[selectedRating]?.label}
                    </span>
                  ) : (
                    'Clique nas estrelas para avaliar'
                  )}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Notas Pessoais (opcional):
                </label>
                <span className={`text-sm ${charCount > 3000 ? 'text-red-400' : 'text-gray-400'}`}>
                  {charCount}/3000 caracteres
                </span>
              </div>
              <textarea
                {...register('personalNotes')}
                onChange={handlePersonalNotesChange}
                rows={4}
                maxLength={3000}
                placeholder="Anotações, pensamentos, avaliação detalhada..."
                className={`w-full bg-gray-900 border ${charCount > 3000 ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none`}
              />
              {errors.personalNotes && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.personalNotes.message}
                </p>
              )}
              {charCount > 3000 && (
                <p className="mt-1 text-sm text-red-400">
                  Limite de 3000 caracteres excedido. Reduza seu texto para continuar.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {showProgressFields && (
        <div className={cn(
          "glass border border-white/10 rounded-xl p-6 space-y-4",
          "border-l-4 border-pink-500/30"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
              <Tv className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Progresso do Anime</h3>
              <p className="text-sm text-white/60">Em qual episódio você está?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Episódio Atual:"
              type="number"
              icon={Hash}
              {...register('progress.currentEpisode', {
                valueAsNumber: true,
                setValueAs: (value) => value === '' ? undefined : Number(value)
              })}
              error={errors.progress?.currentEpisode?.message}
              placeholder="12"
              variant="glass"
              min={0}
            />
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
          disabled={loading || !canSubmit}
          className="min-w-[100px] bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {initialData ? 'Atualizar' : hasExternalData ? 'Adicionar à minha lista' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};

export default AnimeForm;