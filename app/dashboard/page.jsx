// /dashboard/page.jsx
'use client';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { useAuth } from '@/lib/hooks/use-auth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto min-h-screen">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Olá, {user?.name || 'convidado'}! 👋
            </h1>
            <p className="text-gray-300 mt-2">
              Bem-vindo de volta! Aqui está o resumo dos seus entretenimentos.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card variant="elevated">
              <CardHeader>
                <h3 className="text-sm font-medium text-gray-400">Total de Itens</h3>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">24</p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <h3 className="text-sm font-medium text-gray-400">Em Progresso</h3>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-400">8</p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <h3 className="text-sm font-medium text-gray-400">Concluídos</h3>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-400">12</p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <h3 className="text-sm font-medium text-gray-400">Planejados</h3>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-400">4</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card variant="elevated">
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">Atividade Recente</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-400 text-center py-8">
                  Em breve: Sua atividade recente aparecerá aqui
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}