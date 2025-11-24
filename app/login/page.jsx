'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button, Card, CardContent, CardHeader, Input } from '@/components/ui';
import { Mail, Lock, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const success = await login(data.email, data.password);
    
    if (success) {
      router.push('/dashboard');
    } else {
      setError('root', {
        message: 'Email ou senha inválidos',
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
          Entre na sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            crie uma nova conta
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 text-center">
              Login
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
                placeholder="Sua senha"
                error={errors.password?.message}
                {...register('password')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center mb-2">
                <strong>Demo:</strong> Use qualquer email e senha
              </p>
              <div className="text-xs text-gray-500 text-center space-y-1">
                <p>Email: demo@entertrack.com</p>
                <p>Senha: qualquer senha funciona</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}