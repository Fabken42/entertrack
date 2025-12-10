'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { AlertTriangle, Home, LogIn } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages = {
    OAuthSignin: 'Erro ao iniciar autenticação social',
    OAuthCallback: 'Erro no callback da autenticação social',
    OAuthCreateAccount: 'Não foi possível criar conta social',
    EmailCreateAccount: 'Não foi possível criar conta com email',
    Callback: 'Erro no callback',
    OAuthAccountNotLinked: 'Email já cadastrado com outro método',
    EmailSignin: 'Erro ao enviar email de verificação',
    CredentialsSignin: 'Email ou senha incorretos',
    SessionRequired: 'Você precisa estar logado para acessar esta página',
    default: 'Erro de autenticação',
  };

  const errorMessage = errorMessages[error] || errorMessages.default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Erro de Autenticação</h1>
          <p className="text-gray-400">{errorMessage}</p>
        </div>

        <div className="space-y-4">
          <Link href="/login">
            <Button variant="gradient" className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Voltar para página inicial
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            Se o problema persistir, entre em contato com o suporte.
          </p>
        </div>
      </div>
    </div>
  );
}