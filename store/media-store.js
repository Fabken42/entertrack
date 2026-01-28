'use client';

import { create } from 'zustand';
import toast from 'react-hot-toast';

const useMediaStore = create((set, get) => ({
  userMedia: [],
  isLoading: false,
  error: null,

  // ========== MÉTODOS DE FETCH ==========
  fetchUserMedia: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/user/media');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch media');
      }
      const data = await response.json();
      set({ userMedia: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      get().handleError(error, 'fetchUserMedia');
    }
  },

  // ========== MÉTODOS DE PROGRESSO ==========
  createProgressPayload: (progressData, mediaType) => {
    if (!progressData || Object.keys(progressData).length === 0) {
      return undefined;
    }

    const progressPayload = {
      lastUpdated: new Date()
    };

    // Mapeamento de campos específicos por tipo de mídia
    const mediaTypeFields = {
      anime: ['episodes'],
      series: ['episodes', 'seasons'],
      manga: ['chapters', 'volumes'],
      game: ['hours', 'tasks'],
      movie: ['minutes']
    };

    // Adicionar campos específicos
    mediaTypeFields[mediaType]?.forEach(field => {
      if (progressData[field] !== undefined) {
        progressPayload[field] = progressData[field];
      }
    });

    // Campos comuns
    if (progressData.percentage !== undefined) {
      progressPayload.percentage = progressData.percentage;
    }

    // Verificar se há campos válidos (excluindo lastUpdated)
    const validKeys = Object.keys(progressPayload).filter(
      key => key !== 'lastUpdated' && progressPayload[key] !== undefined
    );

    return validKeys.length > 0 ? progressPayload : undefined;
  },

  // ========== MÉTODOS DE CACHE ==========
  createCacheEssentialData: (mediaData, sourceApi, mediaType) => {
    const essentialData = {
      title: mediaData.title?.trim() || 'Título não disponível',
      mediaType: mediaType,
      sourceApi: sourceApi
    };

    // Campos básicos
    const basicFields = [
      'description', 'coverImage', 'category', 'releasePeriod',
      'releaseYear', 'averageRating', 'ratingCount', 'popularity',
      'members', 'runtime', 'metacritic'
    ];

    basicFields.forEach(field => {
      const value = mediaData[field];
      if (value !== undefined && value !== null) {
        if (typeof value === 'string') {
          essentialData[field] = value.trim();
        } else {
          essentialData[field] = value;
        }
      }
    });

    // Campos de API
    if (mediaData.apiRating !== undefined && mediaData.apiRating !== null) {
      essentialData.averageRating = mediaData.apiRating;
    }
    if (mediaData.apiVoteCount !== undefined && mediaData.apiVoteCount !== null) {
      essentialData.ratingCount = mediaData.apiVoteCount;
    }

    // Campos específicos por tipo de mídia
    const mediaSpecificFields = {
      anime: ['episodes', 'studios', 'duration'],
      manga: ['chapters', 'volumes', 'authors'],
      game: ['metacritic', 'platforms', 'playtime'],
      series: ['episodes', 'seasons', 'episodesPerSeason'],
      movie: ['runtime', 'directors']
    };

    mediaSpecificFields[mediaType]?.forEach(field => {
      const value = mediaData[field];
      if (value !== undefined && value !== null) {
        essentialData[field] = value;
      }
    });

    // Arrays
    const arrayFields = ['platforms', 'studios', 'authors', 'episodesPerSeason'];
    arrayFields.forEach(field => {
      if (Array.isArray(mediaData[field]) && mediaData[field].length > 0) {
        essentialData[field] = mediaData[field];
      }
    });

    // Processar gêneros - CORREÇÃO PRINCIPAL
    if (Array.isArray(mediaData.genres) && mediaData.genres.length > 0) {
      essentialData.genres = mediaData.genres.map((g, index) => {
        if (typeof g === 'object') {
          // Garantir que id seja um número
          let genreId = g.id;

          if (genreId !== undefined && genreId !== null) {
            // Converter para número
            genreId = Number(genreId);

            // Se a conversão falhar ou resultar em NaN, usar fallback
            if (isNaN(genreId)) {
              genreId = index + 1; // Fallback numérico baseado no índice
            }
          } else {
            // Se não houver id, usar fallback numérico
            genreId = index + 1;
          }

          return {
            id: genreId,
            name: g.name || g.title || 'Desconhecido'
          };
        }

        // Se g for apenas uma string
        return {
          id: index + 1,
          name: g
        };
      });
    }

    // Imagem padrão para mídias manuais
    if (sourceApi === 'manual' && !essentialData.coverImage) {
      essentialData.coverImage = '/images/icons/placeholder-image.png';
    }

    return essentialData;
  },

  // ========== OPERAÇÕES CRUD ==========
  addMedia: async (mediaData) => {
    console.log('adding media: ', mediaData) //para genres, imprime: genres: Array(3) [ "Ação", "Aventura", "Fantasia" ]
    try {
      // Validação
      if (!mediaData.sourceId && mediaData.sourceApi !== 'manual') {
        throw new Error('sourceId é obrigatório para mídias externas');
      }

      const sourceId = mediaData.sourceId?.toString() ||
        `manual_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      const sourceApi = mediaData.sourceApi || 'manual';
      const mediaType = mediaData.mediaType;

      // 1. Criar cache
      const cachePayload = {
        sourceApi,
        sourceId,
        mediaType,
        essentialData: get().createCacheEssentialData(mediaData, sourceApi, mediaType)
      };

      const cacheResponse = await fetch('/api/media/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cachePayload)
      });

      if (!cacheResponse.ok) {
        const errorData = await cacheResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to cache media data');
      }

      const cacheResult = await cacheResponse.json();

      // 2. Criar UserMedia
      const progressPayload = get().createProgressPayload(mediaData.progress, mediaType);

      const userMediaPayload = get().cleanPayload({
        mediaCacheId: cacheResult.cacheId,
        status: mediaData.status || 'planned',
        userRating: mediaData.userRating,
        personalNotes: mediaData.personalNotes?.trim(),
        progress: progressPayload
      });

      // Adicionar datas baseadas no status
      const statusDate = get().getStatusDate(mediaData.status);
      if (statusDate) {
        Object.assign(userMediaPayload, statusDate);
      }

      const userMediaResponse = await fetch('/api/user/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userMediaPayload)
      });

      if (!userMediaResponse.ok) {
        const errorData = await userMediaResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add media to your list');
      }

      const newMedia = await userMediaResponse.json();

      // 3. Atualizar store
      set(state => ({
        userMedia: [...state.userMedia, newMedia]
      }));

      toast.success('Mídia adicionada com sucesso!');
      return newMedia;

    } catch (error) {
      get().handleError(error, 'addMedia');
      throw error;
    }
  },

  updateMedia: async (userMediaId, updateData) => {
    try {
      const currentMedia = get().userMedia.find(media => media._id === userMediaId);
      if (!currentMedia) {
        throw new Error('Mídia não encontrada');
      }

      const existingTasks = currentMedia?.progress?.tasks || [];
      const existingMediaCache = currentMedia?.mediaCacheId;
      const mediaType = updateData.mediaType || currentMedia.mediaType;

      const progressPayload = get().createProgressPayload(
        {
          ...updateData.progress,
          tasks: updateData.progress?.tasks || existingTasks
        },
        mediaType
      );

      const updatePayload = get().cleanPayload({
        status: updateData.status,
        userRating: updateData.userRating,
        personalNotes: updateData.personalNotes?.trim(),
        progress: progressPayload,
        category: updateData.category
      });

      // Adicionar datas se o status mudar
      if (updateData.status && updateData.status !== currentMedia.status) {
        const statusDate = get().getStatusDate(updateData.status);
        if (statusDate) {
          Object.assign(updatePayload, statusDate);
        }
      }

      const response = await fetch(`/api/user/media/${userMediaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update media');
      }

      const updatedMedia = await response.json();

      // Preservar o cache original
      const mediaToStore = {
        ...updatedMedia,
        mediaCacheId: existingMediaCache
      };

      set(state => ({
        userMedia: state.userMedia.map(media =>
          media._id === userMediaId ? mediaToStore : media
        )
      }));

      toast.success('Mídia atualizada com sucesso!');
      return mediaToStore;

    } catch (error) {
      get().handleError(error, 'updateMedia');
      throw error;
    }
  },

  removeMedia: async (userMediaId) => {
    try {
      const response = await fetch(`/api/user/media/${userMediaId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to remove media');
      }

      const result = await response.json();

      set(state => ({
        userMedia: state.userMedia.filter(media => media._id !== userMediaId)
      }));

      toast.success('Mídia removida com sucesso!');
      return result;

    } catch (error) {
      get().handleError(error, 'removeMedia');
      throw error;
    }
  },

  // ========== MÉTODOS DE PROGRESSO AVANÇADO ==========
  increaseProgress: async (userMediaId, mediaType) => {
    try {
      const { userMedia } = get();
      const currentItem = userMedia.find(item => item._id === userMediaId);

      if (!currentItem) {
        throw new Error('Item não encontrado');
      }

      if (!['in_progress', 'dropped'].includes(currentItem.status)) {
        throw new Error('Apenas itens em progresso ou abandonados podem ter progresso aumentado');
      }

      const progress = currentItem.progress || {};
      const essentialData = currentItem.mediaCacheId?.essentialData || {};

      // Calcular novo progresso
      const progressResult = get().calculateNextProgress(currentItem, mediaType);

      if (progressResult.completed) {
        toast.success('Você já completou esta mídia!');
        return currentItem;
      }

      const { updatedProgress, shouldMarkAsCompleted } = progressResult;

      // Atualização otimista
      const optimisticUpdate = {
        ...currentItem,
        progress: {
          ...progress,
          ...updatedProgress,
          lastUpdated: new Date()
        },
        ...(shouldMarkAsCompleted && { status: 'completed' })
      };

      set(state => ({
        userMedia: state.userMedia.map(item =>
          item._id === userMediaId ? optimisticUpdate : item
        )
      }));

      // Enviar para o backend
      const finalProgressPayload = get().createProgressPayload(
        {
          ...progress,
          ...updatedProgress
        },
        mediaType
      );

      const updatePayload = get().cleanPayload({
        progress: finalProgressPayload,
        ...(shouldMarkAsCompleted && { status: 'completed' })
      });

      const response = await fetch(`/api/user/media/${userMediaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        // Reverter em caso de erro
        set(state => ({
          userMedia: state.userMedia.map(item =>
            item._id === userMediaId ? currentItem : item
          )
        }));

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update progress');
      }

      const updatedMedia = await response.json();

      // Atualizar com dados reais mantendo cache
      const mediaToStore = {
        ...updatedMedia,
        mediaCacheId: currentItem.mediaCacheId
      };

      set(state => ({
        userMedia: state.userMedia.map(item =>
          item._id === userMediaId ? mediaToStore : item
        )
      }));

      return mediaToStore;

    } catch (error) {
      get().handleError(error, 'increaseProgress');
      throw error;
    }
  },

  calculateNextProgress: (currentItem, mediaType) => {
    const progress = currentItem.progress || {};
    const essentialData = currentItem.mediaCacheId?.essentialData || {};

    switch (mediaType) {
      case 'anime':
        return get().calculateAnimeProgress(progress, essentialData);
      case 'series':
        return get().calculateSeriesProgress(progress, essentialData);
      case 'game':
        return get().calculateGameProgress(progress);
      case 'manga':
        return get().calculateMangaProgress(progress, essentialData);
      default:
        throw new Error(`Tipo de mídia não suportado: ${mediaType}`);
    }
  },

  calculateAnimeProgress: (progress, essentialData) => {
    const currentEpisodes = progress.episodes || 0;
    const totalEpisodes = essentialData.episodes || 0;

    if (totalEpisodes > 0 && currentEpisodes >= totalEpisodes) {
      return { completed: true };
    }

    return {
      updatedProgress: { episodes: currentEpisodes + 1 },
      shouldMarkAsCompleted: totalEpisodes > 0 && (currentEpisodes + 1) >= totalEpisodes
    };
  },

  calculateSeriesProgress: (progress, essentialData) => {
    const currentEpisodes = progress.episodes || 0;
    const currentSeasons = progress.seasons || 1;
    const episodesPerSeason = essentialData.episodesPerSeason || [];
    const totalEpisodes = essentialData.episodes || 0;

    if (episodesPerSeason.length === 0) {
      if (totalEpisodes > 0 && currentEpisodes >= totalEpisodes) {
        return { completed: true };
      }

      return {
        updatedProgress: { episodes: currentEpisodes + 1, seasons: currentSeasons },
        shouldMarkAsCompleted: totalEpisodes > 0 && (currentEpisodes + 1) >= totalEpisodes
      };
    }

    const seasonIndex = currentSeasons - 1;
    if (seasonIndex >= episodesPerSeason.length) {
      const lastSeasonEpisodes = episodesPerSeason[episodesPerSeason.length - 1] || 0;
      if (currentEpisodes >= lastSeasonEpisodes) {
        return { completed: true };
      }

      return {
        updatedProgress: {
          episodes: currentEpisodes + 1,
          seasons: episodesPerSeason.length
        },
        shouldMarkAsCompleted: false
      };
    }

    const episodesInCurrentSeason = episodesPerSeason[seasonIndex] || 0;
    const isLastEpisodeOfSeason = currentEpisodes >= episodesInCurrentSeason - 1;
    const isLastSeason = seasonIndex >= episodesPerSeason.length - 1;

    if (isLastEpisodeOfSeason && !isLastSeason) {
      return {
        updatedProgress: { episodes: 0, seasons: currentSeasons + 1 },
        shouldMarkAsCompleted: false
      };
    }

    if (isLastEpisodeOfSeason && isLastSeason) {
      return {
        updatedProgress: { episodes: episodesInCurrentSeason, seasons: currentSeasons },
        shouldMarkAsCompleted: true
      };
    }

    return {
      updatedProgress: { episodes: currentEpisodes + 1, seasons: currentSeasons },
      shouldMarkAsCompleted: false
    };
  },

  calculateGameProgress: (progress) => {
    if (!progress.tasks || progress.tasks.length === 0) {
      throw new Error('Este jogo não tem tarefas definidas');
    }

    const pendingTasks = progress.tasks.filter(task => !task.completed);
    if (pendingTasks.length === 0) {
      toast.success('🎮 Todos os objetivos concluídos!');
      return { completed: true };
    }

    const taskIndex = progress.tasks.findIndex(task => !task.completed);
    if (taskIndex === -1) {
      throw new Error('Não foi possível encontrar tarefa pendente');
    }

    const updatedTasks = progress.tasks.map((task, index) =>
      index === taskIndex
        ? { ...task, completed: true, completedAt: new Date() }
        : task
    );

    const completedTasksCount = updatedTasks.filter(task => task.completed).length;
    const allTasksCompleted = completedTasksCount === updatedTasks.length;

    if (allTasksCompleted) {
      toast.success('🎮 Todos os objetivos concluídos!');
    }

    return {
      updatedProgress: { tasks: updatedTasks },
      shouldMarkAsCompleted: allTasksCompleted
    };
  },

  calculateMangaProgress: (progress, essentialData) => {
    const currentChapters = progress.chapters || 0;
    const currentVolumes = progress.volumes || 0;
    const totalChapters = essentialData.chapters || 0;
    const totalVolumes = essentialData.volumes || 0;

    if (totalChapters > 0 && currentChapters >= totalChapters) {
      return { completed: true };
    }

    const updatedProgress = { chapters: currentChapters + 1 };

    // Calcular volume
    if (totalVolumes > 0 && totalChapters > 0) {
      const chaptersPerVolume = Math.ceil(totalChapters / totalVolumes) || 10;
      const shouldIncreaseVolume = ((currentChapters + 1) % chaptersPerVolume === 1) &&
        currentVolumes < totalVolumes;

      if (shouldIncreaseVolume) {
        updatedProgress.volumes = (currentVolumes || 0) + 1;
      } else if (currentVolumes > 0) {
        updatedProgress.volumes = currentVolumes;
      }
    }

    return {
      updatedProgress,
      shouldMarkAsCompleted: totalChapters > 0 && (currentChapters + 1) >= totalChapters
    };
  },

  // ========== MÉTODOS AUXILIARES ==========
  cleanPayload: (obj) => {
    if (!obj || typeof obj !== 'object') return {};

    const cleaned = { ...obj };
    Object.keys(cleaned).forEach(key => {
      const value = cleaned[key];
      if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && !Array.isArray(value) && value !== null && Object.keys(value).length === 0)
      ) {
        delete cleaned[key];
      }
    });
    return cleaned;
  },

  getStatusDate: (status) => {
    const date = new Date();
    switch (status) {
      case 'in_progress': return { startedAt: date };
      case 'completed': return { completedAt: date };
      case 'dropped': return { droppedAt: date };
      default: return null;
    }
  },

  handleError: (error, context) => {
    console.error(`❌ Erro em ${context}:`, error);

    const errorMessages = {
      'Failed to fetch media': 'Erro ao carregar sua lista',
      'Failed to cache media data': 'Erro ao salvar dados da mídia',
      'Failed to add media to your list': 'Erro ao adicionar à sua lista',
      'Failed to update media': 'Erro ao atualizar mídia',
      'Failed to remove media': 'Erro ao remover mídia',
      'Failed to update progress': 'Erro ao atualizar progresso',
      'Item não encontrado': 'Mídia não encontrada',
      'Mídia não encontrada': 'Mídia não encontrada'
    };

    const message = errorMessages[error.message] ||
      error.message ||
      'Ocorreu um erro. Tente novamente.';

    toast.error(message);
    return { success: false, error: message };
  },

  // ========== MÉTODOS DE CONSULTA ==========
  getMediaByType: (mediaType) => {
    const { userMedia } = get();
    return userMedia.filter(item =>
      item.mediaCacheId?.mediaType === mediaType
    );
  },

  getMediaByStatus: (mediaType, status) => {
    const { userMedia } = get();
    return userMedia.filter(item =>
      item.mediaCacheId?.mediaType === mediaType &&
      item.status === status
    );
  },

  searchMedia: (mediaType, query) => {
    const { userMedia } = get();
    const searchTerm = query.toLowerCase();

    return userMedia.filter(item => {
      if (item.mediaCacheId?.mediaType !== mediaType) return false;

      const title = item.mediaCacheId?.essentialData?.title?.toLowerCase() || '';
      const description = item.mediaCacheId?.essentialData?.description?.toLowerCase() || '';

      return title.includes(searchTerm) || description.includes(searchTerm);
    });
  },

  getMediaById: (id) => {
    const { userMedia } = get();
    return userMedia.find(media => media._id === id);
  },

  // ========== FORMATAÇÃO ==========
  formatProgressForDisplay: (userMedia) => {
    if (!userMedia || !userMedia.progress) {
      return { display: 'Não iniciado', value: 0, unit: 'percentage' };
    }

    const progress = userMedia.progress;
    const mediaType = userMedia.mediaCacheId?.mediaType;
    const totalInfo = userMedia.mediaCacheId?.essentialData || {};

    switch (mediaType) {
      case 'anime':
        return {
          display: progress.episodes
            ? `Episódio ${progress.episodes}${totalInfo.episodes ? `/${totalInfo.episodes}` : ''}`
            : 'Não assistido',
          value: progress.episodes || 0,
          unit: 'episodes',
          total: totalInfo.episodes,
          percentage: progress.percentage
        };
      case 'manga':
        const parts = [];
        if (progress.chapters) parts.push(`Cap. ${progress.chapters}${totalInfo.chapters ? `/${totalInfo.chapters}` : ''}`);
        if (progress.volumes) parts.push(`Vol. ${progress.volumes}${totalInfo.volumes ? `/${totalInfo.volumes}` : ''}`);
        return {
          display: parts.length > 0 ? parts.join(' • ') : 'Não lido',
          value: progress.chapters || progress.volumes || 0,
          unit: progress.chapters ? 'chapters' : 'volumes',
          total: totalInfo.chapters || totalInfo.volumes,
          percentage: progress.percentage
        };
      case 'game':
        const taskCount = progress.tasks?.length || 0;
        const completedTasks = progress.tasks?.filter(t => t.completed).length || 0;
        return {
          display: progress.hours
            ? `${progress.hours}h${taskCount > 0 ? ` • ${completedTasks}/${taskCount} tarefas` : ''}`
            : 'Não iniciado',
          value: progress.hours || 0,
          unit: 'hours',
          total: null,
          tasks: progress.tasks || [],
          completedTasks: completedTasks,
          totalTasks: taskCount,
          percentage: progress.percentage
        };
      case 'series':
        return {
          display: progress.episodes
            ? `T${progress.seasons || 1} E${progress.episodes}${totalInfo.episodes ? `/${totalInfo.episodes}` : ''}`
            : 'Não assistido',
          value: progress.episodes || 0,
          unit: 'episodes',
          total: totalInfo.episodes,
          percentage: progress.percentage
        };
      default:
        return {
          display: progress.percentage ? `${progress.percentage}%` : '0%',
          value: progress.percentage || 0,
          unit: 'percentage'
        };
    }
  },

  // ========== MÉTODOS DE RESET/UTILITÁRIOS ==========
  reset: () => {
    set({ userMedia: [], isLoading: false, error: null });
  },

  getStats: (mediaType) => {
    const mediaList = get().getMediaByType(mediaType);
    const stats = {
      total: mediaList.length,
      planned: 0,
      in_progress: 0,
      completed: 0,
      dropped: 0,
      totalHours: 0,
      totalEpisodes: 0
    };

    mediaList.forEach(item => {
      stats[item.status] = (stats[item.status] || 0) + 1;

      if (item.progress?.hours) {
        stats.totalHours += item.progress.hours;
      }
      if (item.progress?.episodes) {
        stats.totalEpisodes += item.progress.episodes;
      }
    });

    return stats;
  }
}));

export { useMediaStore };