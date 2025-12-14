// /store/media-store.js (atualizado)
import { create } from 'zustand';

export const useMediaStore = create((set, get) => ({
  // Estado inicial
  media: [],
  loading: false,
  error: null,
  
  // Inicializar store com dados do backend
  initializeStore: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/media');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      set({ media: data.data || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Erro ao inicializar store:', error);
    }
  },

  // Buscar mídias do backend por tipo
  fetchMediaByType: async (mediaType) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/media?mediaType=${mediaType}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      // Atualizar apenas mídias do tipo especificado, mantendo outras
      set(state => {
        const otherMedia = state.media.filter(item => item.mediaType !== mediaType);
        return {
          media: [...otherMedia, ...(data.data || [])],
          loading: false
        };
      });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Ações assíncronas para API
  addMedia: async (newMedia) => {
    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedia),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      // Atualizar estado local
      set(state => ({
        media: [...state.media, data.data]
      }));
      
      return data.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  updateMedia: async (id, updates) => {
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      // Atualizar estado local
      set(state => ({
        media: state.media.map(item => 
          item._id === id ? { ...item, ...data.data } : item
        )
      }));
      
      return data.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  deleteMedia: async (id) => {
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      // Atualizar estado local
      set(state => ({
        media: state.media.filter(item => item._id !== id)
      }));
      
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  // Funções de conveniência (compatibilidade com código existente)
  setMediaStatus: async (id, status) => {
    const updates = { status };
    const mediaItem = get().getMediaById(id);
    
    // Atualizar timeline baseado no status
    const timelineUpdates = {};
    
    if (status === 'completed' && !mediaItem?.timeline?.completedAt) {
      timelineUpdates.completedAt = new Date();
    } else if (status === 'in_progress' && !mediaItem?.timeline?.startedAt) {
      timelineUpdates.startedAt = new Date();
    } else if (status === 'dropped' && !mediaItem?.timeline?.droppedAt) {
      timelineUpdates.droppedAt = new Date();
    }
    
    if (Object.keys(timelineUpdates).length > 0) {
      updates.timeline = { ...mediaItem?.timeline, ...timelineUpdates };
    }
    
    return get().updateMedia(id, updates);
  },
  
  setMediaRating: async (id, rating) => {
    const ratingValue = typeof rating === 'string' 
      ? { value: rating, score: mapRatingToScore(rating) }
      : rating;
    
    return get().updateMedia(id, { rating: ratingValue });
  },
  
  setMediaProgress: async (id, progress) => {
    return get().updateMedia(id, { progress });
  },
  
  // Getters (compatibilidade com código existente)
  getMediaByType: (type) => {
    return get().media.filter(item => item.mediaType === type);
  },
  
  getMediaByStatus: (status) => {
    return get().media.filter(item => item.status === status);
  },
  
  getMediaById: (id) => {
    return get().media.find(item => item._id === id || item.id === id);
  },

  // Métodos auxiliares para estatísticas
  getStats: () => {
    const media = get().media;
    return {
      total: media.length,
      planned: media.filter(m => m.status === 'planned').length,
      inProgress: media.filter(m => m.status === 'in_progress').length,
      completed: media.filter(m => m.status === 'completed').length,
      dropped: media.filter(m => m.status === 'dropped').length,
      favorites: media.filter(m => m.isFavorite).length,
    };
  },

  // Método para buscar mídias com filtros avançados
  getFilteredMedia: (filters = {}) => {
    let filtered = [...get().media];
    
    if (filters.mediaType) {
      filtered = filtered.filter(item => item.mediaType === filters.mediaType);
    }
    
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.genres?.some(genre => genre.toLowerCase().includes(query))
      );
    }
    
    if (filters.isFavorite) {
      filtered = filtered.filter(item => item.isFavorite);
    }
    
    return filtered;
  }
}));

// Função auxiliar para mapear rating para score
function mapRatingToScore(rating) {
  const ratingMap = {
    'terrible': 1,
    'bad': 2,
    'ok': 3,
    'good': 4,
    'perfect': 5,
  };
  return ratingMap[rating] || 3;
}