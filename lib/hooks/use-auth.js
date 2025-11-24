'use client';
import { useAuthStore } from '@/store/auth-store';

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    register 
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register
  };
};