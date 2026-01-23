// components/media/forms/SeriesForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, TextArea, Modal } from '@/components/ui';
import { Tv, Calendar, Star, Layers, PlayCircle, Info, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatApiRating } from '@/lib/utils/general-utils';
import { getMediaColor } from '@/lib/utils/media-utils';
import { statusColors, ratingLabels } from '@/constants';
import { seriesSchema } from '@/lib/schemas/series-schema';
import { TMDBClient } from '@/lib/api/tmdb';

const SeriesForm = (props) => {
  const {
    initialData,
    externalData,
    manualCreateQuery,
    onCancel,
    loading = false,
    onSubmit,
  } = props;

  // Usando função utilitária para cores
  const mediaColor = getMediaColor('series');
  const [seasonInfo, setSeasonInfo] = React.useState(null);
  const [loadingSeasons, setLoadingSeasons] = React.useState(false);
  const [showSeasonsModal, setShowSeasonsModal] = React.useState(false);

  React.useEffect(() => {
    // Se estiver em modo de edição e tiver initialData, usar os dados de initialData
    if (initialData && !seasonInfo) {
      setSeasonInfo({
        seasons: initialData.seasons || null,
        episodes: initialData.episodes || null,
        episodesPerSeason: initialData.episodesPerSeason || []
      });
    }
  }, [initialData]);

  React.useEffect(() => {
    const fetchSeasonData = async () => {
      // Não buscar se já tiver initialData (modo edição)
      if (initialData) return;

      if (externalData?.id && !seasonInfo) {
        setLoadingSeasons(true);
        try {
          const response = await fetch(
            `/api/external/tmdb?action=tv-details&id=${externalData.id}`
          );

          if (response.ok) {
            const data = await response.json();
            setSeasonInfo(data);
          } else {
            console.warn('Não foi possível carregar informações das temporadas');
          }
        } catch (error) {
          console.error('Erro ao buscar dados das temporadas:', error);
        } finally {
          setLoadingSeasons(false);
        }
      }
    };

    fetchSeasonData();
  }, [externalData?.id, initialData]);

  const availableGenres = React.useMemo(() => {
    try {
      const genres = TMDBClient.getAllGenres();
      return genres || [];
    } catch (error) {
      console.error('Erro ao carregar gêneros:', error);
      return [];
    }
  }, []);

  const getInitialGenres = () => {
    if (initialData?.genres) {
      return initialData.genres.map(g => typeof g === 'object' ? g.name : g);
    }
    if (externalData?.genres) {
      if (externalData.genres && externalData.genres.length > 0) {
        return externalData.genres.map(g => {
          if (typeof g === 'object') {
            return g.name;
          }
          return g;
        });
      }
    }
    return [];
  };

  // Estado local
  const [selectedGenres, setSelectedGenres] = React.useState(
    getInitialGenres()
  );
  const [selectedRating, setSelectedRating] = React.useState(
    initialData?.userRating || null
  );
  const [charCount, setCharCount] = React.useState(
    initialData?.personalNotes?.length || 0
  );
  const [canSubmit, setCanSubmit] = React.useState(true);

  const isEditMode = !!initialData;
  const hasExternalData = !!externalData;
  const isManualEntry = !hasExternalData && !isEditMode;

  // Preparar dados de rating da API para exibição
  const apiRatingData = React.useMemo(() => {
    if (externalData) {
      // Verifica múltiplas fontes possíveis para rating e votos
      const rating = externalData.rating || externalData.apiRating || externalData.vote_average;
      const voteCount = externalData.ratingCount || externalData.apiVoteCount || externalData.vote_count;

      // Garantir que temos números válidos
      const validRating = rating != null && !isNaN(Number(rating)) && Number(rating) > 0;
      const validVoteCount = voteCount != null && !isNaN(Number(voteCount)) && Number(voteCount) > 0;

      if (validRating && validVoteCount) {
        const formattedRating = formatApiRating(rating);
        return {
          rating: formattedRating?.display || Number(rating).toFixed(1),
          voteCount: Number(voteCount),
          rawRating: Number(rating)
        };
      }
    }
    return null;
  }, [externalData]);

  const getDefaultValues = () => {
    const defaultValues = {
      status: 'planned',
      genres: getInitialGenres(),
      userRating: null,
      personalNotes: '',
      coverImage: '',
      description: '',
      releaseYear: undefined,
      progress: { seasons: 1, episodes: 0 }
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
        coverImage: initialData.coverImage || '',
        status: initialData.status || 'planned',
        progress: {
          seasons: initialData.progress?.seasons || 1,
          episodes: initialData.progress?.episodes || 0,
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
        coverImage: externalData.coverImage || '',
        userRating: null,
        progress: { seasons: 1, episodes: 0 },
      };
    }

    if (manualCreateQuery) {
      return {
        ...defaultValues,
        title: manualCreateQuery || '',
        status: 'planned',
        progress: { seasons: 1, episodes: 0 },
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
    resolver: zodResolver(seriesSchema),
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
          setValue('progress.seasons', values.progress.seasons);
          setValue('progress.episodes', values.progress.episodes);
        } else {
          setValue(key, values[key]);
        }
      });
    }
  }, [initialData, setValue]);

  // No useEffect que observa mudança na temporada (adicionar após o useEffect existente)
  React.useEffect(() => {
    // Quando a temporada muda, verifica se o episódio atual é maior que o máximo da nova temporada
    const currentSeasonValue = watch('progress.seasons') || 1;
    const currentEpisodeValue = watch('progress.episodes') || 0;

    if (seasonInfo?.episodesPerSeason && seasonInfo.episodesPerSeason.length >= currentSeasonValue) {
      const maxEpisodes = seasonInfo.episodesPerSeason[currentSeasonValue - 1];

      if (currentEpisodeValue > maxEpisodes) {
        // Resetar para o máximo da nova temporada
        setValue('progress.episodes', maxEpisodes, { shouldValidate: true });
      }
    }
  }, [watch('progress.seasons'), seasonInfo?.episodesPerSeason, setValue]);

  const handleGenreToggle = (genre) => {
    if (hasExternalData && !isEditMode) return;

    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];

    setSelectedGenres(newGenres);
  };

  const handleRatingChangeInternal = (rating) => {
    setSelectedRating(rating);
    setValue('userRating', rating, { shouldValidate: true });
  };

  const validateCurrentSeason = (value) => {
    if (value === '' || value === undefined || value === null) {
      return true;
    }

    const numValue = Number(value);

    if (numValue < 1) {
      return 'Temporada não pode ser menor que 1';
    }

    // Usar initialData.seasons se disponível (modo edição), senão usar seasonInfo
    const maxSeasons = initialData?.seasons || seasonInfo?.seasons;
    if (maxSeasons && numValue > maxSeasons) {
      return `Temporada não pode ser maior que ${maxSeasons}`;
    }

    return true;
  };

  const validateCurrentEpisode = (value, seasonValue) => {
    if (value === '' || value === undefined || value === null) {
      return true;
    }

    const numValue = Number(value);
    const seasonNum = Number(seasonValue) || 1;

    if (numValue < 0) {
      return 'Episódio não pode ser negativo';
    }

    // Usar initialData quando disponível (modo edição)
    if (initialData?.episodesPerSeason && initialData.episodesPerSeason.length >= seasonNum) {
      const maxEpisodes = initialData.episodesPerSeason[seasonNum - 1];
      if (numValue > maxEpisodes) {
        return `Temporada ${seasonNum} tem apenas ${maxEpisodes} episódios`;
      }
    }
    // Fallback para seasonInfo (modo criação)
    else if (seasonInfo?.episodesPerSeason && seasonInfo.episodesPerSeason.length >= seasonNum) {
      const maxEpisodes = seasonInfo.episodesPerSeason[seasonNum - 1];
      if (numValue > maxEpisodes) {
        return `Temporada ${seasonNum} tem apenas ${maxEpisodes} episódios`;
      }
    }
    // Verificação pelo total geral
    else {
      const totalEpisodes = initialData?.episodes || seasonInfo?.episodes;
      if (totalEpisodes && numValue > totalEpisodes) {
        return `Total de episódios é ${totalEpisodes}`;
      }
    }

    return true;
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

  const onSubmitForm = async (e) => {
    try {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      if (!canSubmit) {
        toast.error('Notas pessoais não podem exceder 1000 caracteres');
        return;
      }

      // Validação dos valores atuais contra os totais
      if (showProgressFields) {
        const currentSeasonValue = watch('progress.seasons') || 1;
        const currentEpisodeValue = watch('progress.episodes') || 0;

        if (currentSeasonValue < 1) {
          toast.error('Temporada atual não pode ser menor que 1');
          setValue('progress.seasons', 1, { shouldValidate: true });
          return;
        }

        // Validação para episódio (permite 0)
        if (currentEpisodeValue < 0) {
          toast.error('Episódio atual não pode ser negativo');
          setValue('progress.episodes', 0, { shouldValidate: true });
          return;
        }

        // Validação específica por temporada
        if (seasonInfo?.episodesPerSeason && seasonInfo.episodesPerSeason.length >= currentSeasonValue) {
          const maxEpisodes = seasonInfo.episodesPerSeason[currentSeasonValue - 1];
          if (currentEpisodeValue > maxEpisodes) {
            toast.error(`Episódio atual (${currentEpisodeValue}) não pode ser maior que ${maxEpisodes} na temporada ${currentSeasonValue}`);
            setValue('progress.episodes', maxEpisodes, { shouldValidate: true });
            return;
          }
        }
        // Validação fallback
        else if (seasonInfo?.episodes && currentEpisodeValue > seasonInfo.episodes) {
          toast.error(`Episódio atual (${currentEpisodeValue}) não pode ser maior que o total (${seasonInfo.episodes})`);
          setValue('progress.episodes', seasonInfo.episodes, { shouldValidate: true });
          return;
        }
      }

      const isValid = await trigger();

      if (!isValid) {
        toast.error('Por favor, corrija os erros no formulário');
        return;
      }
      const formData = {
        title: watch('title'),
        description: watch('description'),
        genres: watch('genres'),
        status: watch('status'),
        releaseYear: watch('releaseYear'),
        userRating: watch('userRating'),
        personalNotes: watch('personalNotes'),
        progress: {
          seasons: watch('progress.seasons'),
          episodes: watch('progress.episodes')
        }
      };
      if (formData.personalNotes && formData.personalNotes.length > 1000) {
        toast.error('Notas pessoais não podem exceder 1000 caracteres');
        return;
      }

      if (onSubmit) {
        const finalFormData = {
          ...formData,
          mediaType: 'series',
          releaseYear: formData.releaseYear || null,
          userRating: formData.userRating || null,
          personalNotes: formData.personalNotes || '',
          genres: selectedGenres,
          seasons: seasonInfo?.seasons || null,
          episodes: seasonInfo?.episodes || null,
          episodesPerSeason: seasonInfo?.episodesPerSeason || [],
          progress: {
            seasons: formData.progress?.seasons || 1,
            episodes: formData.progress?.episodes || 0,
            lastUpdated: new Date()
          },
        };

        if (isEditMode && initialData && initialData._id) {
          finalFormData.userMediaId = initialData._id;
        }

        if (externalData && !isEditMode) {
          finalFormData.sourceId = externalData.id?.toString();
          finalFormData.sourceApi = 'tmdb';
          finalFormData.title = externalData.title || finalFormData.title;
          finalFormData.description = externalData.description || finalFormData.description;
          finalFormData.coverImage = externalData.coverImage || finalFormData.coverImage;
          finalFormData.apiRating = apiRatingData?.rawRating || externalData.apiRating;
          finalFormData.apiVoteCount = apiRatingData?.voteCount || externalData.apiVoteCount;

          if (!finalFormData.releaseYear && externalData.releaseYear) {
            finalFormData.releaseYear = externalData.releaseYear;
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
      toast.error('Erro ao salvar série');
    }
  };

  return (
    <>
      <form onSubmit={(e) => onSubmitForm(e, handleSubmit(onSubmitForm))} className="space-y-8">
        {hasExternalData && (
          <div className={cn("glass border rounded-xl p-6 space-y-4", "border-purple-500/30")}>
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", mediaColor)}>
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {externalData.title}
                </h3>
                <p className="text-sm text-white/60">Dados importados do TMDB</p>
              </div>
            </div>

            {loadingSeasons ? (
              <div className="text-center py-4">
                <p className="text-white/60">Carregando informações das temporadas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {/* Nota (agora primeiro) */}
                {apiRatingData ? (
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <div>
                      <span className="text-white/80">Nota:</span>
                      <div className="font-medium text-white">
                        {apiRatingData.rating}/5
                      </div>
                      <div className="text-xs text-white/60">
                        ({apiRatingData.voteCount.toLocaleString()} votos)
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Temporada (segundo) */}
                {seasonInfo && (
                  <button
                    type="button"
                    onClick={() => setShowSeasonsModal(true)}
                    className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <div>
                        <span className="text-white/80">Temporadas:</span>
                        <div className="font-medium text-white flex items-center gap-1">
                          {seasonInfo.seasons}
                          <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/40 ml-auto flex-shrink-0" />
                  </button>
                )}

                {/* Episódios (terceiro) */}
                {seasonInfo && (
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    <PlayCircle className="w-4 h-4 text-green-400" />
                    <div>
                      <span className="text-white/80">Episódios:</span>
                      <div className="font-medium text-white">
                        {seasonInfo.episodes}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ano (quarto) */}
                {externalData?.releaseYear && (
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
              </div>
            )}
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
                {/* Gêneros normais (cores roxas para séries) */}
                {externalData.genres.slice(0, 5).map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                     text-purple-300 text-sm font-medium rounded-lg border border-purple-500/30 
                     hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
                  >
                    {typeof genre === 'object' ? genre.name : genre}
                  </span>
                ))}

                {/* Mostra contador se houver mais gêneros */}
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
                placeholder="Título da série"
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
                placeholder="2020"
                variant="glass"
                min={1800}
                max={new Date().getFullYear() + 5}
              />

              <Input
                label="URL da Imagem"
                {...register('coverImage')}
                error={errors.coverImage?.message}
                placeholder="https://exemplo.com/imagem.jpg"
                variant="glass"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Sinopse
              </label>
              <TextArea
                {...register('description')}
                placeholder="Descreva a série..."
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
                    key={genre}
                    type="button"
                    onClick={() => handleGenreToggle(genre)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover-lift",
                      selectedGenres.includes(genre)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white/5 text-white/80 hover:bg-white/10'
                    )}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              {/* Mensagem de erro para validação do schema */}
              {errors.genres && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  {errors.genres.message}
                </p>
              )}

              {/* Mensagem condicional apenas se não for criação manual */}
              {selectedGenres.length === 0 && !isManualEntry && (
                <p className="mt-2 text-sm text-amber-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                  Selecione pelo menos um gênero
                </p>
              )}

              {/* Mensagem para criação manual informando que é opcional */}
              {selectedGenres.length === 0 && isManualEntry && (
                <p className="mt-2 text-sm text-purple-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  Gêneros são opcionais para criação manual
                </p>
              )}
            </div>
          </div>
        )}

        <div className="glass border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {hasExternalData ? 'Sua experiência' : 'Sua avaliação'}
              </h3>
              <p className="text-sm text-white/60">Como você avalia esta série?</p>
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

        {/* SEÇÃO DE PROGRESSO DA SÉRIE - SEMELHANTE AO MANGAFORM */}
        {showProgressFields && (
          <div className={cn(
            "glass border border-white/10 rounded-xl p-6 space-y-4",
            "border-l-4 border-purple-500/30"
          )}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <PlayCircle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Progresso da Série</h3>
                <p className="text-sm text-white/60">
                  Em qual temporada e episódio você está?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Temporada Atual:"
                  type="number"
                  icon={Layers}
                  {...register('progress.seasons', {
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      if (value === '' || value === null || value === undefined) {
                        return 1;
                      }
                      const numValue = Number(value);

                      // Usar initialData primeiro (modo edição)
                      const maxSeasons = initialData?.seasons || seasonInfo?.seasons;
                      if (maxSeasons && numValue > maxSeasons) {
                        return maxSeasons;
                      }

                      // Não permite menor que 1
                      if (numValue < 1) {
                        return 1;
                      }

                      return numValue;
                    },
                    validate: validateCurrentSeason
                  })}
                  error={errors.progress?.seasons?.message}
                  placeholder={`1${(initialData?.seasons || seasonInfo?.seasons) ? ` (máx: ${initialData?.seasons || seasonInfo?.seasons})` : ''}`}
                  variant="glass"
                  min={1}
                  max={initialData?.seasons || seasonInfo?.seasons || undefined}
                  step={1}
                />

                {seasonInfo?.seasons && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span className="text-white/60">
                      Total: <span className="font-medium text-white">{seasonInfo.seasons}</span> temporadas
                    </span>
                  </div>
                )}
              </div>

              <div>
                {(() => {
                  const currentSeasonValue = watch('progress.seasons') || 1;

                  // Tentar usar initialData primeiro (modo edição)
                  const episodesInSeason = initialData?.episodesPerSeason &&
                    initialData.episodesPerSeason.length >= currentSeasonValue
                    ? initialData.episodesPerSeason[currentSeasonValue - 1]
                    : null;

                  // Fallback para seasonInfo (modo criação)
                  const episodesInSeasonFromInfo = seasonInfo?.episodesPerSeason &&
                    seasonInfo.episodesPerSeason.length >= currentSeasonValue
                    ? seasonInfo.episodesPerSeason[currentSeasonValue - 1]
                    : null;

                  const finalEpisodesInSeason = episodesInSeason || episodesInSeasonFromInfo;
                  const totalEpisodes = initialData?.episodes || seasonInfo?.episodes;

                  return (
                    <Input
                      label="Episódio Atual:"
                      type="number"
                      icon={PlayCircle}
                      {...register('progress.episodes', {
                        valueAsNumber: true,
                        setValueAs: (value) => {
                          if (value === '' || value === null || value === undefined) {
                            return 0; // Retorna 0 em vez de 1
                          }
                          const numValue = Number(value);
                          const currentSeasonValue = watch('progress.seasons') || 1;

                          // Permite valores de 0 até o máximo
                          const minValue = 0; // Permite 0

                          // Usar initialData primeiro
                          if (initialData?.episodesPerSeason &&
                            initialData.episodesPerSeason.length >= currentSeasonValue) {
                            const maxEpisodes = initialData.episodesPerSeason[currentSeasonValue - 1];
                            if (numValue > maxEpisodes) {
                              return maxEpisodes;
                            }
                          }
                          // Fallback para seasonInfo
                          else if (seasonInfo?.episodesPerSeason &&
                            seasonInfo.episodesPerSeason.length >= currentSeasonValue) {
                            const maxEpisodes = seasonInfo.episodesPerSeason[currentSeasonValue - 1];
                            if (numValue > maxEpisodes) {
                              return maxEpisodes;
                            }
                          }
                          // Fallback: limita pelo total geral
                          else {
                            const totalEpisodes = initialData?.episodes || seasonInfo?.episodes;
                            if (totalEpisodes && numValue > totalEpisodes) {
                              return totalEpisodes;
                            }
                          }

                          // Não permite menor que 0 (permite 0!)
                          if (numValue < 0) {
                            return 0;
                          }

                          return numValue;
                        },
                        validate: (value) => validateCurrentEpisode(value, watch('progress.seasons'))
                      })}
                      error={errors.progress?.episodes?.message}
                      placeholder={`0${finalEpisodesInSeason ? ` (máx: ${finalEpisodesInSeason})` : totalEpisodes ? ` (máx: ${totalEpisodes})` : ''}`}
                      variant="glass"
                      min={0}
                      max={finalEpisodesInSeason || totalEpisodes || undefined}
                      step={1}
                    />
                  );
                })()}

                {(() => {
                  const currentSeasonValue = watch('progress.seasons') || 1;

                  // Priorizar dados de initialData (modo edição)
                  const episodesInSeason = initialData?.episodesPerSeason &&
                    initialData.episodesPerSeason.length >= currentSeasonValue
                    ? initialData.episodesPerSeason[currentSeasonValue - 1]
                    : null;

                  const episodesInSeasonFromInfo = seasonInfo?.episodesPerSeason &&
                    seasonInfo.episodesPerSeason.length >= currentSeasonValue
                    ? seasonInfo.episodesPerSeason[currentSeasonValue - 1]
                    : null;

                  const finalEpisodesInSeason = episodesInSeason || episodesInSeasonFromInfo;
                  const totalEpisodes = initialData?.episodes || seasonInfo?.episodes;

                  if (finalEpisodesInSeason) {
                    return (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                        <span className="text-white/60">
                          {currentSeasonValue}ª temporada: <span className="font-medium text-white">{finalEpisodesInSeason}</span> episódios
                        </span>
                      </div>
                    );
                  } else if (totalEpisodes) {
                    return (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                        <span className="text-white/60">
                          Total: <span className="font-medium text-white">{totalEpisodes}</span> episódios
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
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
            disabled={loading || !canSubmit}
            className="min-w-[100px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initialData ? 'Atualizar' : hasExternalData ? 'Adicionar à minha lista' : 'Criar'}
          </Button>
        </div>
      </form>
      <Modal
        isOpen={showSeasonsModal}
        onClose={() => setShowSeasonsModal(false)}
        title={`${externalData?.title} - Detalhes das Temporadas`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-sm text-white/60">Total de Temporadas</div>
              <div className="text-2xl font-bold text-purple-400">
                {seasonInfo?.seasons}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-sm text-white/60">Total de Episódios</div>
              <div className="text-2xl font-bold text-green-400">
                {seasonInfo?.episodes}
              </div>
            </div>
          </div>

          {/* Lista de Temporadas */}
          {seasonInfo?.episodesPerSeason && seasonInfo.episodesPerSeason.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Episódios por Temporada</h3>
              <div className="space-y-3">
                {seasonInfo.episodesPerSeason.map((episodes, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <span className="font-bold text-white">T{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-white">Temporada {index + 1}</div>
                        <div className="text-sm text-white/60">
                          {episodes} episódio{episodes !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default SeriesForm;