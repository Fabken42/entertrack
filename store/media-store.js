'use client';

import { create } from 'zustand';
import toast from 'react-hot-toast';
import { JikanClient } from '@/lib/api/jikan';

const useMediaStore = create((set, get) => ({
  userMedia: [],
  isLoading: false,
  error: null,

  fetchUserMedia: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/user/media');
      if (!response.ok) throw new Error('Failed to fetch media');
      const data = await response.json();
      set({ userMedia: data, isLoading: false, error: null });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      toast.error('Erro ao carregar sua lista');
    }
  },

  createProgressPayload: (progressData, mediaType) => {
    if (!progressData || Object.keys(progressData).length === 0) {
      return undefined;
    }

    const details = {};

    switch (mediaType) {
      case 'anime':
        if (progressData.episodes !== undefined) details.episodes = progressData.episodes;
        break;
      case 'series':
        if (progressData.episodes !== undefined) details.episodes = progressData.episodes;
        if (progressData.seasons !== undefined) details.seasons = progressData.seasons;
        break;
      case 'manga':
        if (progressData.chapters !== undefined) details.chapters = progressData.chapters;
        if (progressData.volumes !== undefined) details.volumes = progressData.volumes;
        break;
      case 'game':
        if (progressData.hours !== undefined) details.hours = progressData.hours;
        break;
      case 'movie':
        if (progressData.minutes !== undefined) details.minutes = progressData.minutes;
        break;
    }

    if (progressData.percentage !== undefined) {
      details.percentage = progressData.percentage;
    }

    if (Object.keys(details).length === 0 && !progressData.tasks) {
      return undefined;
    }

    const progressPayload = {
      details: details,
      lastUpdated: new Date()
    };
    
    if (progressData.tasks !== undefined && Array.isArray(progressData.tasks)) {
      progressPayload.tasks = progressData.tasks;
    }

    return progressPayload;
  },

  createCleanCacheEssentialData: (mediaData, sourceApi, mediaType) => {
    const essentialData = {
      title: mediaData.title?.trim() || 'Título não disponível',
    };

    if (mediaData.description?.trim()) {
      essentialData.description = mediaData.description.trim();
    }

    if (sourceApi === 'manual') {
      essentialData.coverImage = '/images/icons/placeholder-image.png';
    } else if (mediaData.imageUrl?.trim()) {
      essentialData.coverImage = mediaData.imageUrl.trim();
    } else if (mediaData.coverImage?.trim()) {
      essentialData.coverImage = mediaData.coverImage.trim();
    }

    if (mediaData.category) {
      essentialData.category = mediaData.category;
    }

    const numericFields = [
      'releaseYear', 'runtime', 'episodes', 'seasons', 
      'volumes', 'chapters', 'hours', 'metacritic',
      'averageRating', 'ratingCount', 'popularity', 'members'
    ];

    numericFields.forEach(field => {
      const value = mediaData[field];
      if (value !== undefined && value !== null) {
        essentialData[field] = value;
      }
    });

    if (mediaData.apiRating !== undefined && mediaData.apiRating !== null) {
      essentialData.averageRating = mediaData.apiRating;
    }
    if (mediaData.apiVoteCount !== undefined && mediaData.apiVoteCount !== null) {
      essentialData.ratingCount = mediaData.apiVoteCount;
    }

    if (Array.isArray(mediaData.episodesPerSeason) && mediaData.episodesPerSeason.length > 0) {
      essentialData.episodesPerSeason = mediaData.episodesPerSeason;
    }

    if (Array.isArray(mediaData.platforms) && mediaData.platforms.length > 0) {
      essentialData.platforms = mediaData.platforms;
    }

    if (Array.isArray(mediaData.studios) && mediaData.studios.length > 0) {
      essentialData.studios = mediaData.studios;
    }

    if (Array.isArray(mediaData.authors) && mediaData.authors.length > 0) {
      essentialData.authors = mediaData.authors;
    }

    // ✅ CORREÇÃO: Gêneros - só processar se tiver dados
    if (Array.isArray(mediaData.genres) && mediaData.genres.length > 0) {
      essentialData.genres = mediaData.genres.map(g => {
        if (typeof g === 'string') {
          const genreObj = JikanClient.getAllGenres().find(genre => genre.id === g);
          return {
            id: g,
            name: genreObj?.name || g
          };
        }
        if (typeof g === 'object') {
          return {
            id: g.id?.toString() || g.name.toLowerCase().replace(/\s+/g, '-'),
            name: g.name
          };
        }
        return {
          id: g.toLowerCase().replace(/\s+/g, '-'),
          name: g
        };
      });
    }

    return essentialData;
  },

  addMedia: async (mediaData) => {
    if (!mediaData.sourceId) {
      if (mediaData.sourceApi === 'manual') {
        mediaData.sourceId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      } else {
        toast.error('Erro interno: ID da mídia não encontrado');
        throw new Error('sourceId é obrigatório para cache');
      }
    }

    const sourceId = mediaData.sourceId.toString();
    const sourceApi = mediaData.sourceApi || 'manual';
    const mediaType = mediaData.mediaType;

    // ✅ CORREÇÃO: Usar função auxiliar para criar dados limpos do cache
    const cachePayload = {
      sourceApi: sourceApi,
      sourceId: sourceId,
      mediaType: mediaType,
      essentialData: get().createCleanCacheEssentialData(mediaData, sourceApi, mediaType)
    };

    const cacheResponse = await fetch('/api/media/cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cachePayload)
    });

    if (!cacheResponse.ok) {
      const errorText = await cacheResponse.text();
      console.error('❌ Erro detalhado do cache:', errorText);
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`Failed to cache media data: ${errorJson.error || errorJson.details || 'Unknown error'}`);
      } catch (e) {
        throw new Error(`Failed to cache media data: ${cacheResponse.status} ${cacheResponse.statusText}`);
      }
    }

    const cacheResult = await cacheResponse.json();

    // ✅ CORREÇÃO: Criar progresso usando a função auxiliar (não inicializar tudo com 0)
    const progressPayload = get().createProgressPayload(
      {
        ...mediaData.progress?.details,
        tasks: mediaData.progress?.tasks
      },
      mediaType
    );

    // ✅ CORREÇÃO: Criar payload limpo para UserMedia
    const userMediaPayload = {
      mediaCacheId: cacheResult.cacheId,
      status: mediaData.status || 'planned',
    };

    // ✅ CORREÇÃO: Apenas adicionar campos se tiverem valor válido
    if (mediaData.userRating !== undefined) {
      userMediaPayload.userRating = mediaData.userRating;
    }

    if (mediaData.personalNotes?.trim()) {
      userMediaPayload.personalNotes = mediaData.personalNotes.trim();
    }

    if (progressPayload) {
      userMediaPayload.progress = progressPayload;
    }

    // ✅ CORREÇÃO: Datas baseadas no status (sem valores default desnecessários)
    if (mediaData.status === 'in_progress') {
      userMediaPayload.startedAt = new Date();
    } else if (mediaData.status === 'completed') {
      userMediaPayload.completedAt = new Date();
    } else if (mediaData.status === 'dropped') {
      userMediaPayload.droppedAt = new Date();
    }

    // ❌ REMOVIDO: Bloco que criava progresso forçado para mídias completadas
    // Isso causava inicialização desnecessária de campos

    const userMediaResponse = await fetch('/api/user/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userMediaPayload)
    });

    if (!userMediaResponse.ok) {
      const errorText = await userMediaResponse.text();
      console.error('❌ Erro na resposta da UserMedia:', errorText);

      try {
        const errorJson = JSON.parse(errorText);
        toast.error(errorJson.error || 'Erro ao adicionar mídia');
      } catch {
        toast.error('Erro ao adicionar mídia');
      }
      throw new Error('Failed to add media to your list');
    }

    const newMedia = await userMediaResponse.json();

    // Atualizar store local
    set(state => ({
      userMedia: [...state.userMedia, newMedia]
    }));

    toast.success('Mídia adicionada com sucesso!');
    return newMedia;
  },

  // ✅ CORREÇÃO: Função auxiliar para limpar payloads
  cleanPayload: (obj) => {
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

  updateMedia: async (userMediaId, updateData) => {
    try {
      // Busca a mídia atual para pegar as tasks existentes
      const currentMedia = get().userMedia.find(media => media._id === userMediaId);
      const existingTasks = currentMedia?.progress?.tasks || [];

      const progressPayload = get().createProgressPayload(
        {
          ...updateData?.progress?.details,
          hours: updateData?.progress?.details?.hours,
          tasks: updateData?.progress?.tasks || existingTasks
        },
        updateData.mediaType
      );

      // ✅ CORREÇÃO: Criar payload limpo (sem valores default desnecessários)
      const updatePayload = {
        status: updateData.status,
      };

      // ✅ CORREÇÃO: Apenas adicionar campos se tiverem valor
      if (updateData.userRating !== undefined) {
        updatePayload.userRating = updateData.userRating;
      }

      if (updateData.personalNotes?.trim()) {
        updatePayload.personalNotes = updateData.personalNotes.trim();
      }

      if (progressPayload) {
        updatePayload.progress = progressPayload;
      }

      // ✅ CORREÇÃO: Datas condicionais (já estava correto)
      if (updateData.startedAt) updatePayload.startedAt = updateData.startedAt;
      if (updateData.completedAt) updatePayload.completedAt = updateData.completedAt;
      if (updateData.droppedAt) updatePayload.droppedAt = updateData.droppedAt;
      if (updateData.category) updatePayload.category = updateData.category;

      // ✅ CORREÇÃO: Usar função cleanPayload para remover campos vazios
      const cleanedPayload = get().cleanPayload(updatePayload);

      const response = await fetch(`/api/user/media/${userMediaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na resposta:', errorData);
        throw new Error(errorData.error || 'Failed to update media');
      }

      const updatedMedia = await response.json();

      // Atualizar store local
      set(state => ({
        userMedia: state.userMedia.map(media =>
          media._id === userMediaId ? updatedMedia : media
        )
      }));

      toast.success('Mídia atualizada com sucesso!');
      return updatedMedia;

    } catch (error) {
      console.error('Error updating media:', error);
      toast.error('Erro ao atualizar mídia: ' + error.message);
      throw error;
    }
  },

  removeMedia: async (userMediaId) => {
    try {
      const response = await fetch(`/api/user/media/${userMediaId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove media');
      }

      const result = await response.json();
      // Atualizar store local
      set(state => ({
        userMedia: state.userMedia.filter(media => media._id !== userMediaId)
      }));

      toast.success('Mídia removida com sucesso!');
      return result;

    } catch (error) {
      console.error('Error removing media:', error);
      toast.error('Erro ao remover mídia: ' + error.message);
      throw error;
    }
  },

  getMediaByType: (mediaType) => {
    const { userMedia } = get();
    return userMedia.filter(item =>
      item.mediaCacheId?.mediaType === mediaType
    );
  },

  // Filtrar por status
  getMediaByStatus: (mediaType, status) => {
    const { userMedia } = get();
    return userMedia.filter(item =>
      item.mediaCacheId?.mediaType === mediaType &&
      item.status === status
    );
  },

  // Buscar por título
  searchMedia: (mediaType, query) => {
    const { userMedia } = get();
    const searchTerm = query.toLowerCase();

    return userMedia.filter(item => {
      if (item.mediaCacheId?.mediaType !== mediaType) return false;

      const title = item.mediaCacheId?.essentialData?.title?.toLowerCase() || '';
      return title.includes(searchTerm);
    });
  },

  // Método auxiliar para buscar mídia específica por ID
  getMediaById: (id) => {
    const { userMedia } = get();
    return userMedia.find(media => media._id === id);
  },

  formatProgressForDisplay: (userMedia) => {
    if (!userMedia || !userMedia.progress || !userMedia.progress.details) {
      return { display: 'Não iniciado', value: 0, unit: 'percentage' };
    }

    const details = userMedia.progress.details;
    const mediaType = userMedia.mediaCacheId?.mediaType;
    const totalInfo = userMedia.mediaCacheId?.totalInfo || {};

    switch (mediaType) {
      case 'anime':
        return {
          display: details.episodes
            ? `Episódio ${details.episodes}${totalInfo.episodes ? `/${totalInfo.episodes}` : ''}`
            : 'Não assistido',
          value: details.episodes || 0,
          unit: 'episodes',
          total: totalInfo.episodes,
          percentage: details.percentage
        };
      case 'manga':
        const parts = [];
        if (details.chapters) parts.push(`Cap. ${details.chapters}${totalInfo.chapters ? `/${totalInfo.chapters}` : ''}`);
        if (details.volumes) parts.push(`Vol. ${details.volumes}${totalInfo.volumes ? `/${totalInfo.volumes}` : ''}`);
        return {
          display: parts.length > 0 ? parts.join(' • ') : 'Não lido',
          value: details.chapters || details.volumes || 0,
          unit: details.chapters ? 'chapters' : 'volumes',
          total: totalInfo.chapters || totalInfo.volumes,
          percentage: details.percentage
        };
      case 'game':
        const taskCount = userMedia.progress?.tasks?.length || 0;
        const completedTasks = userMedia.progress?.tasks?.filter(t => t.completed).length || 0;
        return {
          display: details.hours
            ? `${details.hours}h${taskCount > 0 ? ` • ${completedTasks}/${taskCount} tarefas` : ''}`
            : 'Não iniciado',
          value: details.hours || 0,
          unit: 'hours',
          total: null,
          tasks: userMedia.progress?.tasks || [],
          completedTasks: completedTasks,
          totalTasks: taskCount,
          percentage: details.percentage
        };
      default:
        return {
          display: details.percentage ? `${details.percentage}%` : '0%',
          value: details.percentage || 0,
          unit: 'percentage'
        };
    }
  },

  increaseProgress: async (userMediaId, mediaType) => {
    try {
      // Busca o item atual
      const { userMedia } = get();
      const currentItem = userMedia.find(item => item._id === userMediaId);

      if (!currentItem) {
        throw new Error('Item não encontrado');
      }

      // Verifica se o status permite aumento
      if (!['in_progress', 'dropped'].includes(currentItem.status)) {
        throw new Error('Apenas itens em progresso ou abandonados podem ter progresso aumentado');
      }


      const progressDetails = currentItem.progress?.details || {};
      const mediaCache = currentItem.mediaCacheId;
      const essentialData = mediaCache?.essentialData || {};

      let updatedDetails = {};
      let shouldMarkAsCompleted = false;

      // Calcula o novo progresso localmente primeiro
      switch (mediaType) {
        case 'anime':
          const currentAnimeEpisodes = progressDetails.episodes || 0;
          const totalAnimeEpisodes = essentialData.episodes || 0;

          if (totalAnimeEpisodes > 0 && currentAnimeEpisodes >= totalAnimeEpisodes) {
            toast.success('Você já completou todos os episódios!');
            return currentItem;
          }

          updatedDetails = {
            episodes: currentAnimeEpisodes + 1
          };

          if (totalAnimeEpisodes > 0 && (currentAnimeEpisodes + 1) >= totalAnimeEpisodes) {
            shouldMarkAsCompleted = true;
          }
          break;

        case 'series':
          const currentEpisodes = progressDetails.episodes || 0;
          const currentSeasons = progressDetails.seasons || 1;
          const totalSeasons = essentialData.seasons || 0;
          const episodesPerSeason = essentialData.episodesPerSeason || [];
          const totalSeriesEpisodes = essentialData.episodes || 0;

          // Se não temos dados de temporadas, usar lógica simples
          if (episodesPerSeason.length === 0) {
            if (totalSeriesEpisodes > 0 && currentEpisodes >= totalSeriesEpisodes) {
              toast.success('Você já completou todos os episódios!');
              return currentItem;
            }

            updatedDetails = {
              episodes: currentEpisodes + 1,
              seasons: currentSeasons
            };

            if (totalSeriesEpisodes > 0 && (currentEpisodes + 1) >= totalSeriesEpisodes) {
              shouldMarkAsCompleted = true;
            }
          } else {
            // Lógica COM temporadas - NOVA VERSÃO
            const seasonIndex = currentSeasons - 1;

            // Verificar se temos dados para esta temporada
            if (seasonIndex >= episodesPerSeason.length) {
              // Já está na última temporada disponível
              const lastSeasonIndex = episodesPerSeason.length - 1;
              const episodesInLastSeason = episodesPerSeason[lastSeasonIndex] || 0;

              if (currentEpisodes >= episodesInLastSeason) {
                toast.success('Você já completou todos os episódios disponíveis!');
                return currentItem;
              }

              updatedDetails = {
                episodes: currentEpisodes + 1,
                seasons: episodesPerSeason.length
              };
            } else {
              const episodesInCurrentSeason = episodesPerSeason[seasonIndex] || 0;

              let totalWatchedEpisodes = 0;
              for (let i = 0; i < seasonIndex; i++) {
                totalWatchedEpisodes += episodesPerSeason[i] || 0;
              }
              totalWatchedEpisodes += currentEpisodes;

              if (totalSeriesEpisodes > 0 && totalWatchedEpisodes >= totalSeriesEpisodes) {
                toast.success('Você já completou toda a série!');
                return currentItem;
              }

              if (currentEpisodes >= episodesInCurrentSeason - 1) {

                if (currentSeasons < totalSeasons || (totalSeasons === 0 && seasonIndex < episodesPerSeason.length - 1)) {
                  updatedDetails = {
                    episodes: 0, // Começa no episódio 0 da nova temporada
                    seasons: currentSeasons + 1
                  };

                } else {
                  if (currentEpisodes === episodesInCurrentSeason - 1) {
                    updatedDetails = {
                      episodes: episodesInCurrentSeason, // Vai para o último episódio
                      seasons: currentSeasons
                    };
                  } else {
                    // Já está no último episódio da última temporada
                    shouldMarkAsCompleted = true;
                  }
                }
              } else {
                // Apenas incrementar episódio na mesma temporada
                updatedDetails = {
                  episodes: currentEpisodes + 1,
                  seasons: currentSeasons
                };

              }

              // Verificar se completou a série após a atualização
              if (!shouldMarkAsCompleted && totalSeriesEpisodes > 0) {
                let newTotalWatched = 0;
                const newSeasonIndex = (updatedDetails.seasons || currentSeasons) - 1;

                // Calcular novos episódios assistidos totais
                for (let i = 0; i < newSeasonIndex; i++) {
                  newTotalWatched += episodesPerSeason[i] || 0;
                }
                newTotalWatched += updatedDetails.episodes || 0;

                if (newTotalWatched >= totalSeriesEpisodes) {
                  shouldMarkAsCompleted = true;
                }
              }
            }
          }
          break;
        case 'game':
          const currentHours = progressDetails.hours || 0;
          updatedDetails = {
            hours: currentHours + 1
          };
          shouldMarkAsCompleted = false;
          break;
        case 'manga':
          const currentChapters = progressDetails.chapters || 0;
          const currentVolumes = progressDetails.volumes || 0;
          const totalChapters = essentialData.chapters || 0;
          const totalVolumes = essentialData.volumes || 0;

          if (totalChapters > 0 && currentChapters >= totalChapters) {
            toast.success('Você já leu todos os capítulos!');
            return currentItem;
          }

          updatedDetails = {
            chapters: currentChapters + 1
          };

          // Calcula volume
          if (totalVolumes > 0 && totalChapters > 0) {
            const chaptersPerVolume = Math.ceil(totalChapters / totalVolumes) || 10;
            const shouldIncreaseVolume = ((currentChapters + 1) % chaptersPerVolume === 1) &&
              currentVolumes < totalVolumes;

            if (shouldIncreaseVolume) {
              updatedDetails.volumes = (currentVolumes || 0) + 1;
            } else if (currentVolumes > 0) {
              updatedDetails.volumes = currentVolumes;
            }
          }

          if (totalChapters > 0 && (currentChapters + 1) >= totalChapters) {
            shouldMarkAsCompleted = true;
          }
          break;

        default:
          throw new Error(`Tipo de mídia não suportado para aumento de progresso: ${mediaType}`);
      }

      // Função para calcular o progresso total
      const calculateTotalProgress = (details) => {
        let totalWatched = 0;
        let totalAvailable = 0;

        switch (mediaType) {
          case 'anime':
            totalWatched = details.episodes || 0;
            totalAvailable = essentialData.episodes || 0;
            break;

          case 'series':
            if (essentialData.episodesPerSeason?.length > 0) {
              const seasons = details.seasons || 1;
              const episodes = details.episodes || 0;

              // Calcular episódios assistidos
              for (let i = 0; i < seasons - 1; i++) {
                totalWatched += essentialData.episodesPerSeason[i] || 0;
              }
              totalWatched += episodes;

              // Calcular total de episódios disponíveis
              for (let i = 0; i < essentialData.episodesPerSeason.length; i++) {
                totalAvailable += essentialData.episodesPerSeason[i] || 0;
              }
            } else {
              totalWatched = details.episodes || 0;
              totalAvailable = essentialData.episodes || 0;
            }
            break;
          case 'game':
            totalWatched = details.hours || 0;
            totalAvailable = 0;
            break;

          case 'manga':
            totalWatched = details.chapters || 0;
            totalAvailable = essentialData.chapters || 0;
            break;
        }

        return { totalWatched, totalAvailable };
      };

      // Atualização otimista: atualiza o estado local ANTES da requisição
      const { totalWatched, totalAvailable } = calculateTotalProgress({
        ...progressDetails,
        ...updatedDetails
      });

      const optimisticUpdate = {
        ...currentItem,
        progress: {
          ...currentItem.progress,
          details: {
            ...progressDetails,
            ...updatedDetails
          },
          current: totalWatched,
          total: totalAvailable,
          unit: mediaType === 'manga' ? 'chapters' : 'eps',
          lastUpdated: new Date()
        },
        ...(shouldMarkAsCompleted && { status: 'completed' })
      };

      // Atualiza localmente imediatamente
      set(state => ({
        userMedia: state.userMedia.map(item =>
          item._id === userMediaId ? optimisticUpdate : item
        )
      }));

      // ✅ CORREÇÃO: Criar payload limpo para o backend
      const progressPayload = {
        lastUpdated: new Date(),
        details: get().cleanPayload({
          ...progressDetails,
          ...updatedDetails
        })
      };

      // Remover campos vazios do payload de progresso
      const cleanProgressPayload = get().cleanPayload(progressPayload);
      
      // ✅ CORREÇÃO: Usar função createProgressPayload para consistência
      const finalProgressPayload = Object.keys(cleanProgressPayload.details || {}).length > 0 
        ? cleanProgressPayload 
        : undefined;

      const updatePayload = get().cleanPayload({
        progress: finalProgressPayload,
        mediaType: mediaType,
        ...(shouldMarkAsCompleted && { status: 'completed' })
      });

      // Faz a requisição ao backend em segundo plano
      const response = await fetch(`/api/user/media/${userMediaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na resposta:', errorData);

        // Reverte a atualização otimista em caso de erro
        set(state => ({
          userMedia: state.userMedia.map(item =>
            item._id === userMediaId ? currentItem : item // Restaura o item original
          )
        }));

        throw new Error(errorData.error || 'Failed to update progress');
      }

      const updatedMedia = await response.json();

      // Atualiza com os dados reais do servidor
      set(state => ({
        userMedia: state.userMedia.map(item =>
          item._id === userMediaId ? updatedMedia : item
        )
      }));
      return updatedMedia;

    } catch (error) {
      console.error('Erro ao aumentar progresso:', error);
      toast.error('Erro ao atualizar progresso: ' + error.message);
      throw error;
    }
  },
}));

export { useMediaStore };