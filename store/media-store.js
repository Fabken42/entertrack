'use client';

import { create } from 'zustand';
import toast from 'react-hot-toast';

// Configurações por tipo de mídia
const MEDIA_CONFIG = {
  movie: {
    progressFields: ['minutes'],
    displayUnit: 'minutes',
    essentialFields: ['runtime']
  },
  series: {
    progressFields: ['episodes', 'seasons'],
    displayUnit: 'episodes',
    essentialFields: ['episodes', 'seasons', 'episodesPerSeason']
  },
  anime: {
    progressFields: ['episodes'],
    displayUnit: 'episodes',
    essentialFields: ['episodes', 'studios','category']
  },
  manga: {
    progressFields: ['chapters', 'volumes'],
    displayUnit: 'chapters',
    essentialFields: ['chapters', 'volumes', 'authors','category']
  },
  game: {
    progressFields: ['hours', 'tasks'],
    displayUnit: 'hours',
    essentialFields: ['metacritic', 'platforms', 'playtime']
  }
};

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

  // ========== MÉTODOS DE CACHE OTIMIZADOS ==========
  createCacheEssentialData: (mediaData, sourceApi, mediaType) => {
    // Estrutura base consistente
    const essentialData = {
      title: mediaData.title?.trim() || 'Título não disponível',
      mediaType,
      sourceApi,
      description: mediaData.description?.trim() || '',
      coverImage: mediaData.coverImage || '',
      genres: Array.isArray(mediaData.genres)
        ? mediaData.genres.map((g, index) => {
          if (typeof g === 'object') {
            return {
              id: Number(g.id) || index + 1,
              name: g.name || g.title || 'Desconhecido'
            };
          }
          return { id: index + 1, name: g };
        })
        : [],
      averageRating: mediaData.apiRating || mediaData.averageRating || null,
      ratingCount: mediaData.apiVoteCount || mediaData.ratingCount || null,
      releasePeriod: mediaData.releasePeriod || null,
      popularity: mediaData.popularity || null,
      members: mediaData.members || null,
      metacritic: mediaData.metacritic || null,
      category: mediaData.category || null,
    };

    // Adicionar campos específicos do tipo de mídia
    const config = MEDIA_CONFIG[mediaType];
    if (config) {
      config.essentialFields.forEach(field => {
        if (mediaData[field] !== undefined && mediaData[field] !== null) {
          essentialData[field] = mediaData[field];
        }
      });
    }

    // Imagem padrão para mídias manuais
    if (sourceApi === 'manual' && !essentialData.coverImage) {
      essentialData.coverImage = '/images/icons/placeholder-image.png';
    }

    // Remover campos nulos/undefined
    Object.keys(essentialData).forEach(key => {
      if (essentialData[key] === undefined || essentialData[key] === null) {
        delete essentialData[key];
      }
    });

    return essentialData;
  },

  // ========== MÉTODOS DE PROGRESSO OTIMIZADOS ==========
  createProgressPayload: (progressData, mediaType) => {
    if (!progressData || Object.keys(progressData).length === 0) {
      return undefined;
    }

    const config = MEDIA_CONFIG[mediaType];
    if (!config) return undefined;

    const progressPayload = {
      lastUpdated: new Date()
    };

    // Adicionar campos específicos
    config.progressFields.forEach(field => {
      if (progressData[field] !== undefined) {
        progressPayload[field] = progressData[field];
      }
    });

    // Campos comuns
    if (progressData.percentage !== undefined) {
      progressPayload.percentage = progressData.percentage;
    }

    // Verificar se há campos válidos
    const hasValidFields = config.progressFields.some(
      field => progressPayload[field] !== undefined
    );

    return hasValidFields || progressPayload.percentage !== undefined
      ? progressPayload
      : undefined;
  },

  // ========== OPERAÇÕES CRUD OTIMIZADAS ==========
  addMedia: async (mediaData) => {
    try {
      const { sourceApi = 'manual', mediaType } = mediaData;

      // Validação simplificada
      if (!mediaData.sourceId && sourceApi !== 'manual') {
        throw new Error('sourceId é obrigatório para mídias externas');
      }

      const sourceId = mediaData.sourceId || `manual_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

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

      // 2. Criar UserMedia com payload limpo
      const progressPayload = get().createProgressPayload(mediaData.progress, mediaType);

      const userMediaPayload = {
        mediaCacheId: cacheResult.cacheId,
        status: mediaData.status || 'planned',
        userRating: mediaData.userRating || null,
        personalNotes: mediaData.personalNotes?.trim() || '',
        progress: progressPayload,
        ...(get().getStatusDate(mediaData.status) || {})
      };

      // Limpar payload
      Object.keys(userMediaPayload).forEach(key => {
        if (userMediaPayload[key] === undefined || userMediaPayload[key] === null) {
          delete userMediaPayload[key];
        }
      });

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

      // 3. Atualizar store otimista
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

      const mediaType = updateData.mediaType || currentMedia.mediaType;
      const existingTasks = currentMedia?.progress?.tasks || [];

      // Preparar payload de atualização
      const updatePayload = {
        status: updateData.status,
        userRating: updateData.userRating,
        personalNotes: updateData.personalNotes?.trim(),
        category: updateData.category,
        progress: get().createProgressPayload(
          {
            ...updateData.progress,
            tasks: updateData.progress?.tasks || existingTasks
          },
          mediaType
        )
      };

      // Adicionar datas se o status mudar
      if (updateData.status && updateData.status !== currentMedia.status) {
        const statusDate = get().getStatusDate(updateData.status);
        if (statusDate) {
          Object.assign(updatePayload, statusDate);
        }
      }

      // Remover campos vazios
      Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] === undefined || updatePayload[key] === null) {
          delete updatePayload[key];
        }
      });

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
        mediaCacheId: currentMedia.mediaCacheId
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

      // Atualização otimista
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

  // ========== MÉTODOS DE PROGRESSO AVANÇADO OTIMIZADOS ==========
  increaseProgress: async (userMediaId, mediaType) => {
    try {
      const currentItem = get().userMedia.find(item => item._id === userMediaId);
      if (!currentItem) {
        throw new Error('Item não encontrado');
      }

      if (!['in_progress', 'dropped'].includes(currentItem.status)) {
        throw new Error('Apenas itens em progresso ou abandonados podem ter progresso aumentado');
      }

      const progressResult = get().calculateNextProgress(currentItem, mediaType);

      if (progressResult.completed) {
        toast.success('Você já completou esta mídia!');
        return currentItem;
      }

      const { updatedProgress, shouldMarkAsCompleted } = progressResult;

      const isGame = mediaType === 'game';
      const markAsCompleted = shouldMarkAsCompleted && !isGame;

      // MODIFICAÇÃO: Verificar se vai mudar o status automaticamente
      const isAutoCompletion = markAsCompleted && currentItem.status !== 'completed';

      // Atualização otimista
      const optimisticUpdate = {
        ...currentItem,
        progress: {
          ...(currentItem.progress || {}),
          ...updatedProgress,
          lastUpdated: new Date()
        },
        ...(markAsCompleted && { status: 'completed' })
      };

      set(state => ({
        userMedia: state.userMedia.map(item =>
          item._id === userMediaId ? optimisticUpdate : item
        )
      }));

      // MODIFICAÇÃO: Mostrar toast se for uma conclusão automática
      if (isAutoCompletion) toast.success('🎉 Você completou esta mídia!');

      // Enviar para o backend
      const updatePayload = {
        progress: get().createProgressPayload(
          {
            ...(currentItem.progress || {}),
            ...updatedProgress
          },
          mediaType
        ),
        ...(markAsCompleted && { status: 'completed' })
      };

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
        throw new Error('Failed to update progress');
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

    const calculators = {
      anime: () => get().calculateAnimeProgress(progress, essentialData),
      series: () => get().calculateSeriesProgress(progress, essentialData),
      game: () => get().calculateGameProgress(progress),
      manga: () => get().calculateMangaProgress(progress, essentialData),
      movie: () => get().calculateMovieProgress(progress, essentialData)
    };

    const calculator = calculators[mediaType];
    if (!calculator) {
      throw new Error(`Tipo de mídia não suportado: ${mediaType}`);
    }

    return calculator();
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

  calculateMovieProgress: (progress, essentialData) => {
    const currentMinutes = progress.minutes || 0;
    const totalMinutes = essentialData.runtime || 0;

    if (totalMinutes > 0 && currentMinutes >= totalMinutes) {
      return { completed: true };
    }

    // Incrementa em 10 minutos (ou até o total)
    const increment = 10;
    const newMinutes = Math.min(currentMinutes + increment, totalMinutes);

    return {
      updatedProgress: { minutes: newMinutes },
      shouldMarkAsCompleted: totalMinutes > 0 && newMinutes >= totalMinutes
    };
  },

  // ========== MÉTODOS AUXILIARES OTIMIZADOS ==========
  getStatusDate: (status) => {
    const date = new Date();
    const statusDates = {
      in_progress: { startedAt: date },
      completed: { completedAt: date },
      dropped: { droppedAt: date }
    };
    return statusDates[status] || null;
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
      'Mídia não encontrada': 'Mídia não encontrada',
      'Este jogo não tem tarefas definidas': 'Este jogo não tem tarefas definidas',
      'Apenas itens em progresso ou abandonados podem ter progresso aumentado': 'Apenas itens em progresso ou abandonados podem ter progresso aumentado'
    };

    const message = errorMessages[error.message] || error.message || 'Ocorreu um erro. Tente novamente.';

    toast.error(message);
    return { success: false, error: message };
  },

  // ========== MÉTODOS DE CONSULTA OTIMIZADOS ==========
  getMediaByType: (mediaType) => {
    return get().userMedia.filter(item =>
      item.mediaCacheId?.mediaType === mediaType
    );
  },

  getMediaByStatus: (mediaType, status) => {
    return get().userMedia.filter(item =>
      item.mediaCacheId?.mediaType === mediaType &&
      item.status === status
    );
  },

  searchMedia: (mediaType, query) => {
    const searchTerm = query.toLowerCase();
    return get().userMedia.filter(item => {
      if (item.mediaCacheId?.mediaType !== mediaType) return false;

      const title = item.mediaCacheId?.essentialData?.title?.toLowerCase() || '';
      const description = item.mediaCacheId?.essentialData?.description?.toLowerCase() || '';

      return title.includes(searchTerm) || description.includes(searchTerm);
    });
  },

  getMediaById: (id) => {
    return get().userMedia.find(media => media._id === id);
  },

  // ========== FORMATAÇÃO OTIMIZADA ==========
  formatProgressForDisplay: (userMedia) => {
    if (!userMedia || !userMedia.progress) {
      return { display: 'Não iniciado', value: 0, unit: 'percentage' };
    }

    const progress = userMedia.progress;
    const mediaType = userMedia.mediaCacheId?.mediaType;
    const totalInfo = userMedia.mediaCacheId?.essentialData || {};

    const formatters = {
      anime: () => ({
        display: progress.episodes
          ? `Episódio ${progress.episodes}${totalInfo.episodes ? `/${totalInfo.episodes}` : ''}`
          : 'Não assistido',
        value: progress.episodes || 0,
        unit: 'episodes',
        total: totalInfo.episodes,
        percentage: progress.percentage
      }),
      manga: () => {
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
      },
      game: () => {
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
          completedTasks,
          totalTasks: taskCount,
          percentage: progress.percentage
        };
      },
      series: () => ({
        display: progress.episodes
          ? `T${progress.seasons || 1} E${progress.episodes}${totalInfo.episodes ? `/${totalInfo.episodes}` : ''}`
          : 'Não assistido',
        value: progress.episodes || 0,
        unit: 'episodes',
        total: totalInfo.episodes,
        percentage: progress.percentage
      }),
      movie: () => {
        const currentMinutes = progress.minutes || 0;
        const totalMinutes = totalInfo.runtime || 0;
        const percentage = totalMinutes > 0 ? Math.round((currentMinutes / totalMinutes) * 100) : 0;

        return {
          display: totalMinutes > 0
            ? `${Math.floor(currentMinutes / 60)}h ${currentMinutes % 60}m / ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
            : `${Math.floor(currentMinutes / 60)}h ${currentMinutes % 60}m`,
          value: currentMinutes,
          unit: 'minutes',
          total: totalMinutes,
          percentage
        };
      }
    };

    const formatter = formatters[mediaType];
    return formatter ? formatter() : {
      display: progress.percentage ? `${progress.percentage}%` : '0%',
      value: progress.percentage || 0,
      unit: 'percentage'
    };
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
      totalEpisodes: 0,
      totalChapters: 0,
      totalMinutes: 0
    };

    mediaList.forEach(item => {
      stats[item.status] = (stats[item.status] || 0) + 1;

      if (item.progress?.hours) stats.totalHours += item.progress.hours;
      if (item.progress?.episodes) stats.totalEpisodes += item.progress.episodes;
      if (item.progress?.chapters) stats.totalChapters += item.progress.chapters;
      if (item.progress?.minutes) stats.totalMinutes += item.progress.minutes;
    });

    return stats;
  },

  // ========== MÉTODOS DE ORDENAÇÃO ==========
  sortMedia: (mediaType, sortBy = 'title', sortOrder = 'asc') => {
    const mediaList = get().getMediaByType(mediaType);

    return [...mediaList].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.mediaCacheId?.essentialData?.title?.toLowerCase() || '';
          bValue = b.mediaCacheId?.essentialData?.title?.toLowerCase() || '';
          break;
        case 'rating':
          aValue = a.userRating || a.mediaCacheId?.essentialData?.averageRating || 0;
          bValue = b.userRating || b.mediaCacheId?.essentialData?.averageRating || 0;
          break;
        case 'progress':
          aValue = get().formatProgressForDisplay(a).percentage || 0;
          bValue = get().formatProgressForDisplay(b).percentage || 0;
          break;
        case 'addedDate':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }
}));

export { useMediaStore };