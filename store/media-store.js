// /store/media-store.js
'use client';

import { create } from 'zustand';
import toast from 'react-hot-toast';
import { JikanClient } from '@/lib/api/jikan';

const useMediaStore = create((set, get) => ({
  userMedia: [],
  isLoading: false,
  error: null,

  // Buscar mídia do usuário
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

  addMedia: async (mediaData) => {
    // Para entradas manuais, gerar um externalId se não existir
    if (!mediaData.externalId && mediaData.sourceApi === 'manual') {
      mediaData.externalId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (!mediaData.externalId) {
      toast.error('Erro interno: ID da mídia não encontrado');
      throw new Error('externalId é obrigatório para cache');
    }

    try {
      const sourceId = mediaData.externalId.toString();
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
          coverImage: coverImage,
          backdropImage: '',
          releaseYear: mediaData.releaseYear || null,
          status: 'finished',
          episodes: mediaData.episodes || null,
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
          source: sourceApi,
          externalId: sourceId
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
      // Agora criar a UserMedia
      const userMediaPayload = {
        mediaCacheId: cacheResult.cacheId,
        status: mediaData.status || 'planned',
        userRating: mediaData.userRating || null,
        personalNotes: mediaData.personalNotes || '',
        progress: mediaData.progress ? {
          current: mediaData.progress.currentEpisode || mediaData.progress.current || 0,
          unit: 'episodes',
          lastUpdated: new Date()
        } : undefined,
        ...(mediaData.status === 'in_progress' && { startedAt: new Date() }),
        ...(mediaData.status === 'completed' && { completedAt: new Date() }),
        ...(mediaData.status === 'dropped' && { droppedAt: new Date() })
      };

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

    } catch (error) {
      console.error('Error adding media:', error);
      throw error;
    }
  },

  updateMedia: async (userMediaId, updateData) => {
    try {
      // Preparar o payload para atualização
      const updatePayload = {
        status: updateData.status,
        userRating: updateData.userRating || null,
        personalNotes: updateData.personalNotes || '',
        progress: updateData.progress ? {
          current: updateData.progress.currentEpisode || updateData.progress.current || 0,
          unit: updateData.mediaType === 'anime' ? 'episodes' :
            updateData.mediaType === 'manga' ? 'chapters' : 'pages',
          lastUpdated: new Date()
        } : undefined,
        // Datas específicas se fornecidas
        ...(updateData.startedAt && { startedAt: updateData.startedAt }),
        ...(updateData.completedAt && { completedAt: updateData.completedAt }),
        ...(updateData.droppedAt && { droppedAt: updateData.droppedAt })
      };

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

  // Método para atualizar rating diretamente
  updateRating: async (userMediaId, rating) => {
    try {
      // Garantir que o rating seja um número válido
      const normalizedRating = typeof rating === 'number'
        ? Math.max(1, Math.min(5, rating))
        : null;

      const response = await fetch(`/api/user/media/${userMediaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRating: normalizedRating
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update rating');
      }

      const updatedMedia = await response.json();

      // Atualizar store local
      set(state => ({
        userMedia: state.userMedia.map(media =>
          media._id === userMediaId ? updatedMedia : media
        )
      }));

      toast.success('Avaliação atualizada com sucesso!');
      return updatedMedia;

    } catch (error) {
      console.error('Error updating rating:', error);
      toast.error('Erro ao atualizar avaliação: ' + error.message);
      throw error;
    }
  }
}));

export { useMediaStore };