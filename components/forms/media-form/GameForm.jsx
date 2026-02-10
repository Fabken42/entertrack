// components/media/forms/GameForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, TextArea, Modal } from '@/components/ui';
import { Gamepad, Star, Calendar, TrendingUp, Layers, Info, Clock, ChevronDown, ChevronUp, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatApiRating } from '@/lib/utils/general-utils';
import { statusColors } from '@/constants';
import { ratingLabels } from '@/constants';
import { getMediaColor, formatReleasePeriod } from '@/lib/utils/media-utils';
import { gameSchema } from '@/lib/schemas/game-schema';
import { RAWGClient } from '@/lib/api/rawg';

const GameForm = (props) => {
  const {
    initialData,
    externalData,
    manualCreateQuery,
    onCancel,
    loading = false,
    onSubmit,
  } = props;

  console.log(props)

  // Usando função utilitária para cores
  const mediaColor = getMediaColor('game');

  // 🔥 NOVO: Estado para controlar se a seção de informações está expandida
  const [isInfoExpanded, setIsInfoExpanded] = React.useState(() => {
    // Se tem externalData (abriu da página de descoberta), começa expandido
    // Se só tem initialData (abriu de /game), começa recolhido
    return !!externalData && !initialData;
  });

  // Obter todos os gêneros do RAWG
  const availableGenres = React.useMemo(() => {
    try {
      const genres = RAWGClient.getAllGenres();
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
        rating: externalData.rating,
        ratingCount: externalData.ratingCount,
        metacritic: externalData.metacritic,
        playtime: externalData.playtime,
        releasePeriod: externalData.releasePeriod,
        platforms: externalData.platforms,
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
        rating: initialData.rating,
        ratingCount: initialData.ratingCount,
        metacritic: initialData.metacritic,
        playtime: initialData.playtime,
        releasePeriod: initialData.releasePeriod,
        platforms: initialData.platforms,
        genres: initialData.genres,
        source: 'initial'
      };
    }

    return null;
  };

  const displayData = getDisplayData();
  const hasDisplayData = !!displayData;
  const isExternalData = displayData?.source === 'external';

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

    // Para externalData (dados da API RAWG)
    if (externalData?.genres) {
      if (Array.isArray(externalData.genres)) {
        return externalData.genres.map(g => {
          if (typeof g === 'object' && (g.id || g.name)) {
            return {
              id: g.id || 0,
              name: g.name || 'Desconhecido'
            };
          }
          return { id: 'unknown', name: 'Desconhecido' };
        });
      }
    }

    return [];
  };

  // Estado local
  const [selectedGenres, setSelectedGenres] = React.useState([]);
  const [selectedRating, setSelectedRating] = React.useState(
    initialData?.userRating || null
  );
  const [charCount, setCharCount] = React.useState(
    initialData?.personalNotes?.length || 0
  );
  const [canSubmit, setCanSubmit] = React.useState(true);
  const [showPlatformsModal, setShowPlatformsModal] = React.useState(false);
  const [tasks, setTasks] = React.useState(
    initialData?.progress?.tasks || []
  );

  const isEditMode = !!initialData;
  const hasExternalData = !!externalData;
  const isManualEntry = !hasExternalData && !isEditMode;

  // Função para validar horas de jogo
  const validateHours = (value) => {
    if (value === '' || value === undefined || value === null) {
      return true; // Permite campo vazio
    }

    const numValue = Number(value);

    // Não pode ser negativo
    if (numValue < 0) {
      return 'Horas de jogo não podem ser negativas';
    }

    // Limite razoável (10,000 horas)
    if (numValue > 10000) {
      return 'Horas de jogo não podem exceder 10,000';
    }

    return true;
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

  // Adicione useEffect para inicializar quando availableGenres estiver pronto
  React.useEffect(() => {
    if (availableGenres.length > 0) {
      const initialGenres = getInitialGenres();
      setSelectedGenres(initialGenres);
      setValue('genres', initialGenres, { shouldValidate: true });
    }
  }, [availableGenres]);

  const getDefaultValues = () => {
    const defaultValues = {
      status: 'planned',
      genres: getInitialGenres(),
      progress: {
        hours: 0,
        tasks: []
      },
      userRating: null,
      personalNotes: '',
      coverImage: '',
      description: '',
      releasePeriod: null,
      metacritic: undefined,
      playtime: undefined,
      platforms: [],
    };

    if (initialData) {
      // Extrai releasePeriod dos dados iniciais
      const initialReleasePeriod = extractReleasePeriodFromData(initialData) ||
        extractReleasePeriodFromData(initialData?.mediaCacheId?.essentialData);

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
        metacritic: initialData.metacritic || null,
        playtime: initialData.playtime || null,
        platforms: initialData.platforms || [],
        progress: {
          hours: initialData.hours || initialData.progress?.hours || 0,
          tasks: initialData.progress?.tasks || []
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
        metacritic: externalData.metacritic || null,
        playtime: externalData.playtime || null,
        platforms: externalData.platforms || [],
        progress: {
          hours: 0,
          tasks: []
        },
        userRating: null,
      };
    }

    if (manualCreateQuery) {
      return {
        ...defaultValues,
        title: manualCreateQuery || '',
        status: 'planned',
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
    resolver: zodResolver(gameSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange',
  });

  const currentStatus = watch('status');
  const showRatingAndComment = currentStatus === 'completed' || currentStatus === 'dropped';
  const showProgressFields = currentStatus === 'in_progress' || currentStatus === 'dropped';
  const showPlayHours = currentStatus !== 'planned';

  React.useEffect(() => {
    setValue('genres', selectedGenres, { shouldValidate: true });
  }, [selectedGenres, setValue]);

  React.useEffect(() => {
    setValue('progress.tasks', tasks, { shouldValidate: true });
  }, [tasks, setValue]);

  React.useEffect(() => {
    if (initialData) {
      const values = getDefaultValues();
      Object.keys(values).forEach(key => {
        if (key === 'progress') {
          setValue('progress.hours', values.progress.hours);
          setValue('progress.tasks', values.progress.tasks);
        } else if (key === 'platforms') {
          setValue('platforms', values.platforms || []);
        } else if (key === 'metacritic') {
          setValue('metacritic', values.metacritic);
        } else if (key === 'playtime') {
          setValue('playtime', values.playtime);
        }
        else if (key === 'releasePeriod') {
          setValue('releasePeriod', values.releasePeriod);
        } else {
          setValue(key, values[key]);
        }
      });
    }
  }, [initialData, setValue]);

  const handleGenreToggle = (genre) => {
    // Não permitir alterar gêneros em dados importados do RAWG (apenas criação)
    if (hasExternalData && !isEditMode) return;

    const genreId = genre.id || genre;
    const isCurrentlySelected = selectedGenres?.some(g => {
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
      newGenres = [...(selectedGenres || []), typeof genre === 'object' ? genre : { id: genre, name: genre }];
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

  const addNewTask = () => {
    const newTask = {
      id: Date.now().toString(),
      name: '',
      completed: false
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
  };

  const updateTask = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      [field]: value
    };
    setTasks(updatedTasks);
  };

  const removeTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  const onSubmitForm = async (formData) => {
    try {
      // Verifica se pode submeter (limite de caracteres)
      if (!canSubmit) {
        toast.error('Notas pessoais não podem exceder 1000 caracteres');
        return;
      }

      // Valida o formulário
      const isValid = await trigger();

      if (!isValid) {
        console.error('❌ Form validation failed:', errors);
        toast.error('Corrija os erros no formulário');
        return;
      }

      const validTasks = tasks.filter(task => task.name && task.name.trim() !== '');

      if (onSubmit) {
        const finalFormData = {
          ...formData,
          mediaType: 'game',
          userRating: formData.userRating || null,
          personalNotes: formData.personalNotes || '',
          genres: selectedGenres,
          platforms: formData.platforms || [],
          metacritic: formData.metacritic || null,
          playtime: formData.playtime || null,
          progress: {
            hours: formData.progress?.hours || 0,
            tasks: validTasks,
            lastUpdated: new Date()
          }
        };

        // Adiciona informações específicas para cada modo
        if (isEditMode && initialData?._id) {
          finalFormData.userMediaId = initialData._id;
        }

        if (externalData && !isEditMode) {
          finalFormData.sourceId = externalData.sourceId?.toString();
          finalFormData.sourceApi = 'rawg';
          finalFormData.title = externalData.title || finalFormData.title;
          finalFormData.description = externalData.description || finalFormData.description;
          finalFormData.coverImage = externalData.coverImage;
          finalFormData.averageRating = externalData.averageRating;
          finalFormData.ratingCount = externalData.ratingCount;
          finalFormData.metacritic = externalData.metacritic;
          finalFormData.playtime = externalData.playtime;
          finalFormData.platforms = externalData.platforms;

          // Atualizado para releasePeriod
          if (!finalFormData.releasePeriod && externalData.releasePeriod) {
            finalFormData.releasePeriod = externalData.releasePeriod;
          }
        }

        if (isManualEntry) {
          finalFormData.sourceId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          finalFormData.sourceApi = 'manual';
          finalFormData.coverImage = watch('coverImage') || '';
        }

        await onSubmit(finalFormData);
      }
    } catch (error) {
      console.error('❌ Erro no onSubmitForm:', error);
      toast.error('Erro ao processar o formulário');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
        {/* 🔥 ATUALIZADO: Seção de informações básicas agora recolhível */}
        {hasDisplayData && (
          <div className={cn("glass border rounded-xl overflow-hidden transition-all duration-300", "border-orange-500/30")}>
            {/* Cabeçalho recolhível */}
            <button
              type="button"
              onClick={() => setIsInfoExpanded(!isInfoExpanded)}
              className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", mediaColor)}>
                  <Gamepad className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">
                    {displayData.title}
                  </h3>
                  <p className="text-sm text-white/60">
                    {isExternalData ? 'Dados importados do RAWG' : 'Informações do jogo'}
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
                  {((displayData.rating != null && displayData.rating > 0 ||
                    displayData.averageRating != null && displayData.averageRating > 0) &&
                    displayData.ratingCount != null && displayData.ratingCount > 0) ? (
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <div>
                        <span className="text-white/80">Nota:</span>
                        <div className="font-medium text-white">
                          {formatApiRating(displayData.rating || displayData.averageRating, 1)?.display ||
                            (displayData.rating || displayData.averageRating)?.toFixed(1)}/5
                        </div>
                        <div className="text-xs text-white/60">
                          ({displayData.ratingCount.toLocaleString()} avaliações)
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Metacritic - verifica se existe */}
                  {displayData.metacritic != null ? (
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <div>
                        <span className="text-white/80">Metacritic:</span>
                        <div className="font-medium text-white">{displayData.metacritic}/100</div>
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

                  {/* Tempo para concluir o jogo */}
                  {displayData.playtime ? (
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <Clock className="w-4 h-4 text-white/60" />
                      <div>
                        <span className="text-white/80">Duração Média:</span>
                        <div className="font-medium text-white">
                          {displayData.playtime} horas
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Plataformas - verifica se existe e tem pelo menos 1 */}
                  {displayData.platforms && displayData.platforms.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setShowPlatformsModal(true)}
                      className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer group text-left w-full"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Layers className="w-4 h-4 text-orange-400" />
                        <div>
                          <span className="text-white/80">
                            {displayData.platforms.length === 1 ? 'Plataforma:' : 'Plataformas:'}
                          </span>
                          <div className="font-medium text-white flex items-center gap-1">
                            {displayData.platforms.slice(0, 3).join(', ')}
                            {displayData.platforms.length > 3 && '...'}
                            <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-white/40 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
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

                        {displayData.genres.length > 5 && (
                          <span className="px-3 py-1.5 bg-white/10 text-white/60 text-sm font-medium rounded-lg">
                            +{displayData.genres.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Descrição */}
                {displayData?.description && (
                  <div className="glass border border-white/10 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", mediaColor)}>
                        <Gamepad className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-3">
                          Descrição
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
                <Gamepad className="w-5 h-5" />
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
                placeholder="Título do jogo"
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

              <div className="md:col-span-2">
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Gêneros
              </label>
              <div className="flex flex-wrap gap-2">
                {availableGenres.map((genre) => (
                  <button
                    key={genre.id || genre}
                    type="button"
                    onClick={() => handleGenreToggle(genre)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover-lift",
                      selectedGenres?.some(g => {
                        const gId = g.id || g;
                        const genreId = genre.id || genre;
                        return gId === genreId;
                      })
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-white/5 text-white/80 hover:bg-white/10'
                    )}
                  >
                    {genre.name || genre}
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
                <p className="mt-2 text-sm text-orange-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  Gêneros são opcionais
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Descrição
              </label>
              <TextArea
                {...register('description')}
                placeholder="Descreva o jogo..."
                variant="glass"
                rows={4}
              />
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

          {showPlayHours && (
            <div>
              <Input
                label="Horas jogadas:"
                type="number"
                step="1"
                min="0"
                max="9999"
                icon={Clock}
                {...register('progress.hours', {
                  valueAsNumber: true,
                  validate: validateHours,
                  setValueAs: (value) => value === '' ? 0 : Number(value)
                })}
                error={errors.progress?.hours?.message}
                placeholder="Ex: 45"
                variant="glass"
                helpText="Total de horas jogadas neste jogo"
              />
            </div>
          )}

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
            "border-l-4 border-orange-500/30"
          )}>
            <div className="flex items-center gap-2 mb-4">
              <div className={cn("p-2 rounded-lg", mediaColor)}>
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Progresso do Jogo</h3>
                <p className="text-sm text-white/60">
                  Quais objetivos faltam?
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-white">
                  Objetivos Pendentes:
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/60">Progresso:</span>
                  <span className="text-orange-400 font-medium">
                    {tasks.filter(t => t.completed).length}/{tasks.length}
                  </span>
                </div>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-6 px-4 bg-white/5 rounded-lg border border-dashed border-white/10">
                  <Gamepad className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-white/60 text-sm mb-3">Nenhum objetivo adicionado</p>
                  <Button
                    type="button"
                    onClick={addNewTask}
                    variant="outline"
                    size="sm"
                    className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar primeiro objetivo
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
                    {tasks.map((task, index) => (
                      <div key={task.id || index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={(e) => updateTask(index, 'completed', e.target.checked)}
                              className="w-5 h-5 rounded border-white/20 bg-white/10 checked:bg-orange-500 checked:border-orange-500 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer transition-colors"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={task.name}
                              onChange={(e) => updateTask(index, 'name', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  e.currentTarget.blur();
                                }
                              }}
                              placeholder={`Digite o objetivo ${index + 1}`}
                              className="w-full bg-transparent border-none focus:outline-none text-white placeholder:text-white/40 text-sm"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTask(index)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Remover objetivo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={addNewTask}
                    variant="outline"
                    className="w-full border-dashed border-white/20 hover:border-orange-500/50 hover:bg-orange-500/10 text-white/80 hover:text-white"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar Novo Objetivo
                  </Button>
                </>
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
            className="min-w-[100px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initialData ? 'Atualizar' : hasDisplayData ? 'Adicionar à minha lista' : 'Criar'}
          </Button>
        </div>
      </form>

      <Modal
        isOpen={showPlatformsModal}
        onClose={() => setShowPlatformsModal(false)}
        title={`${displayData?.title} - Plataformas Disponíveis`}
        size="md"
      >
        {displayData?.platforms && displayData.platforms.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Todas as Plataformas {displayData?.platforms?.length > 0 ? `(${displayData.platforms.length})` : ''}</h3>
            <div className="space-y-2">
              {displayData.platforms.map((platform, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                      <Gamepad className="w-4 h-4 text-orange-300" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{platform}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default GameForm;