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

    if (!details.percentage) {
      details.percentage = progressData.percentage || 0;
    }

    const progressPayload = {
      details: details,
      lastUpdated: new Date()
    };
    if (progressData.tasks !== undefined) {
      progressPayload.tasks = progressData.tasks;
    }

    return progressPayload;
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

    // Para entradas manuais, usar imagem placeholder
    const coverImage = sourceApi === 'manual'
      ? '/images/icons/placeholder-image.png'
      : mediaData.imageUrl || '';

    const cachePayload = {
      sourceApi: sourceApi,
      sourceId: sourceId,
      mediaType: mediaType,
      essentialData: {
        title: mediaData.title || 'Título não disponível',
        description: mediaData.description || '',
        category: mediaData.category, //para anime/manga
        coverImage: coverImage,
        releaseYear: mediaData.releaseYear || null,
        runtime: mediaData.runtime || null,
        episodes: mediaData.episodes || null,
        seasons: mediaData.seasons || null,
        episodesPerSeason: mediaData.episodesPerSeason || null,
        volumes: mediaData.volumes || null,
        chapters: mediaData.chapters || null,
        platforms: mediaData.platforms || [],
        hours: mediaData.hours || null,
        metacritic: mediaData.metacritic || null,
        genres: Array.isArray(mediaData.genres)
          ? mediaData.genres.map(g => {
            if (typeof g === 'string') {
              const genreObj = JikanClient.getAllGenres().find(genre => genre.id === g);
              return {
                id: g,
                name: genreObj?.name || g
              };
            }
            // Se for objeto (de dados externos)
            if (typeof g === 'object') {
              return {
                id: g.id?.toString() || g.name.toLowerCase().replace(/\s+/g, '-'),
                name: g.name
              };
            }
            // Se for string simples
            return {
              id: g.toLowerCase().replace(/\s+/g, '-'),
              name: g
            };
          })
          : [],
        averageRating: mediaData.apiRating || null,
        ratingCount: mediaData.apiVoteCount || null,
        popularity: mediaData.popularity || null,
        members: mediaData.members || null,
        studios: mediaData.studios || [],
        authors: mediaData.authors || [],
      }
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

    const progressPayload = {
      details: {
        hours: mediaData.progress?.details?.hours || 0,
        episodes: mediaData.progress?.details?.episodes || 0,
        seasons: mediaData.progress?.details?.seasons || 0,
        chapters: mediaData.progress?.details?.chapters || 0,
        volumes: mediaData.progress?.details?.volumes || 0,
        pages: mediaData.progress?.details?.pages || 0,
        minutes: mediaData.progress?.details?.minutes || 0,
        percentage: mediaData.progress?.details?.percentage || 0
      },
      tasks: mediaData.progress?.tasks || [],
      lastUpdated: new Date()
    };

    if (mediaData.status === 'completed') {
      progressPayload.details.hours = mediaData.hours || mediaData.progress?.details?.hours || 0;
    }

    const userMediaPayload = {
      mediaCacheId: cacheResult.cacheId,
      status: mediaData.status || 'planned',
      userRating: mediaData.userRating || null,
      personalNotes: mediaData.personalNotes || '',
      progress: progressPayload || {
        details: {},
        lastUpdated: new Date()
      },
      ...(mediaData.status === 'in_progress' && { startedAt: new Date() }),
      ...(mediaData.status === 'completed' && { completedAt: new Date() }),
      ...(mediaData.status === 'dropped' && { droppedAt: new Date() })
    };

    if (mediaData.status === 'completed' && !progressPayload) {
      const completedProgressData = {};

      switch (mediaType) {
        case 'anime':
          completedProgressData.episodes = mediaData.episodes || 0;
          completedProgressData.percentage = 100;
          break;
        case 'series':
          completedProgressData.episodes = mediaData.episodes || 0;
          completedProgressData.seasons = mediaData.seasons || 1;
          completedProgressData.percentage = 100;
          break;
        case 'manga':
          completedProgressData.chapters = mediaData.chapters || 0;
          completedProgressData.volumes = mediaData.volumes || 0;
          completedProgressData.percentage = 100;
          break;
        case 'game':
          completedProgressData.hours = mediaData.hours || 0;
          if (mediaData.progress?.tasks) {
            completedProgressData.tasks = mediaData.progress.tasks;
          }
          completedProgressData.percentage = 100;
          break;
        case 'movie':
          completedProgressData.minutes = mediaData.minutes || 0;
          completedProgressData.percentage = 100;
          break;
      }

      userMediaPayload.progress = get().createProgressPayload(completedProgressData, mediaType);
    }

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

  updateMedia: async (userMediaId, updateData) => {
    try {
      // Busca a mídia atual para pegar as tasks existentes
      const currentMedia = get().userMedia.find(media => media._id === userMediaId);
      const existingTasks = currentMedia?.progress?.tasks || [];

      const progressPayload = get().createProgressPayload(
        {
          ...updateData?.progress?.details,
          hours: updateData?.progress?.details?.hours,
          // Passa as tasks do updateData ou mantém as existentes
          tasks: updateData?.progress?.tasks || existingTasks
        },
        updateData.mediaType
      );

      const updatePayload = {
        status: updateData.status,
        userRating: updateData.userRating || null,
        personalNotes: updateData.personalNotes || '',
        progress: progressPayload,
        ...(updateData.startedAt && { startedAt: updateData.startedAt }),
        ...(updateData.completedAt && { completedAt: updateData.completedAt }),
        ...(updateData.droppedAt && { droppedAt: updateData.droppedAt }),
        ...(updateData.category && { category: updateData.category })
      };

      // Remove campos undefined
      Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] === undefined) {
          delete updatePayload[key];
        }
      });

      const response = await fetch(`/api/user/media/${userMediaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
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

      // Cria payload para o backend
      const progressPayload = {
        lastUpdated: new Date(),
        current: totalWatched,
        total: totalAvailable,
        unit: mediaType === 'manga' ? 'chapters' : 'eps',
        details: {
          ...progressDetails,
          ...updatedDetails
        }
      };

      const updatePayload = {
        progress: progressPayload,
        mediaType: mediaType
      };

      if (shouldMarkAsCompleted) {
        updatePayload.status = 'completed';
      }

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

      // // Mensagem de sucesso
      // let successMessage = 'Progresso atualizado!';

      // if (mediaType === 'anime') {
      //   successMessage = `Episódio ${updatedDetails.episodes} marcado como assistido!`;
      //   if (shouldMarkAsCompleted) {
      //     successMessage = 'Parabéns! Você completou este anime!';
      //   }
      // } else if (mediaType === 'series') {
      //   const newSeason = updatedDetails.seasons || currentSeasons;
      //   const newEpisode = updatedDetails.episodes || 0;

      //   if (shouldMarkAsCompleted) {
      //     successMessage = 'Parabéns! Você completou esta série!';
      //   } else if (updatedDetails.seasons > (progressDetails.seasons || 1)) {
      //     successMessage = `Avançou para a Temporada ${newSeason}, Episódio 1!`;
      //   } else {
      //     successMessage = `Temporada ${newSeason}, Episódio ${newEpisode} marcado como assistido!`;
      //   }
      // } else if (mediaType === 'manga') {
      //   successMessage = `Capítulo ${updatedDetails.chapters} marcado como lido!`;
      //   if (shouldMarkAsCompleted) {
      //     successMessage = 'Parabéns! Você completou este mangá!';
      //   }
      // }

      // toast.success(successMessage);
      return updatedMedia;

    } catch (error) {
      console.error('Erro ao aumentar progresso:', error);
      toast.error('Erro ao atualizar progresso: ' + error.message);
      throw error;
    }
  },
}));

export { useMediaStore };