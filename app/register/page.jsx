'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button, Card, CardContent, CardHeader, Input } from '@/components/ui';
import { User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(50, 'Senha muito longa'),
  confirmPassword: z.string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, isLoading } = useAuth();
  const [apiError, setApiError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (formData) => {
    setApiError('');
    
    try {
      const success = await registerUser(
        formData.name.trim(),
        formData.email.toLowerCase().trim(),
        formData.password
      );
      
      if (success) {
        toast.success('Conta criada com sucesso!');
        // O hook já redireciona, não precisa fazer aqui
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Tratar erros específicos da API
      if (error.message.includes('já cadastrado')) {
        setError('email', {
          type: 'manual',
          message: 'Este email já está cadastrado',
        });
        toast.error('Este email já está cadastrado');
      } else if (error.message.includes('senha')) {
        setError('password', {
          type: 'manual',
          message: error.message,
        });
      } else {
        setApiError(error.message || 'Erro ao criar conta. Tente novamente.');
        toast.error('Erro ao criar conta');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">ET</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              EnterTrack
            </span>
          </Link>
        </div>
        <h2 className="mt-8 text-center text-3xl font-extrabold text-white">
          Crie sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Junte-se à comunidade e organize seu entretenimento
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card variant="glass" className="backdrop-blur-sm bg-white/5 border border-white/10">
          <CardHeader>
            <h3 className="text-xl font-semibold text-center text-white">
              Cadastrar-se
            </h3>
          </CardHeader>
          <CardContent>
            {/* Mensagem de erro da API */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Nome completo"
                type="text"
                icon={User}
                placeholder="Seu nome"
                error={errors.name?.message}
                disabled={isLoading || isSubmitting}
                {...register('name')}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />

              <Input
                label="Email"
                type="email"
                icon={Mail}
                placeholder="seu@email.com"
                error={errors.email?.message}
                disabled={isLoading || isSubmitting}
                {...register('email')}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />

              <Input
                label="Senha"
                type="password"
                icon={Lock}
                placeholder="Mínimo 6 caracteres"
                error={errors.password?.message}
                disabled={isLoading || isSubmitting}
                {...register('password')}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />

              <Input
                label="Confirmar senha"
                type="password"
                icon={Lock}
                placeholder="Digite novamente sua senha"
                error={errors.confirmPassword?.message}
                disabled={isLoading || isSubmitting}
                {...register('confirmPassword')}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  loading={isLoading || isSubmitting}
                  disabled={isLoading || isSubmitting}
                  className="w-full h-12 text-base font-medium"
                >
                  {isLoading || isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar conta'
                  )}
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-400">
                  Já tem uma conta?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Entre aqui
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Termos e condições */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Ao se registrar, você concorda com nossos{' '}
            <a href="/terms" className="text-gray-400 hover:text-gray-300 underline">
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a href="/privacy" className="text-gray-400 hover:text-gray-300 underline">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}