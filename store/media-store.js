import { create } from 'zustand';
import { mockMedia } from '@/lib/mock-data';

export const useMediaStore = create((set, get) => ({
  // Estado inicial
  media: mockMedia,
  loading: false,
  error: null,
  
  // Ações
  addMedia: (newMedia) => set((state) => ({
    media: [...state.media, {
      ...newMedia,
      id: `media-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }]
  })),
  
  updateMedia: (id, updates) => set((state) => ({
    media: state.media.map(item =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date() }
        : item
    )
  })),
  
  deleteMedia: (id) => set((state) => ({
    media: state.media.filter(item => item.id !== id)
  })),
  
  setMediaStatus: (id, status) => {
    const updates = { status };
    
    if (status === 'completed') {
      updates.finishedAt = new Date();
    } else if (status === 'in_progress' && !get().getMediaById(id)?.startedAt) {
      updates.startedAt = new Date();
    }
    
    get().updateMedia(id, updates);
  },
  
  setMediaRating: (id, rating) => {
    get().updateMedia(id, { rating });
  },
  
  setMediaProgress: (id, progress) => {
    get().updateMedia(id, { progress });
  },
  
  // Getters
  getMediaByType: (type) => {
    return get().media.filter(item => item.mediaType === type);
  },
  
  getMediaByStatus: (status) => {
    return get().media.filter(item => item.status === status);
  },
  
  getMediaById: (id) => {
    return get().media.find(item => item.id === id);
  }
}));