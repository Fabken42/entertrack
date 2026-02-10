// components/media/forms/MovieForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, TextArea } from '@/components/ui';
import { Film, Clock, Star, Calendar, TrendingUp, ChevronDown, ChevronUp, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, convertFromMinutes, convertToMinutes, formatApiRating, formatRuntime } from '@/lib/utils/general-utils';
import { statusColors } from '@/constants';
import { ratingLabels } from '@/constants';
import { getMediaColor, formatReleasePeriod } from '@/lib/utils/media-utils';
import { movieSchema } from '@/lib/schemas/movie-schema';
import { TMDBClient } from '@/lib/api/tmdb';

const MovieForm = (props) => {
  const {
    initialData,
    externalData,
    manualCreateQuery,
    onCancel,
    loading = false,
    onSubmit,
  } = props;

  console.log(props)

  const mediaColor = getMediaColor('movie');

  // 🔥 NOVO: Estado para controlar se a seção de informações está expandida
  const [isInfoExpanded, setIsInfoExpanded] = React.useState(() => {
    // Se tem externalData (abriu da página de descoberta), começa expandido
    // Se só tem initialData (abriu de /movie), começa recolhido
    return !!externalData && !initialData;
  });

  const runtime = React.useMemo(() => {
    if (initialData?.runtime) {
      return initialData.runtime;
    }
    if (initialData?.mediaCacheId?.essentialData?.runtime) {
      return initialData.mediaCacheId.essentialData.runtime;
    }
    if (externalData?.runtime) {
      return externalData.runtime;
    }
    return null;
  }, [initialData, externalData]);

  const totalMinutes = React.useMemo(() => {
    if (runtime) {
      return runtime;
    }
    return null;
  }, [runtime]);

  const availableGenres = React.useMemo(() => {
    try {
      const genres = TMDBClient.getAllGenres();
      return genres || [];
    } catch (error) {
      console.error('Erro ao carregar gêneros:', error);
      return [];
    }
  }, []);

  // 🔥 NOVO: Obter dados de exibição (combinando initialData e externalData)
  const getDisplayData = () => {
    // Prioriza externalData para informações da API
    if (externalData) {
      return {
        title: externalData.title,
        description: externalData.description,
        coverImage: externalData.coverImage,
        averageRating: externalData.averageRating,
        ratingCount: externalData.ratingCount,
        popularity: externalData.popularity,
        releasePeriod: externalData.releasePeriod,
        runtime: externalData.runtime,
        genres: externalData.genres,
        source: 'external'
      };
    }

    // Se não tem externalData mas tem initialData (modo edição)
    if (initialData) {
      return {
        title: initialData.title,
        description: initialData.description,
        coverImage: initialData.coverImage,
        averageRating: initialData.averageRating,
        ratingCount: initialData.ratingCount,
        popularity: initialData.popularity,
        releasePeriod: initialData.releasePeriod,
        runtime: initialData.runtime,
        genres: initialData.genres,
        source: 'initial'
      };
    }

    return null;
  };

  const displayData = getDisplayData();
  const hasDisplayData = !!displayData;
  const isExternalData = displayData?.source === 'external';

  // Preparar dados de rating da API para exibição
  const apiRatingData = React.useMemo(() => {
    if (displayData) {
      // Verifica múltiplas fontes possíveis para rating e votos
      const rating = displayData.averageRating;
      const voteCount = displayData.ratingCount;

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
  }, [displayData]);

  const getInitialGenres = () => {
    // Para initialData (dados existentes - modo edição)
    if (initialData?.genres) {
      if (Array.isArray(initialData.genres) && initialData.genres.length > 0) {
        // Remove propriedades extras que não estão no schema (como _id)
        return initialData.genres.map(genre => ({
          id: genre.id,
          name: genre.name
        }));
      }
    }

    // Para externalData (dados da API TMDB)
    if (externalData?.genres) {
      if (Array.isArray(externalData.genres)) {
        return externalData.genres.map(g => {
          if (typeof g === 'object') {
            return {
              id: g.id || 0,
              name: g.name
            };
          }
          return { id: 'unknown', name: 'Desconhecido' };
        });
      }
    }

    return [];
  };

  const getInitialProgress = () => {
    // Primeiro tenta currentMinutes (nova estrutura)
    if (initialData?.progress?.currentMinutes || initialData?.progress?.currentMinutes === 0) {
      return convertFromMinutes(initialData.progress.currentMinutes);
    }
    if (initialData?.progress?.minutes || initialData?.progress?.minutes === 0) {
      return convertFromMinutes(initialData.progress.minutes);
    }
    return { hours: 0, minutes: 0 };
  };

  // Função auxiliar para extrair releasePeriod dos dados
  const extractReleasePeriodFromData = (data) => {
    if (!data) return null;

    // Primeiro tenta obter releasePeriod direto
    if (data.releasePeriod) {
      return data.releasePeriod;
    }

    return null;
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
  const [currentProgress, setCurrentProgress] = React.useState(getInitialProgress());

  const isEditMode = !!initialData;
  const hasExternalData = !!externalData;
  const isManualEntry = !hasExternalData && !isEditMode;

  const getDefaultValues = () => {
    const defaultValues = {
      status: 'planned',
      genres: getInitialGenres(),
      userRating: null,
      personalNotes: '',
      coverImage: '',
      description: '',
      releasePeriod: null,
      runtime: '',
    };

    if (initialData) {
      let runtimeFromData = initialData.runtime || initialData.mediaCacheId?.essentialData?.runtime || '';

      // Extrai releasePeriod dos dados iniciais
      const initialReleasePeriod = extractReleasePeriodFromData(initialData) ||
        extractReleasePeriodFromData(initialData?.mediaCacheId?.essentialData);

      const progress = getInitialProgress();

      return {
        ...defaultValues,
        title: initialData.title || '',
        description: initialData.description || '',
        releasePeriod: initialReleasePeriod,
        genres: getInitialGenres(),
        userRating: initialData.userRating || null,
        personalNotes: initialData.personalNotes || '',
        coverImage: initialData.coverImage || '',
        status: initialData.status || 'planned',
        runtime: runtimeFromData,
        progress: {
          hours: progress.hours,
          minutes: progress.minutes
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
        releasePeriod: externalReleasePeriod,
        genres: getInitialGenres(),
        status: 'planned',
        coverImage: externalData.coverImage || '',
        runtime: externalData.runtime || '',
        progress: { hours: 0, minutes: 0 },
        userRating: null,
      };
    }

    if (manualCreateQuery) {
      return {
        ...defaultValues,
        title: manualCreateQuery || '',
        status: 'planned',
        runtime: '',
        progress: { hours: 0, minutes: 0 },
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
    resolver: zodResolver(movieSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange',
  });

  const currentStatus = watch('status');
  const showRatingAndComment = currentStatus === 'completed' || currentStatus === 'dropped';
  const showProgressFields = currentStatus === 'in_progress' || currentStatus === 'dropped';

  // Observar campos de progresso
  const currentHours = watch('progress.hours') || 0;
  const currentMinutes = watch('progress.minutes') || 0;

  React.useEffect(() => {
    setValue('genres', selectedGenres, { shouldValidate: true });
  }, [selectedGenres, setValue]);

  React.useEffect(() => {
    if (initialData) {
      const values = getDefaultValues();
      Object.keys(values).forEach(key => {
        if (key === 'progress') {
          setValue('progress.hours', values.progress.hours);
          setValue('progress.minutes', values.progress.minutes);
        } else if (key === 'runtime' || key === 'releasePeriod') {
          setValue(key, values[key]);
        } else {
          setValue(key, values[key]);
        }
      });
    }
  }, [initialData, setValue]);

  // Atualizar runtime quando mudar no formulário manual
  const runtimeFromForm = watch('runtime');

  // Atualizar progresso local quando os valores mudarem
  React.useEffect(() => {
    setCurrentProgress({
      hours: currentHours,
      minutes: currentMinutes
    });
  }, [currentHours, currentMinutes]);

  const handleGenreToggle = (genre) => {
    // Não permitir alterar gêneros em dados importados do TMDB (apenas criação)
    if (hasExternalData && !isEditMode) return;

    const genreId = genre.id || genre;
    const isCurrentlySelected = selectedGenres.some(g => {
      const gId = g.id || g;
      return gId === genreId;
    });

    let newGenres;

    if (isCurrentlySelected) {
      newGenres = selectedGenres.filter(g => {
        const gId = g.id || g;
        return gId !== genreId;
      });
    } else {
      // Adiciona objeto completo mantendo estrutura consistente
      newGenres = [...selectedGenres, typeof genre === 'object' ? genre : { id: genre, name: genre }];
    }

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

  // Função para atualizar progresso com validação
  const handleProgressChange = (field, value) => {
    const numValue = value === '' ? 0 : parseInt(value, 10) || 0;

    let newHours = currentProgress.hours;
    let newMinutes = currentProgress.minutes;

    if (field === 'hours') {
      newHours = numValue;
    } else if (field === 'minutes') {
      newMinutes = numValue > 59 ? 59 : numValue;
    }

    // Se tiver duração total, validar
    const maxMinutes = totalMinutes || runtimeFromForm;
    if (maxMinutes) {
      const newTotalMinutes = (newHours * 60) + newMinutes;

      if (newTotalMinutes > maxMinutes) {
        // Ajustar automaticamente para o máximo
        const maxHours = Math.floor(maxMinutes / 60);
        const maxMins = maxMinutes % 60;

        if (field === 'hours') {
          newHours = maxHours;
          newMinutes = Math.min(newMinutes, maxMins);
        } else if (field === 'minutes') {
          // Se ajustando minutos, também verificar horas
          const currentTotal = (newHours * 60) + newMinutes;
          if (currentTotal > maxMinutes) {
            newHours = Math.floor(maxMinutes / 60);
            newMinutes = maxMinutes % 60;
          }
        }
      }
    }

    // Atualizar os valores
    setValue('progress.hours', newHours, { shouldValidate: true });
    setValue('progress.minutes', newMinutes, { shouldValidate: true });
    setCurrentProgress({ hours: newHours, minutes: newMinutes });
  };

  const onSubmitForm = async (formData) => {
    try {
      // Verifica se pode submeter (limite de caracteres)
      if (!canSubmit) {
        toast.error('Notas pessoais não podem exceder 1000 caracteres');
        return;
      }

      // Validação do progresso contra o runtime
      const currentHoursVal = watch('progress.hours') || 0;
      const currentMinutesVal = watch('progress.minutes') || 0;

      // Valida o formulário
      const isValid = await trigger();

      if (!isValid) {
        toast.error('Por favor, corrija os erros no formulário');
        return;
      }

      // Converter horas/minutos para minutos totais
      const totalMinutesWatched = convertToMinutes(currentHoursVal, currentMinutesVal);

      const finalFormData = {
        ...formData,
        mediaType: 'movie',
        releasePeriod: formData.releasePeriod || null,
        userRating: formData.userRating || null,
        personalNotes: formData.personalNotes || '',
        genres: selectedGenres,
        runtime: formData.runtime || null,
        // Sempre enviar progresso em minutos
        progress: {
          minutes: totalMinutesWatched,
          currentMinutes: totalMinutesWatched,
          lastUpdated: new Date()
        }
      };

      // Se for completed e tem runtime definido, marcar como assistido completamente
      if (formData.status === 'completed' && formData.runtime) {
        finalFormData.progress.minutes = formData.runtime;
      }

      if (isEditMode && initialData?._id) {
        finalFormData.userMediaId = initialData._id;
      }

      if (externalData && !isEditMode) {
        finalFormData.sourceId = externalData.sourceId?.toString();
        finalFormData.sourceApi = 'tmdb';
        finalFormData.title = externalData.title || finalFormData.title;
        finalFormData.description = externalData.description || finalFormData.description;
        finalFormData.coverImage = externalData.coverImage || finalFormData.coverImage;
        finalFormData.averageRating = apiRatingData?.rawRating || externalData.averageRating;
        finalFormData.ratingCount = apiRatingData?.voteCount || externalData.ratingCount;
        finalFormData.runtime = externalData.runtime || formData.runtime;

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

      if (onSubmit) {
        await onSubmit(finalFormData);
      }
    } catch (error) {
      console.error('❌ Erro no onSubmitForm:', error);
      toast.error('Erro ao salvar filme');
    }
  };

  // Calcular minutos totais assistidos
  const totalMinutesWatched = React.useMemo(() => {
    return convertToMinutes(currentProgress.hours, currentProgress.minutes);
  }, [currentProgress]);

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
      {/* 🔥 ATUALIZADO: Seção de informações básicas agora recolhível */}
      {hasDisplayData && (
        <div className={cn("glass border rounded-xl overflow-hidden transition-all duration-300", "border-blue-500/30")}>
          {/* Cabeçalho recolhível */}
          <button
            type="button"
            onClick={() => setIsInfoExpanded(!isInfoExpanded)}
            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
          > 
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", mediaColor)}>
                <Film className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">
                  {displayData.title}
                </h3>
                <p className="text-sm text-white/60">
                  {isExternalData ? 'Dados importados do TMDB' : 'Informações do filme'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">
                {isInfoExpanded ? 'Recolher' : 'Expandir'}
              </span>
              {isInfoExpanded ? (
                <ChevronUp className="w-5 h-5 text-white/60" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/60" />
              )}
            </div>
          </button>

          {/* Conteúdo da seção - só mostra se expandido */}
          {isInfoExpanded && (
            <div className="px-6 pb-6 space-y-6">
              {/* Grid de informações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* Nota - verifica se existe e é maior que 0 */}
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

                {/* Duração - verifica se existe e é maior que 0 */}
                {displayData.runtime != null && displayData.runtime > 0 ? (
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="text-white/80">Duração:</span>
                      <div className="font-medium text-white">{formatRuntime(displayData.runtime)}</div>
                    </div>
                  </div>
                ) : null}

                {/* Popularidade - verifica se existe e é maior que 0 */}
                {displayData.popularity != null && displayData.popularity > 0 ? (
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <div>
                      <span className="text-white/80">Popularidade:</span>
                      <div className="font-medium text-white">{displayData.popularity.toFixed(1)}</div>
                    </div>
                  </div>
                ) : null}

                {/* Período de lançamento - verifica se existe */}
                {displayData.releasePeriod ? (
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    <Calendar className="w-4 h-4 text-white/60" />
                    <div>
                      <span className="text-white/80">Lançamento:</span>
                      <div className="font-medium text-white">
                        {formatReleasePeriod(displayData.releasePeriod)}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Imagem com tags de gêneros */}
              {displayData.coverImage && (
                <div className="flex flex-col items-center">
                  <div className="rounded-xl overflow-hidden border glass w-48 h-64 relative">
                    <img
                      src={displayData.coverImage}
                      alt={displayData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {displayData.genres && displayData.genres.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-md">
                      {/* Gêneros normais (cores azuis) */}
                      {displayData.genres.slice(0, 5).map((genre, index) => (
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
                      {displayData.genres.length > 5 && (
                        <span className="px-3 py-1.5 bg-white/10 text-white/60 text-sm font-medium rounded-lg">
                          +{displayData.genres.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Sinopse */}
              {displayData?.description && (
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
                        {displayData.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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
              min={1900}
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
              label="Duração (minutos) *"
              type="number"
              icon={Clock}
              {...register('runtime', {
                valueAsNumber: true,
                required: "Duração é obrigatória",
                min: {
                  value: 1,
                  message: "Duração mínima de 1 minuto"
                }
              })}
              error={errors.runtime?.message}
              placeholder="120"
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
              placeholder="Descreva o filme..."
              variant="glass"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Gêneros
            </label>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover-lift",
                    selectedGenres.some(g => {
                      const gId = g.id || g;
                      const genreId = genre.id || genre;
                      return gId === genreId;
                    })
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  )}
                >
                  {typeof genre === 'object' ? genre.name : genre}
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

            {/* Mensagem informativa para todos os modos (genres é opcional) */}
            {selectedGenres.length === 0 && (
              <p className="mt-2 text-sm text-blue-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                Gêneros são opcionais
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
              {hasDisplayData ? 'Sua experiência' : 'Sua avaliação'}
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
          "border-l-4 border-blue-500/30"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <div className={cn("p-2 rounded-lg", mediaColor)}>
                <PlayCircle className="w-5 h-5" />
              </div>
            <div>
              <h3 className="font-semibold text-white">Progresso do Filme</h3>
              <p className="text-sm text-white/60">
                Quanto tempo você já assistiu?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Horas:
              </label>
              <input
                type="number"
                value={currentProgress.hours}
                onChange={(e) => handleProgressChange('hours', e.target.value)}
                onBlur={(e) => {
                  const maxMinutes = totalMinutes || runtimeFromForm;
                  if (maxMinutes) {
                    const maxHours = Math.floor(maxMinutes / 60);
                    if (currentProgress.hours > maxHours) {
                      handleProgressChange('hours', maxHours);
                      toast.error(`Horas máximas: ${maxHours} (baseado na duração total)`);
                    }
                  }
                }}
                min={0}
                max={totalMinutes ? Math.floor(totalMinutes / 60) : 10}
                step={1}
                className={`w-full bg-gray-900 border ${errors.progress?.hours?.message ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
                placeholder={`0${totalMinutes ? ` (máx: ${Math.floor(totalMinutes / 60)})` : ''}`}
              />
              {errors.progress?.hours?.message && (
                <p className="mt-1 text-sm text-red-400">{errors.progress.hours.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Minutos:
              </label>
              <input
                type="number"
                value={currentProgress.minutes}
                onChange={(e) => handleProgressChange('minutes', e.target.value)}
                onBlur={(e) => {
                  const maxMinutes = totalMinutes || runtimeFromForm;
                  if (maxMinutes) {
                    const currentTotal = (currentProgress.hours * 60) + currentProgress.minutes;
                    if (currentTotal > maxMinutes) {
                      const maxHours = Math.floor(maxMinutes / 60);
                      const maxMins = maxMinutes % 60;
                      handleProgressChange('hours', maxHours);
                      handleProgressChange('minutes', maxMins);
                    }
                  }

                  // Validar minutos individuais
                  if (currentProgress.minutes > 59) {
                    handleProgressChange('minutes', 59);
                  }
                }}
                min={0}
                max={59}
                step={1}
                className={`w-full bg-gray-900 border ${errors.progress?.minutes?.message ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
                placeholder="0 (máx: 59)"
              />
              {errors.progress?.minutes?.message && (
                <p className="mt-1 text-sm text-red-400">{errors.progress.minutes.message}</p>
              )}
            </div>
          </div>

          {/* Mensagens informativas */}
          <div className="space-y-2 mt-4">
            {(totalMinutes || runtimeFromForm) && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span className="text-white/60">
                  Duração total: <span className="font-medium text-white">{formatRuntime(totalMinutes || runtimeFromForm)}</span>
                  {' '}({totalMinutes || runtimeFromForm} minutos)
                </span>
              </div>
            )}

            {/* Dica quando o usuário atingir o máximo */}
            {(totalMinutes || runtimeFromForm) &&
              totalMinutesWatched >= (totalMinutes || runtimeFromForm) && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">
                    Você completou o filme! Mude o status para "Concluído"
                  </span>
                </div>
              )}
          </div>

          {/* Barra de progresso visual */}
          {(totalMinutes || runtimeFromForm) && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">Progresso:</span>
                <span className="text-white font-medium">
                  {totalMinutesWatched}/{totalMinutes || runtimeFromForm} minutos
                  ({totalMinutes || runtimeFromForm ?
                    Math.round((totalMinutesWatched / (totalMinutes || runtimeFromForm)) * 100) : 0}%)
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                  style={{
                    width: `${(totalMinutes || runtimeFromForm) ?
                      Math.min((totalMinutesWatched / (totalMinutes || runtimeFromForm)) * 100, 100) : 0}%`
                  }}
                />
              </div>
            </div>
          )}
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
          {initialData ? 'Atualizar' : hasDisplayData ? 'Adicionar à minha lista' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};

export default MovieForm;