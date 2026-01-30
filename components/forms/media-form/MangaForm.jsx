// /components/forms/media-form/MangaForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, TextArea } from '@/components/ui';
import { BookOpen, Hash, Star, Calendar, Users, TrendingUp, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatApiRating, formatMembers, formatPopularity } from '@/lib/utils/general-utils';
import { statusColors } from '@/constants';
import { ratingLabels } from '@/constants';
import { getMediaColor, formatReleasePeriod } from '@/lib/utils/media-utils';
import { mangaSchema } from '@/lib/schemas/manga-schema';
import { JikanClient } from "@/lib/api/jikan.js";

const MangaForm = (props) => {
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
  const mediaColor = getMediaColor('mangas');

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

  // Calcular totais disponíveis
  const totalVolumes = React.useMemo(() => {
    if (initialData?.volumes) return initialData.volumes;
    if (initialData?.mediaCacheId?.essentialData?.volumes) return initialData.mediaCacheId.essentialData.volumes;
    if (externalData?.volumes) return externalData.volumes;
    return null;
  }, [initialData, externalData]);

  const totalChapters = React.useMemo(() => {
    if (initialData?.chapters) return initialData.chapters;
    if (initialData?.mediaCacheId?.essentialData?.chapters) return initialData.mediaCacheId.essentialData.chapters;
    if (externalData?.chapters) return externalData.chapters;
    return null;
  }, [initialData, externalData]);

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

  const getInitialAuthors = () => {
    if (initialData?.authors) {
      if (Array.isArray(initialData.authors)) {
        return initialData.authors;
      }
      return typeof initialData.authors === 'string' ? [initialData.authors] : [];
    }
    if (externalData?.authors) {
      if (Array.isArray(externalData.authors)) {
        return externalData.authors;
      }
      return typeof externalData.authors === 'string' ? [externalData.authors] : [];
    }
    return [];
  };

  // Estado local
  const [selectedGenres, setSelectedGenres] = React.useState([]);
  const [selectedAuthors, setSelectedAuthors] = React.useState(
    getInitialAuthors()
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

  // Função auxiliar para extrair releasePeriod dos dados
  const extractReleasePeriodFromData = (data) => {
    if (!data) return null;

    // Primeiro tenta obter releasePeriod direto
    if (data.releasePeriod) {
      return data.releasePeriod;
    }

    return null;
  };

  // Funções para validar progresso
  const validateCurrentVolume = (value) => {
    if (value === '' || value === undefined || value === null) {
      return true;
    }

    const numValue = Number(value);

    if (numValue < 1) {
      return 'Volume atual não pode ser menor que 1';
    }

    if (totalVolumes && numValue > totalVolumes) {
      return `Volume atual não pode ser maior que ${totalVolumes}`;
    }

    return true;
  };

  const validateCurrentChapter = (value) => {
    if (value === '' || value === undefined || value === null) {
      return true;
    }

    const numValue = Number(value);

    if (numValue < 0) {
      return 'Capítulos lidos não pode ser negativo';
    }

    if (totalChapters && numValue > totalChapters) {
      return `Capítulos lidos não pode ser maior que ${totalChapters}`;
    }

    return true;
  };

  // Adicione useEffect para inicializar quando availableGenres estiver pronto
  React.useEffect(() => {
    if (availableGenres.length > 0) {
      const initialGenres = getInitialGenres();
      setSelectedGenres(initialGenres);
    }
  }, [availableGenres]);

  const getDefaultValues = () => {
    const defaultValues = {
      status: 'planned',
      genres: getInitialGenres(),
      authors: getInitialAuthors(),
      progress: { currentChapter: 0, currentVolume: 1 },
      userRating: null,
      personalNotes: '',
      coverImage: '',
      description: '',
      releasePeriod: null,
      volumes: '',
      chapters: '',
    };

    if (initialData) {
      let volumesFromData = initialData.volumes || initialData.mediaCacheId?.essentialData?.volumes || '';
      let chaptersFromData = initialData.chapters || initialData.mediaCacheId?.essentialData?.chapters || '';
      let currentVolume = initialData.progress?.currentVolume ||
        initialData.progress?.volumes || 1;
      let currentChapter = initialData.progress?.currentChapter ||
        initialData.progress?.chapters || 0;

      // Extrai releasePeriod dos dados iniciais
      const initialReleasePeriod = extractReleasePeriodFromData(initialData) ||
        extractReleasePeriodFromData(initialData?.mediaCacheId?.essentialData);

      // Garante que os valores não ultrapassem os totais
      if (volumesFromData && currentVolume > volumesFromData) {
        currentVolume = volumesFromData;
      }
      if (chaptersFromData && currentChapter > chaptersFromData) {
        currentChapter = chaptersFromData;
      }

      return {
        ...defaultValues,
        title: initialData.title || '',
        description: initialData.description || '',
        releasePeriod: initialReleasePeriod,
        genres: getInitialGenres(),
        authors: getInitialAuthors(),
        userRating: initialData.userRating || null,
        personalNotes: initialData.personalNotes || '',
        coverImage: initialData.coverImage || '',
        status: initialData.status || 'planned',
        volumes: volumesFromData,
        chapters: chaptersFromData,
        progress: {
          currentChapter: currentChapter,
          currentVolume: currentVolume
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
        authors: getInitialAuthors(),
        status: 'planned',
        coverImage: externalData.coverImage || '',
        volumes: externalData.volumes || '',
        chapters: externalData.chapters || '',
        progress: { currentChapter: 0, currentVolume: 1 },
        userRating: null,
      };
    }

    if (manualCreateQuery) {
      return {
        ...defaultValues,
        title: manualCreateQuery || '',
        status: 'planned',
        volumes: '',
        chapters: '',
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
    resolver: zodResolver(mangaSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange',
  });

  const currentStatus = watch('status');
  const showRatingAndComment = currentStatus === 'completed' || currentStatus === 'dropped';
  const showProgressFields = currentStatus === 'in_progress' || currentStatus === 'dropped';

  // Observar valores atuais para cálculo de progresso
  const currentVolume = watch('progress.currentVolume') || 0;
  const currentChapter = watch('progress.currentChapter') || 0;
  const volumesFromForm = watch('volumes');
  const chaptersFromForm = watch('chapters');

  React.useEffect(() => {
    setValue('genres', selectedGenres, { shouldValidate: true });
  }, [selectedGenres, setValue]);

  React.useEffect(() => {
    setValue('authors', selectedAuthors, { shouldValidate: true });
  }, [selectedAuthors, setValue]);

  React.useEffect(() => {
    if (initialData) {
      const values = getDefaultValues();
      Object.keys(values).forEach(key => {
        if (key === 'progress') {
          setValue('progress.currentChapter', values.progress.currentChapter);
          setValue('progress.currentVolume', values.progress.currentVolume);
        } else if (key === 'volumes' || key === 'chapters' || key === 'releasePeriod') {
          setValue(key, values[key]);
        } else {
          setValue(key, values[key]);
        }
      });
    }
  }, [initialData, setValue]);

  const handleGenreToggle = (genre) => {
    // Não permitir alterar gêneros em dados importados do Jikan (apenas criação)
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

  const handleAuthorChange = (e) => {
    const value = e.target.value;
    const authorsArray = value.split(',').map(author => author.trim()).filter(author => author.length > 0);
    setSelectedAuthors(authorsArray);
  };

  const handleRatingChangeInternal = (rating) => {
    setSelectedRating(rating);
    setValue('userRating', rating, { shouldValidate: true });
  };

  const handlePersonalNotesChange = (e) => {
    const value = e.target.value;
    const count = value.length;

    setCharCount(count);

    if (count > 1000) {
      setCanSubmit(false);
      toast.error('Notas pessoais não podem exceder 1000 caracteres');
    } else {
      setCanSubmit(true);
    }

    setValue('personalNotes', value, { shouldValidate: true });
  };

  const onSubmitForm = async (formData) => {
    try {
      // Verifica se pode submeter (limite de caracteres)
      if (!canSubmit) {
        toast.error('Notas pessoais não podem exceder 1000 caracteres');
        return;
      }

      // Validação dos valores atuais contra os totais
      const currentVolumeValue = watch('progress.currentVolume') || 0;
      const currentChapterValue = watch('progress.currentChapter') || 0;
      const totalVolumesValue = watch('volumes') || totalVolumes;
      const totalChaptersValue = watch('chapters') || totalChapters;

      if (totalVolumesValue && currentVolumeValue > totalVolumesValue) {
        toast.error(`Volume atual (${currentVolumeValue}) não pode ser maior que o total (${totalVolumesValue})`);
        setValue('progress.currentVolume', totalVolumesValue, { shouldValidate: true });
        return;
      }

      if (totalChaptersValue && currentChapterValue > totalChaptersValue) {
        toast.error(`Capítulos lidos (${currentChapterValue}) não pode ser maior que o total (${totalChaptersValue})`);
        setValue('progress.currentChapter', totalChaptersValue, { shouldValidate: true });
        return;
      }

      const isValid = await trigger();

      if (!isValid) {
        console.error('❌ Form validation failed:', errors);
        toast.error('Por favor, corrija os erros no formulário');
        return;
      }

      if (onSubmit) {
        const finalFormData = {
          ...formData,
          mediaType: 'manga',
          releasePeriod: formData.releasePeriod || null,
          userRating: formData.userRating || null,
          personalNotes: formData.personalNotes || '',
          genres: selectedGenres,
          authors: selectedAuthors,
          volumes: formData.volumes || null,
          chapters: formData.chapters || null,
          progress: {
            volumes: formData.progress?.currentVolume || 0,
            chapters: formData.progress?.currentChapter || 0,
            lastUpdated: new Date()
          },
          category: externalData?.category || null,
        };

        if (isEditMode && initialData?._id) {
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
          finalFormData.volumes = externalData.volumes || finalFormData.volumes;
          finalFormData.chapters = externalData.chapters || finalFormData.chapters;
          finalFormData.popularity = externalData.popularity;
          finalFormData.members = externalData.members;

          // Atualizado para releasePeriod
          if (!finalFormData.releasePeriod && externalData.releasePeriod) {
            finalFormData.releasePeriod = externalData.releasePeriod;
          }
          finalFormData.category = externalData.category || null;
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
      toast.error('Erro ao salvar mangá');
    }
  };

  // Calcular porcentagem de progresso
  const calculateProgressPercentage = () => {
    const totalChaptersValue = totalChapters || chaptersFromForm;
    const currentChapterValue = currentChapter || 0;

    if (totalChaptersValue && totalChaptersValue > 0) {
      return Math.round((currentChapterValue / totalChaptersValue) * 100);
    }

    const totalVolumesValue = totalVolumes || volumesFromForm;
    const currentVolumeValue = currentVolume || 0;

    if (totalVolumesValue && totalVolumesValue > 0) {
      return Math.round((currentVolumeValue / totalVolumesValue) * 100);
    }

    return 0;
  };

  const progressPercentage = calculateProgressPercentage();

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
      {hasExternalData && (
        <div className={cn("glass border rounded-xl p-6 space-y-4", "border-blue-500/30")}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", mediaColor)}>
              <BookOpen className="w-5 h-5" />
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

            {/* Volumes - verifica se existe e é maior que 0 */}
            {externalData.volumes != null && externalData.volumes > 0 ? (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-white/80">Volumes:</span>
                  <div className="font-medium text-white">{externalData.volumes}</div>
                </div>
              </div>
            ) : null}

            {/* Capítulos - verifica se existe e é maior que 0 */}
            {externalData.chapters != null && externalData.chapters > 0 ? (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Hash className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-white/80">Capítulos:</span>
                  <div className="font-medium text-white">{externalData.chapters}</div>
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

            {/* Autores - verifica se existe e tem pelo menos 1 */}
            {externalData.authors && externalData.authors.length > 0 ? (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <User className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-white/80">
                    {externalData.authors.length === 1 ? 'Autor:' : 'Autores:'}
                  </span>
                  <div className="font-medium text-white">
                    {externalData.authors.slice(0, 3).map((author, index, arr) => (
                      <span key={index}>
                        {author}
                        {index < arr.length - 1 && index < 2 && ', '}
                      </span>
                    ))}
                  </div>
                  {externalData.authors.length > 3 && (
                    <div className="text-xs text-white/60">
                      +{externalData.authors.length - 3} outro(s)
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

            <div className="space-y-6">
              <Input
                label="Número de Volumes"
                type="number"
                icon={BookOpen}
                {...register('volumes', {
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? undefined : Number(value)
                })}
                error={errors.volumes?.message}
                placeholder="10"
                variant="glass"
                min={1}
              />

              <Input
                label="Número de Capítulos"
                type="number"
                icon={Hash}
                {...register('chapters', {
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? undefined : Number(value)
                })}
                error={errors.chapters?.message}
                placeholder="100"
                variant="glass"
                min={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Autores (separados por vírgula)
              </label>
              <Input
                value={selectedAuthors.join(', ')}
                onChange={handleAuthorChange}
                placeholder="Autor 1, Autor 2, ..."
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
              Gêneros
            </label>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map((genre) => (
                <button
                  key={genre.id}
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
                  {genre.name}
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
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Progresso do Mangá</h3>
              <p className="text-sm text-white/60">
                Em qual volume e capítulo você está?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Volume Atual:"
                type="number"
                icon={BookOpen}
                {...register('progress.currentVolume', {
                  valueAsNumber: true,
                  setValueAs: (value) => {
                    if (value === '' || value === null || value === undefined) {
                      return 1;
                    }
                    const numValue = Number(value);

                    // Limita automaticamente ao máximo
                    const maxVolumes = totalVolumes || volumesFromForm;
                    if (maxVolumes && numValue > maxVolumes) {
                      return maxVolumes;
                    }

                    if (numValue < 1) {
                      return 1;
                    }

                    return numValue;
                  },
                  validate: validateCurrentVolume
                })}
                error={errors.progress?.currentVolume?.message}
                placeholder={`1${(totalVolumes || volumesFromForm) ? ` (máx: ${totalVolumes || volumesFromForm})` : ''}`}
                variant="glass"
                min={1}
                max={totalVolumes || volumesFromForm || undefined}
                step={1}
              />

              {/* Mensagem informativa para volumes */}
              {(totalVolumes || volumesFromForm) && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span className="text-white/60">
                    Total: <span className="font-medium text-white">{totalVolumes || volumesFromForm}</span> volumes
                  </span>
                </div>
              )}

              {/* Dica quando atingir o máximo de volumes */}
              {(totalVolumes || volumesFromForm) && currentVolume >= (totalVolumes || volumesFromForm) && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">
                    Você completou todos os volumes!
                  </span>
                </div>
              )}
            </div>

            <div>
              <Input
                label="Capítulos Lidos:"
                type="number"
                icon={Hash}
                {...register('progress.currentChapter', {
                  valueAsNumber: true,
                  setValueAs: (value) => {
                    if (value === '' || value === null || value === undefined) {
                      return 0;
                    }
                    const numValue = Number(value);

                    // Limita automaticamente ao máximo
                    const maxChapters = totalChapters || chaptersFromForm;
                    if (maxChapters && numValue > maxChapters) {
                      return maxChapters;
                    }

                    // Não permite negativo
                    if (numValue < 0) {
                      return 0;
                    }

                    return numValue;
                  },
                  validate: validateCurrentChapter
                })}
                error={errors.progress?.currentChapter?.message}
                placeholder={`0${(totalChapters || chaptersFromForm) ? ` (máx: ${totalChapters || chaptersFromForm})` : ''}`}
                variant="glass"
                min={0}
                max={totalChapters || chaptersFromForm || undefined}
                step={1}
              />

              {/* Mensagem informativa para capítulos */}
              {(totalChapters || chaptersFromForm) && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  <span className="text-white/60">
                    Total: <span className="font-medium text-white">{totalChapters || chaptersFromForm}</span> capítulos
                  </span>
                </div>
              )}

              {/* Dica quando atingir o máximo de capítulos */}
              {(totalChapters || chaptersFromForm) && currentChapter >= (totalChapters || chaptersFromForm) && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">
                    Você completou todos os capítulos!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Barra de progresso visual */}
          {(totalVolumes || volumesFromForm || totalChapters || chaptersFromForm) && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">Progresso geral:</span>
                <span className="text-white font-medium">
                  {currentVolume}/{totalVolumes || volumesFromForm || '?'} volumes •
                  {' '}{currentChapter}/{totalChapters || chaptersFromForm || '?'} capítulos
                  {' '}({progressPercentage}%)
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(progressPercentage, 100)}%`
                  }}
                />
              </div>

              {/* Dica quando atingir 100% */}
              {progressPercentage >= 100 && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">
                    ✨ Você completou o mangá! Considere mudar o status para "Concluído"
                  </span>
                </div>
              )}
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
          className="min-w-[100px] bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {initialData ? 'Atualizar' : hasExternalData ? 'Adicionar à minha lista' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};

export default MangaForm;