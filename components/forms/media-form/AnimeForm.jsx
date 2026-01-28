// /components/forms/media-form/AnimeForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, TextArea } from '@/components/ui';
import { Tv, Hash, Star, Calendar, Users, TrendingUp, Film } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatApiRating, formatMembers, formatPopularity } from '@/lib/utils/general-utils';
import { statusColors } from '@/constants';
import { ratingLabels } from '@/constants';
import { getMediaColor, formatReleasePeriod } from '@/lib/utils/media-utils';
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

  console.log(props)
  const mediaColor = getMediaColor('animes');

  const availableGenres = React.useMemo(() => {
    try {
      const genres = JikanClient.getAllGenres();
      return genres || [];
    } catch (error) {
      console.error('Erro ao carregar gêneros:', error);
      return [];
    }
  }, []);

  // Calcular total de episódios disponíveis
  const totalEpisodes = React.useMemo(() => {
    // Verifica múltiplas fontes possíveis
    if (initialData?.episodes) {
      return initialData.episodes;
    }
    if (initialData?.mediaCacheId?.essentialData?.episodes) {
      return initialData.mediaCacheId.essentialData.episodes;
    }
    if (externalData?.episodes) {
      return externalData.episodes;
    }
    // Para watch, precisamos usar um hook separado
    return null;
  }, [initialData, externalData]);

  const getInitialGenres = () => {
    // Para initialData (dados existentes)
    if (initialData?.genres) {
      if (Array.isArray(initialData.genres) && initialData.genres.length > 0) {
        // Se já for objetos com id e name, mantém
        if (typeof initialData.genres[0] === 'object' && initialData.genres[0].id) {
          return initialData.genres;
        }
        // Se for strings ou IDs, converte para objetos
        return initialData.genres.map(g => {
          // Se for número, procura por ID
          if (typeof g === 'number') {
            const genreFromList = availableGenres.find(ag => ag.id === g);
            return genreFromList || { id: g, name: `Gênero ${g}` };
          }
          return g;
        });
      }
    }

    // Para externalData (dados da API Jikan)
    if (externalData?.genres) {
      if (Array.isArray(externalData.genres)) {
        return externalData.genres.map(g => {
          if (typeof g === 'object' && (g.id || g.name)) {
            return {
              id: g.id?.toString() || `jikan_${Date.now()}`,
              name: g.name || 'Desconhecido'
            };
          }
          // Se for string, busca na lista
          if (typeof g === 'string') {
            const genreFromList = availableGenres.find(ag => ag.name === g);
            return genreFromList || { id: `jikan_${g}`, name: g };
          }
          return { id: 'unknown', name: 'Desconhecido' };
        });
      }
    }

    return [];
  };

  // ADICIONE ESTE ESTADO - FALTAVA NO SEU CÓDIGO
  const [selectedGenres, setSelectedGenres] = React.useState([]);

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

  const validateCurrentEpisode = (value) => {
    if (value === '' || value === undefined || value === null) {
      return true; // Permite campo vazio
    }

    const numValue = Number(value);

    // Não pode ser negativo
    if (numValue < 0) {
      return 'Episódios assistidos não pode ser negativo';
    }

    // Se temos total de episódios, valida contra ele
    if (totalEpisodes && numValue > totalEpisodes) {
      return `Episódios assistidos não pode ser maior que ${totalEpisodes}`;
    }

    return true;
  };

  // Função auxiliar para extrair releasePeriod dos dados
  const extractReleasePeriodFromData = (data) => {
    if (!data) return undefined;

    // Primeiro tenta obter releasePeriod direto
    if (data.releasePeriod) {
      return data.releasePeriod;
    }

    return undefined;
  };

  const getDefaultValues = () => {
    const defaultValues = {
      status: 'planned',
      genres: getInitialGenres(), // Já retorna objetos
      progress: { currentEpisode: 0 },
      userRating: null,
      personalNotes: '',
      coverImage: '',
      description: '',
      releasePeriod: undefined,
      episodes: '',
    };

    if (initialData) {
      let episodesFromData = initialData.episodes || initialData.mediaCacheId?.essentialData?.episodes || '';
      let currentEpisode = initialData.progress?.currentEpisode ||
        initialData.progress?.episodes || 0;

      if (episodesFromData && currentEpisode > episodesFromData) {
        currentEpisode = episodesFromData;
      }

      const initialReleasePeriod = extractReleasePeriodFromData(initialData) ||
        extractReleasePeriodFromData(initialData?.mediaCacheId?.essentialData);

      return {
        ...defaultValues,
        title: initialData.title || '',
        description: initialData.description || '',
        releasePeriod: initialReleasePeriod,
        genres: getInitialGenres(), // Usa função atualizada
        userRating: initialData.userRating || null,
        personalNotes: initialData.personalNotes || '',
        coverImage: initialData.coverImage || '',
        status: initialData.status || 'planned',
        episodes: episodesFromData,
        progress: {
          currentEpisode: currentEpisode
        },
      };
    }

    if (externalData) {
      // Extrai releasePeriod dos dados externos
      const externalReleasePeriod = extractReleasePeriodFromData(externalData);

      return {
        ...defaultValues,
        title: externalData.title || '',
        description: externalData.description || '',
        releasePeriod: externalReleasePeriod, // Usa releasePeriod
        genres: getInitialGenres(),
        status: 'planned',
        coverImage: externalData.coverImage || '',
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

  const currentEpisode = watch('progress.currentEpisode') || 0;
  const releasePeriod = watch('releasePeriod');

  React.useEffect(() => {
    if (availableGenres.length > 0) {
      const initialGenres = getInitialGenres();
      setSelectedGenres(initialGenres);
      setValue('genres', initialGenres, { shouldValidate: true });
    }
  }, [availableGenres]);

  React.useEffect(() => {
    if (initialData) {
      const values = getDefaultValues();
      Object.keys(values).forEach(key => {
        if (key === 'progress') {
          setValue('progress.currentEpisode', values.progress.currentEpisode);
        } else if (key === 'episodes') {
          setValue('episodes', values.episodes);
        } else if (key === 'releasePeriod') {
          setValue('releasePeriod', values.releasePeriod);
        } else {
          setValue(key, values[key]);
        }
      });
    }
  }, [initialData, setValue]);

  // Atualizar totalEpisodes quando episodes mudar no formulário manual
  const episodesFromForm = watch('episodes');

  const handleGenreToggle = (genre) => {
    if (hasExternalData && !isEditMode) return;

    // `genre` agora é um objeto {id, name}
    const genreId = genre.id || genre;

    const newGenres = selectedGenres.some(g => (g.id || g) === genreId)
      ? selectedGenres.filter(g => (g.id || g) !== genreId)
      : [...selectedGenres, genre];

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
    if (count > 1000) {
      setCanSubmit(false);
      toast.error('Notas pessoais não podem exceder 1000 caracteres');
    } else {
      setCanSubmit(true);
    }

    // Atualizar o valor no formulário
    setValue('personalNotes', value, { shouldValidate: true });
  };

  // Função auxiliar para obter nome completo do mês
  const getMonthName = (monthNumber) => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return monthNames[monthNumber - 1] || '';
  };

  const onSubmitForm = async (e) => {
    try {
      // Previne o comportamento padrão do formulário
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      // Verifica se pode submeter (limite de caracteres)
      if (!canSubmit) {
        toast.error('Notas pessoais não podem exceder 1000 caracteres');
        return;
      }

      const currentEpisodeValue = watch('progress.currentEpisode') || 0;
      const totalEpisodesValue = watch('episodes') || totalEpisodes;

      if (totalEpisodesValue && currentEpisodeValue > totalEpisodesValue) {
        toast.error(`Episódios assistidos (${currentEpisodeValue}) não pode ser maior que o total (${totalEpisodesValue})`);
        setValue('progress.currentEpisode', totalEpisodesValue, { shouldValidate: true });
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
        genres: watch('genres'),
        status: watch('status'),
        releasePeriod: watch('releasePeriod'), // Alterado para releasePeriod
        episodes: watch('episodes'),
        userRating: watch('userRating'),
        personalNotes: watch('personalNotes'),
        progress: {
          currentEpisode: watch('progress.currentEpisode')
        }
      };

      // Verifica novamente o limite de caracteres
      if (formData.personalNotes && formData.personalNotes.length > 1000) {
        toast.error('Notas pessoais não podem exceder 1000 caracteres');
        return;
      }

      if (onSubmit) {
        const finalFormData = {
          ...formData,
          mediaType: 'anime',
          releasePeriod: formData.releasePeriod || null,
          userRating: formData.userRating || null,
          personalNotes: formData.personalNotes || '',
          // Garante que genres seja array de objetos
          genres: formData.genres,
          episodes: formData.episodes || null,
          progress: {
            episodes: formData.progress?.currentEpisode || 0,
            lastUpdated: new Date()
          }
        };

        // Se for completed e não tem episódios definidos, usar o total
        if (formData.status === 'completed' && formData.episodes) {
          finalFormData.progress.episodes = formData.episodes;
        }

        if (isEditMode && initialData && initialData._id) {
          finalFormData.userMediaId = initialData._id;
        }

        if (externalData && !isEditMode) {
          finalFormData.sourceId = externalData.id?.toString();
          finalFormData.sourceApi = 'jikan';
          finalFormData.title = externalData.title || finalFormData.title;
          finalFormData.description = externalData.description || finalFormData.description;
          finalFormData.coverImage = externalData.coverImage || finalFormData.coverImage;
          finalFormData.apiRating = externalData.apiRating;
          finalFormData.apiVoteCount = externalData.apiVoteCount || externalData.ratingCount;
          finalFormData.episodes = externalData.episodes || formData.episodes;
          finalFormData.popularity = externalData.popularity;
          finalFormData.members = externalData.members;
          finalFormData.studios = externalData.studios || [];

          // Atualizado para releasePeriod
          if (!finalFormData.releasePeriod && externalData.releasePeriod) {
            finalFormData.releasePeriod = externalData.releasePeriod;
          }
        }

        if (isManualEntry) {
          finalFormData.sourceId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          finalFormData.sourceApi = 'manual';
          finalFormData.coverImage = '';
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
            {/* Nota - verifica se existe e é maior que 0 */}
            {(externalData.apiRating != null && externalData.apiRating > 0 &&
              externalData.apiVoteCount != null && externalData.apiVoteCount > 0) ? (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <div>
                  <span className="text-white/80">Nota:</span>
                  <div className="font-medium text-white">
                    {formatApiRating(externalData.apiRating)?.display || externalData.apiRating.toFixed(1)}/5
                  </div>
                  <div className="text-xs text-white/60">
                    ({externalData.apiVoteCount.toLocaleString()} votos)
                  </div>
                </div>
              </div>
            ) : null}

            {/* Popularidade - verifica se existe e é maior que 0 */}
            {externalData.popularity != null && externalData.popularity > 0 ? (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-white/80">Popularidade:</span>
                  <div className="font-medium text-white">{formatPopularity(externalData.popularity)}</div>
                </div>
              </div>
            ) : null}

            {/* Membros - verifica se existe e é maior que 0 */}
            {externalData.members != null && externalData.members > 0 ? (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Users className="w-4 h-4 text-green-400" />
                <div>
                  <span className="text-white/80">Membros:</span>
                  <div className="font-medium text-white">{formatMembers(externalData.members)}</div>
                </div>
              </div>
            ) : null}

            {/* Período de lançamento - verifica se existe */}
            {externalData.releasePeriod ? (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Calendar className="w-4 h-4 text-white/60" />
                <div>
                  <span className="text-white/80">Lançamento:</span>
                  <div className="font-medium text-white">
                    {formatReleasePeriod(externalData.releasePeriod)}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Episódios - verifica se existe e é maior que 0 */}
            {externalData.episodes != null && externalData.episodes > 0 ? (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Tv className="w-4 h-4 text-pink-400" />
                <div>
                  <span className="text-white/80">Episódios:</span>
                  <div className="font-medium text-white">{externalData.episodes}</div>
                </div>
              </div>
            ) : null}

            {/* Estúdios - verifica se existe e tem pelo menos 1 */}
            {externalData.studios && externalData.studios.length > 0 ? (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Film className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-white/80">
                    {externalData.studios.length === 1 ? 'Estúdio:' : 'Estúdios:'}
                  </span>
                  <div className="font-medium text-white">
                    {/* Mostra os 3 primeiros estúdios */}
                    {externalData.studios.slice(0, 3).map((studio, index, arr) => (
                      <span key={index}>
                        {studio}
                        {index < arr.length - 1 && index < 2 && ', '}
                      </span>
                    ))}
                  </div>
                  {/* Mostra "+X outro(s)" somente a partir do 4º estúdio */}
                  {externalData.studios.length > 3 && (
                    <div className="text-xs text-white/60">
                      +{externalData.studios.length - 3} outro(s)
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Imagem com tags de gêneros */}
      {hasExternalData && externalData.coverImage && (
        <div className="flex flex-col items-center">
          <div className="rounded-xl overflow-hidden border glass w-48 h-64 relative">
            <img
              src={externalData.coverImage}
              alt={externalData.title}
              className="w-full h-full object-cover"
            />
          </div>

          {externalData.genres && externalData.genres.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-md">
              {/* ✅ Tag de Category (primeira, com cor diferente) */}
              {externalData.category && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 
                       text-blue-300 text-sm font-bold rounded-lg border border-blue-500/30 
                       hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300">
                  {/* Converte para primeira letra maiúscula e resto minúscula */}
                  {externalData.category}
                </span>
              )}

              {/* Gêneros normais (cores rosa) */}
              {externalData.genres.slice(0, externalData.category ? 4 : 5).map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 
                     text-pink-300 text-sm font-medium rounded-lg border border-pink-500/30 
                     hover:from-pink-500/30 hover:to-purple-500/30 transition-all duration-300"
                >
                  {typeof genre === 'object' ? genre.name : genre}
                </span>
              ))}

              {/* Mostra contador se houver mais gêneros */}
              {externalData.genres.length > (externalData.category ? 4 : 5) && (
                <span className="px-3 py-1.5 bg-white/10 text-white/60 text-sm font-medium rounded-lg">
                  +{externalData.genres.length - (externalData.category ? 4 : 5)}
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

            {/* Campo para Ano */}
            <Input
              label="Ano de Lançamento"
              type="number"
              icon={Calendar}
              {...register('releasePeriod.year', {
                valueAsNumber: true,
                setValueAs: (value) => value === '' ? undefined : Number(value)
              })}
              error={errors.releasePeriod?.year?.message}
              placeholder="2024"
              variant="glass"
              min={1950}
              max={new Date().getFullYear() + 5}
            />

            {/* Campo opcional para Mês */}
            <Select
              label="Mês de Lançamento (opcional)"
              icon={Calendar}
              {...register('releasePeriod.month', {
                valueAsNumber: true,
                setValueAs: (value) => value === '' ? undefined : Number(value)
              })}
              error={errors.releasePeriod?.month?.message}
              variant="glass"
              options={[
                { value: '', label: 'Não especificado' },
                { value: '1', label: 'Janeiro' },
                { value: '2', label: 'Fevereiro' },
                { value: '3', label: 'Março' },
                { value: '4', label: 'Abril' },
                { value: '5', label: 'Maio' },
                { value: '6', label: 'Junho' },
                { value: '7', label: 'Julho' },
                { value: '8', label: 'Agosto' },
                { value: '9', label: 'Setembro' },
                { value: '10', label: 'Outubro' },
                { value: '11', label: 'Novembro' },
                { value: '12', label: 'Dezembro' }
              ]}
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
              Gêneros {!isManualEntry && ' *'}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover-lift",
                    selectedGenres.some(g => (g.id || g) === genre.id)
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

            {selectedGenres.length === 0 && !isManualEntry && (
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
                <span className={`text-sm ${charCount > 1000 ? 'text-red-400' : 'text-gray-400'}`}>
                  {charCount}/1000 caracteres
                </span>
              </div>
              <textarea
                {...register('personalNotes')}
                onChange={handlePersonalNotesChange}
                rows={4}
                maxLength={1000}
                placeholder="Anotações, pensamentos, avaliação detalhada..."
                className={`w-full bg-gray-900 border ${charCount > 1000 ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none`}
              />
              {errors.personalNotes && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.personalNotes.message}
                </p>
              )}
              {charCount > 1000 && (
                <p className="mt-1 text-sm text-red-400">
                  Limite de 1000 caracteres excedido. Reduza seu texto para continuar.
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
              <p className="text-sm text-white/60">
                Em qual episódio você está?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <Input
                label="Episódios Assistidos:"
                type="number"
                icon={Hash}
                {...register('progress.currentEpisode', {
                  valueAsNumber: true,
                  setValueAs: (value) => {
                    if (value === '' || value === null || value === undefined) {
                      return undefined;
                    }
                    const numValue = Number(value);

                    // Limita automaticamente ao máximo
                    const maxEpisodes = totalEpisodes || episodesFromForm;
                    if (maxEpisodes && numValue > maxEpisodes) {
                      return maxEpisodes;
                    }

                    // Não permite negativo
                    if (numValue < 0) {
                      return 0;
                    }

                    return numValue;
                  },
                  validate: validateCurrentEpisode
                })}
                error={errors.progress?.currentEpisode?.message}
                placeholder={`0${(totalEpisodes || episodesFromForm) ? ` (máx: ${totalEpisodes || episodesFromForm})` : ''}`}
                variant="glass"
                min={0}
                max={totalEpisodes || episodesFromForm || undefined}
                step={1}
              />

              {/* Mensagem informativa */}
              {(totalEpisodes || episodesFromForm) && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                  <span className="text-white/60">
                    Total: <span className="font-medium text-white">{totalEpisodes || episodesFromForm}</span> episódios
                  </span>
                </div>
              )}

              {/* Dica quando o usuário atingir o máximo */}
              {(totalEpisodes || episodesFromForm) && currentEpisode >= (totalEpisodes || episodesFromForm) && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">
                    Você completou todos os episódios! Mude o status para "Concluído"
                  </span>
                </div>
              )}
            </div>

            {/* Barra de progresso visual */}
            {(totalEpisodes || episodesFromForm) && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">Progresso:</span>
                  <span className="text-white font-medium">
                    {currentEpisode}/{totalEpisodes || episodesFromForm} episódios
                    ({totalEpisodes || episodesFromForm ? Math.round((currentEpisode / (totalEpisodes || episodesFromForm)) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                    style={{
                      width: `${(totalEpisodes || episodesFromForm) ? Math.min((currentEpisode / (totalEpisodes || episodesFromForm)) * 100, 100) : 0}%`
                    }}
                  />
                </div>
              </div>
            )}
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