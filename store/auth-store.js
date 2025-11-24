import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUser } from '@/lib/mock-data';

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock login - em produção, validaria com backend
        if (email && password) {
          set({ 
            user: mockUser,
            isAuthenticated: true,
            isLoading: false 
          });
          return true;
        }
        
        set({ isLoading: false });
        return false;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false
        });
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (name && email && password) {
          const newUser = {
            id: `user-${Date.now()}`,
            email,
            name,
            createdAt: new Date()
          };
          
          set({ 
            user: newUser,
            isAuthenticated: true,
            isLoading: false 
          });
          return true;
        }
        
        set({ isLoading: false });
        return false;
      }
    }),
    {
      name: 'auth-storage', // nome da chave no localStorage
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);