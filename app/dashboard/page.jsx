// /dashboard/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { useSession } from 'next-auth/react';
import {
  Film,
  Tv,
  BookOpen,
  GamepadIcon,
  Sparkles,
  TrendingUp,
  Calendar,
  Star,
  Clock,
  CheckCircle,
  PlayCircle,
  CalendarDays,
  XCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils/general-utils';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activity')
      ]);

      if (!statsResponse.ok || !activityResponse.ok) {
        throw new Error('Erro ao carregar dados do dashboard');
      }

      const statsData = await statsResponse.json();
      const activityData = await activityResponse.json();

      setStats(statsData.data);
      setRecentActivity(activityData.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString('pt-BR');
  };

  const getMediaTypeIcon = (type) => {
    switch (type) {
      case 'movie': return Film;
      case 'series': return Tv;
      case 'anime': return Tv;
      case 'manga': return BookOpen;
      case 'book': return BookOpen;
      case 'game': return GamepadIcon;
      default: return Sparkles;
    }
  };

  const getMediaTypeLabel = (type) => {
    switch (type) {
      case 'movie': return 'Filmes';
      case 'series': return 'Séries';
      case 'anime': return 'Animes';
      case 'manga': return 'Mangás';
      case 'book': return 'Livros';
      case 'game': return 'Jogos';
      default: return type;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return PlayCircle;
      case 'planned': return CalendarDays;
      case 'dropped': return XCircle;
      default: return Sparkles;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-emerald-400';
      case 'in_progress': return 'text-blue-400';
      case 'planned': return 'text-yellow-400';
      case 'dropped': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 border-emerald-500/30';
      case 'in_progress': return 'bg-blue-500/20 border-blue-500/30';
      case 'planned': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'dropped': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours} h atrás`;
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto min-h-screen">
          <div className="animate-pulse space-y-8">
            <div>
              <div className="h-10 bg-gray-700 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-96"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
              ))}
            </div>

            <div className="h-64 bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto min-h-screen">
          <div className="text-center py-12 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-700/20 to-gray-800/20 rounded-full border border-white/10">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Bem-vindo ao EnterTrack! 🎬
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Faça login para acompanhar seus filmes, séries, animes, mangás, livros e jogos em um só lugar!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Olá, {session?.user?.name || 'Usuário'}! 👋
              </h1>
              <p className="text-gray-300 mt-2">
                {stats
                  ? `Você tem ${formatNumber(stats.total)} itens na sua coleção`
                  : 'Bem-vindo de volta! Aqui está o resumo dos seus entretenimentos.'
                }
              </p>
            </div>

            <button
              onClick={fetchDashboardData}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                "bg-white/5 hover:bg-white/10 border border-white/10",
                loading && "opacity-50 cursor-not-allowed"
              )}
              disabled={loading}
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              Atualizar
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" className="hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-400">Total de Itens</h3>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">
                {stats ? formatNumber(stats.total) : '0'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {stats?.byType?.slice(0, 2).map(type =>
                  `${getMediaTypeLabel(type._id)}: ${type.count}`
                ).join(' • ') || 'Comece adicionando itens!'}
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" className="hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-400">Em Progresso</h3>
                <PlayCircle className="w-4 h-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-400">
                {stats ? formatNumber(stats.inProgress) : '0'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {stats?.progress?.length
                  ? `${stats.progress.length} tipos de mídia em andamento`
                  : 'Nenhum item em progresso'
                }
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" className="hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-400">Concluídos</h3>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-400">
                {stats ? formatNumber(stats.completed) : '0'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {stats?.completed > 0
                  ? `${Math.round((stats.completed / stats.total) * 100)}% da sua coleção`
                  : 'Complete seu primeiro item!'
                }
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" className="hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-400">Planejados</h3>
                <CalendarDays className="w-4 h-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-400">
                {stats ? formatNumber(stats.planned) : '0'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {stats?.byType?.find(t => t._id === 'movie')?.planned || 0} filmes • {stats?.byType?.find(t => t._id === 'series')?.planned || 0} séries
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seção de estatísticas por tipo */}
        {stats?.byType && stats.byType.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Por Tipo de Mídia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.byType.map((type) => {
                const Icon = getMediaTypeIcon(type._id);
                return (
                  <Card key={type._id} variant="glass" className="hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/5 rounded-lg">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">
                              {getMediaTypeLabel(type._id)}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {formatNumber(type.count)} itens
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Em progresso</span>
                          <span className="font-medium text-blue-400">{type.inProgress}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Concluídos</span>
                          <span className="font-medium text-emerald-400">{type.completed}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Planejados</span>
                          <span className="font-medium text-yellow-400">{type.planned}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <Card variant="elevated" className="hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Atividade Recente</h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const StatusIcon = getStatusIcon(activity.status);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex-shrink-0">
                        {activity.imageUrl ? (
                          <img
                            src={activity.imageUrl}
                            alt={activity.title}
                            className="w-12 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">{activity.icon}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                          {activity.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                            getStatusBgColor(activity.status)
                          )}>
                            <StatusIcon className="w-3 h-3" />
                            <span className={getStatusColor(activity.status)}>
                              {activity.action}
                            </span>
                          </div>

                          {activity.rating && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800/50 rounded-full text-xs">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-white">{activity.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {formatTime(activity.time)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.time).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-full">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Nenhuma atividade recente
                  </h3>
                  <p className="text-gray-400">
                    Adicione seus primeiros itens para começar a acompanhar sua jornada!
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Footer */}
        {stats && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-gray-400">Horas Jogadas</p>
              <p className="text-xl font-bold text-white mt-1">
                {stats.progress?.find(p => p._id === 'game')?.totalHours?.toFixed(1) || '0'}h
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-gray-400">Favoritos</p>
              <p className="text-xl font-bold text-white mt-1">
                {formatNumber(stats.favorites)}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-gray-400">Abandonados</p>
              <p className="text-xl font-bold text-red-400 mt-1">
                {formatNumber(stats.dropped)}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-gray-400">Atualizado</p>
              <p className="text-sm text-gray-300 mt-1">
                {stats.lastUpdated
                  ? formatTime(stats.lastUpdated)
                  : 'Agora mesmo'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}