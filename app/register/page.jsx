'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button, Card, CardContent, CardHeader, Input } from '@/components/ui';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    const success = await registerUser(data.name, data.email, data.password);
    
    if (success) {
      router.push('/dashboard');
    } else {
      setError('root', {
        message: 'Erro ao criar conta. Tente novamente.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">ET</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Crie sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            entre na sua conta existente
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 text-center">
              Registro
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errors.root && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">
                    {errors.root.message}
                  </p>
                </div>
              )}

              <Input
                label="Nome completo"
                type="text"
                icon={User}
                placeholder="Seu nome"
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email"
                type="email"
                icon={Mail}
                placeholder="seu@email.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Senha"
                type="password"
                icon={Lock}
                placeholder="Mínimo 6 caracteres"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirmar senha"
                type="password"
                icon={Lock}
                placeholder="Digite novamente sua senha"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}