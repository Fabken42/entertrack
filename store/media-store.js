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
      case 'book':
        if (progressData.pages !== undefined) details.pages = progressData.pages;
        break;
      case 'movie':
        if (progressData.minutes !== undefined) details.minutes = progressData.minutes;
        break;
    }

    if (!details.percentage) {
      details.percentage = progressData.percentage || 0;
    }

    if (Object.keys(details).length === 0) {
      return undefined;
    }

    return {
      details: details,
      lastUpdated: new Date()
    };
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
    const sourceApi = mediaData.sourceApi || 'jikan';
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
        status: 'finished',
        episodes: mediaData.episodes || null,
        seasons: mediaData.seasons || null,
        episodesPerSeason: mediaData.episodesPerSeason || null,
        volumes: mediaData.volumes || null,
        chapters: mediaData.chapters || null,
        platforms: mediaData.platforms || [], // Para jogos
        genres: Array.isArray(mediaData.genres)
          ? mediaData.genres.map(g => {
            // Se for entrada manual, g é um ID de gênero (string)
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

    // Primeiro, verificar/criar cache da mídia
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

    // Preparar progresso com a nova estrutura usando o helper
    const progressPayload = get().createProgressPayload(mediaData.progress, mediaType);

    const userMediaPayload = {
      mediaCacheId: cacheResult.cacheId,
      status: mediaData.status || 'planned',
      userRating: mediaData.userRating || null,
      personalNotes: mediaData.personalNotes || '',
      // ✅ SEMPRE usar o progresso que veio dos dados (se existir)
      progress: mediaData.progress || {
        details: {
          episodes: 0,
          chapters: 0,
          volumes: 0,
          percentage: 0
        },
        lastUpdated: new Date()
      },
      ...(mediaData.status === 'in_progress' && { startedAt: new Date() }),
      ...(mediaData.status === 'completed' && { completedAt: new Date() }),
      ...(mediaData.status === 'dropped' && { droppedAt: new Date() })
    };

    // Se for completed, calcular progresso para 100%
    if (mediaData.status === 'completed' && !progressPayload) {
      userMediaPayload.progress = get().createProgressPayload({
        episodes: mediaData.episodes || 0,
        chapters: mediaData.chapters || 0,
        volumes: mediaData.volumes || 0,
        percentage: 100
      }, mediaType);
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
      const progressPayload = get().createProgressPayload(updateData?.progress?.details, updateData.mediaType);

      // Preparar o payload para atualização
      const updatePayload = {
        status: updateData.status,
        userRating: updateData.userRating || null,
        personalNotes: updateData.personalNotes || '',
        progress: progressPayload,
        // Datas específicas se fornecidas
        ...(updateData.startedAt && { startedAt: updateData.startedAt }),
        ...(updateData.completedAt && { completedAt: updateData.completedAt }),
        ...(updateData.droppedAt && { droppedAt: updateData.droppedAt }),
        ...(updateData.category && { category: updateData.category })
      };

      // Remover campos undefined
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

  // Método para atualizar notas pessoais diretamente
  updatePersonalNotes: async (userMediaId, personalNotes) => {
    try {
      const response = await fetch(`/api/user/media/${userMediaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalNotes: personalNotes || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update notes');
      }

      const updatedMedia = await response.json();

      // Atualizar store local
      set(state => ({
        userMedia: state.userMedia.map(media =>
          media._id === userMediaId ? updatedMedia : media
        )
      }));

      toast.success('Notas atualizadas com sucesso!');
      return updatedMedia;

    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Erro ao atualizar notas: ' + error.message);
      throw error;
    }
  },


  // Novo método helper para formatar progresso para exibição
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
      // Adicione outros tipos conforme necessário
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
      let totalAvailable;
      let shouldMarkAsCompleted = false;

      // Calcula o novo progresso localmente primeiro
      switch (mediaType) {
        case 'anime':
        case 'series':
          const currentEpisodes = progressDetails.episodes || 0;
          const totalEpisodes = essentialData.episodes || 0;

          if (totalEpisodes > 0 && currentEpisodes >= totalEpisodes) {
            toast.success('Você já completou todos os episódios!');
            return currentItem;
          }

          updatedDetails = {
            episodes: currentEpisodes + 1
          };
          totalAvailable = totalEpisodes;

          if (totalEpisodes > 0 && (currentEpisodes + 1) >= totalEpisodes) {
            shouldMarkAsCompleted = true;
          }
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
          totalAvailable = totalChapters;

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

      // Atualização otimista: atualiza o estado local ANTES da requisição
      const optimisticUpdate = {
        ...currentItem,
        progress: {
          details: {
            ...progressDetails,
            ...updatedDetails
          },
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
      const progressPayload = get().createProgressPayload({
        ...progressDetails,
        ...updatedDetails
      }, mediaType);

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

      // Mensagem de sucesso
      let successMessage = 'Progresso atualizado!';
      if (mediaType === 'anime' || mediaType === 'series') {
        successMessage = `Episódio ${updatedDetails.episodes} marcado como assistido!`;
        if (shouldMarkAsCompleted) {
          successMessage = 'Parabéns! Você completou este anime!';
        }
      } else if (mediaType === 'manga') {
        successMessage = `Capítulo ${updatedDetails.chapters} marcado como lido!`;
        if (shouldMarkAsCompleted) {
          successMessage = 'Parabéns! Você completou este mangá!';
        }
      }

      toast.success(successMessage);
      return updatedMedia;

    } catch (error) {
      console.error('Erro ao aumentar progresso:', error);
      toast.error('Erro ao atualizar progresso: ' + error.message);
      throw error;
    }
  },
}));

export { useMediaStore };