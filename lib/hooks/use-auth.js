'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth-store';

export function useAuth() {
  // Verificar se estamos no client side
  const isClient = typeof window !== 'undefined';
  
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { user, setUser, clearUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Função de registro
  const registerUser = async (name, email, password) => {
    if (!isClient) return false;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      // Após registro bem-sucedido, fazer login automático
      const loginResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (loginResult?.error) {
        throw new Error(loginResult.error);
      }

      toast.success('Conta criada com sucesso!');
      router.push('/dashboard');
      router.refresh();
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Erro ao criar conta');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de login com credenciais
  const loginWithCredentials = async (email, password) => {
    if (!isClient) return false;
    
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success('Login realizado com sucesso!');
      router.push('/dashboard');
      router.refresh();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // Mensagens de erro mais amigáveis
      if (error.message.includes('social')) {
        toast.error('Esta conta usa login social. Use o botão do Google.');
      } else {
        toast.error(error.message || 'Email ou senha incorretos');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de login com Google
  const loginWithGoogle = async () => {
    if (!isClient) return;
    
    setIsLoading(true);
    try {
      await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: true,
      });
    } catch (error) {
      console.error('Google login error:', error);
      
      if (error.message?.includes('OAuthCallback')) {
        toast.error('Erro na autenticação com Google. Tente novamente.');
      } else {
        toast.error('Erro ao fazer login com Google');
      }
      
      setIsLoading(false);
      throw error;
    }
  };

  // Função de logout
  const logout = async () => {
    if (!isClient) return;
    
    setIsLoading(true);
    try {
      await signOut({
        redirect: false,
        callbackUrl: '/',
      });
      clearUser();
      toast.success('Logout realizado com sucesso!');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar estado do usuário na store
  useEffect(() => {
    if (!isClient) return;
    
    if (session?.user) {
      setUser(session.user);
    } else {
      clearUser();
    }
  }, [session, setUser, clearUser, isClient]);

  // Retornar valores seguros para SSR
  if (!isClient) {
    return {
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      status: 'loading',
      registerUser: async () => false,
      loginWithCredentials: async () => false,
      loginWithGoogle: async () => {},
      logout: async () => {},
      updateSession: async () => {},
    };
  }

  return {
    // Estado
    user: session?.user || user,
    session,
    isLoading: isLoading || status === 'loading',
    isAuthenticated: status === 'authenticated',
    status,
    
    // Ações
    registerUser,
    loginWithCredentials,
    loginWithGoogle,
    logout,
    updateSession: update,
  };
}