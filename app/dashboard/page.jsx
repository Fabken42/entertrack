// app/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart as BarChartIcon,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Layers,
  Film,
  Tv,
  Gamepad2,
  BookOpen,
  Zap
} from 'lucide-react';
import Button from '@/components/ui/button/Button';

// Função para normalizar os dados da API
const normalizeMediaData = (data) => {
  // Se for array, já está no formato correto
  if (Array.isArray(data)) {
    return data;
  }

  // Se for o objeto de estatísticas da API /api/dashboard/stats
  if (data && typeof data === 'object' && data.byType) {
    // Converter os objetos byType e byStatus em arrays para processamento
    const normalized = [];

    // Processar cada tipo de mídia
    Object.entries(data.byType).forEach(([mediaType, count]) => {
      for (let i = 0; i < count; i++) {
        normalized.push({
          mediaType,
          status: getRandomStatusForType(data.byStatus)
        });
      }
    });

    // Distribuir status de forma proporcional
    distributeStatuses(normalized, data.byStatus);

    return normalized;
  }

  // Se não for nenhum dos formatos esperados, retornar array vazio
  return [];
};

// Função auxiliar para distribuir status proporcionalmente
const distributeStatuses = (items, statusCounts) => {
  const totalItems = items.length;
  const statuses = ['planned', 'in_progress', 'completed', 'dropped'];

  statuses.forEach(status => {
    const count = statusCounts[status] || 0;
    if (count > 0) {
      // Calcular quantos items devem ter este status
      const targetCount = Math.round((count / totalItems) * items.length);

      // Atribuir status aos itens que ainda não têm status
      let assigned = 0;
      for (let i = 0; i < items.length && assigned < targetCount; i++) {
        if (!items[i].status) {
          items[i].status = status;
          assigned++;
        }
      }
    }
  });

  // Atribuir status restantes
  items.forEach(item => {
    if (!item.status) {
      item.status = 'planned'; // Status padrão
    }
  });
};

// Função para obter um status aleatório baseado na distribuição
const getRandomStatusForType = (statusCounts) => {
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const rand = Math.random() * total;

  let cumulative = 0;
  for (const [status, count] of Object.entries(statusCounts)) {
    cumulative += count;
    if (rand < cumulative) {
      return status;
    }
  }

  return 'planned';
};

// Função para obter a cor baseada no tipo de mídia
const getMediaTypeColor = (mediaType) => {
  switch (mediaType) {
    case 'anime': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'movie': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'series': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'manga': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'game': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

// Função para obter a cor baseada no status
const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'planned': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'dropped': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mediaData, setMediaData] = useState([]);
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Tentar buscar da API otimizada primeiro
      let response = await fetch('/api/dashboard/stats');

      if (response.ok) {
        const stats = await response.json();
        setStatsData(stats);
        // Normalizar os dados para o formato que o gráfico espera
        const normalizedData = normalizeMediaData(stats);
        setMediaData(normalizedData);
      } else {
        // Fallback para API de user-media
        response = await fetch('/api/user-media');

        if (!response.ok) {
          throw new Error('Erro ao carregar dados');
        }

        const data = await response.json();
        setMediaData(data);
      }

      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  // Processar dados para os gráficos
  const processChartData = () => {
    if (!mediaData || mediaData.length === 0) {
      return {
        byType: [],
        byStatus: [],
        byGenre: [],
        total: 0,
        stats: {
          total: 0,
          planned: 0,
          inProgress: 0,
          completed: 0,
          dropped: 0
        }
      };
    }

    // Cores para os gráficos - atualizadas conforme solicitado
    const typeColors = {
      anime: '#ef4444',
      movie: '#06b6d4',
      series: '#10b981',
      manga: '#f97316',
      game: '#8b5cf6'
    };

    const statusColors = {
      planned: '#eab308', // Amarelo
      in_progress: '#3b82f6', // Azul
      completed: '#10b981', // Verde
      dropped: '#ef4444' // Vermelho
    };

    // Usar statsData se disponível (mais preciso)
    if (statsData && statsData.byType) {
      // Usar dados direto da API de stats
      const byTypeData = Object.entries(statsData.byType)
        .filter(([_, value]) => value > 0)
        .map(([type, count]) => ({
          name: formatTypeName(type),
          value: count,
          color: typeColors[type] || '#cccccc',
          rawName: type,
          icon: getTypeIcon(type)
        }));

      const byStatusData = Object.entries(statsData.byStatus || {})
        .filter(([_, value]) => value > 0)
        .map(([status, count]) => ({
          name: formatStatusName(status),
          value: count,
          color: statusColors[status] || '#cccccc',
          rawStatus: status,
          icon: getStatusIcon(status)
        }));

      // Processar gêneros se disponível
      const genreCount = {};
      if (Array.isArray(mediaData)) {
        mediaData.forEach(item => {
          const genres = item.mediaCacheId?.essentialData?.genres;
          if (Array.isArray(genres) && genres.length > 0) {
            genres.forEach(genre => {
              if (genre && genre.name) {
                genreCount[genre.name] = (genreCount[genre.name] || 0) + 1;
              }
            });
          }
        });
      }

      const byGenreData = Object.entries(genreCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, value]) => ({
          name,
          value,
          color: getRandomColor(name)
        }));

      return {
        byType: byTypeData,
        byStatus: byStatusData,
        byGenre: byGenreData,
        total: statsData.total || mediaData.length,
        stats: {
          total: statsData.total || mediaData.length,
          planned: statsData.byStatus?.planned || 0,
          inProgress: statsData.byStatus?.in_progress || 0,
          completed: statsData.byStatus?.completed || 0,
          dropped: statsData.byStatus?.dropped || 0
        }
      };
    }

    // Fallback: processar manualmente do mediaData
    const typeCount = {};
    const statusCount = {
      planned: 0,
      in_progress: 0,
      completed: 0,
      dropped: 0
    };
    const genreCount = {};

    mediaData.forEach(item => {
      // Contar por tipo
      const mediaType = item.mediaType || item.mediaCacheId?.mediaType;
      if (mediaType) {
        typeCount[mediaType] = (typeCount[mediaType] || 0) + 1;
      }

      // Contar por status
      if (item.status && statusCount[item.status] !== undefined) {
        statusCount[item.status] += 1;
      }

      // Contar por gênero (se disponível)
      const genres = item.mediaCacheId?.essentialData?.genres;
      if (Array.isArray(genres) && genres.length > 0) {
        genres.forEach(genre => {
          if (genre && genre.name) {
            genreCount[genre.name] = (genreCount[genre.name] || 0) + 1;
          }
        });
      }
    });

    // Converter para arrays formatados
    const byTypeData = Object.entries(typeCount)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({
        name: formatTypeName(name),
        value,
        color: typeColors[name] || '#cccccc',
        rawName: name,
        icon: getTypeIcon(name)
      }));

    const byStatusData = Object.entries(statusCount)
      .filter(([_, value]) => value > 0)
      .map(([status, count]) => ({
        name: formatStatusName(status),
        value: count,
        color: statusColors[status] || '#cccccc',
        rawStatus: status,
        icon: getStatusIcon(status)
      }));

    // Top 10 gêneros mais comuns
    const byGenreData = Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({
        name,
        value,
        color: getRandomColor(name)
      }));

    return {
      byType: byTypeData,
      byStatus: byStatusData,
      byGenre: byGenreData,
      total: mediaData.length,
      stats: {
        total: mediaData.length,
        planned: statusCount.planned,
        inProgress: statusCount.in_progress,
        completed: statusCount.completed,
        dropped: statusCount.dropped
      }
    };
  };

  // Funções auxiliares
  const formatTypeName = (type) => {
    const typeNames = {
      movie: 'Filmes',
      series: 'Séries',
      anime: 'Animes',
      manga: 'Mangás',
      game: 'Jogos'
    };
    return typeNames[type] || type;
  };

  const formatStatusName = (status) => {
    const statusNames = {
      planned: 'Planejado',
      in_progress: 'Em Progresso',
      completed: 'Concluído',
      dropped: 'Abandonado'
    };
    return statusNames[status] || status;
  };

  const getTypeIcon = (type) => {
    const icons = {
      movie: Film,
      series: Tv,
      anime: Zap,
      manga: BookOpen,
      game: Gamepad2
    };
    return icons[type] || Layers;
  };

  const getStatusIcon = (status) => {
    const icons = {
      planned: Clock,
      in_progress: TrendingUp,
      completed: CheckCircle,
      dropped: AlertCircle
    };
    return icons[status] || Clock;
  };

  const getRandomColor = (seed) => {
    const colors = [
      '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe',
      '#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#00C49F',
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const chartData = processChartData();

  // Calcular porcentagens para os stats cards
  const calculatePercentage = (value) => {
    if (chartData.total === 0) return 0;
    return Math.round((value / chartData.total) * 100);
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass border border-white/10 rounded-xl p-3 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-2">
            {data.icon && (
              <div className="p-1.5 rounded-lg bg-white/10">
                <data.icon className="w-4 h-4 text-white" />
              </div>
            )}
            <p className="font-bold text-white">{data.name}</p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-white/80">Quantidade:</span>
            <span className="font-bold text-white">{data.value}</span>
          </div>
          {data.rawName && (
            <div className="mt-1 pt-2 border-t border-white/10">
              <span className="text-xs text-white/60">
                Tipo: {formatTypeName(data.rawName)}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Legend
  const CustomLegend = ({ payload }) => (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-white/80">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <div className="p-6 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 glass rounded-2xl p-6 border border-white/10 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-white/10 rounded w-48"></div>
                  <div className="h-4 bg-white/10 rounded w-64"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-6 border border-white/10 animate-pulse">
                  <div className="h-8 bg-white/10 rounded w-3/4 mb-4"></div>
                  <div className="h-12 bg-white/10 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <div className="p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Simplificado */}
          <div className="mb-8 glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <BarChartIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Dashboard de <span className="text-gradient-primary">Mídias</span>
                </h1>
                <p className="text-white/60 mt-2">
                  Análise completa da sua coleção de entretenimento
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards - Layout modificado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Total Media Card - Ocupa 2 colunas quando os outros ocupam 1 */}
            <div className="sm:col-span-2 lg:col-span-1 glass rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  TOTAL
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {chartData.stats.total}
              </h3>
              <p className="text-white/60 text-sm">Mídias na coleção</p>
            </div>

            {/* Planejadas Card - AMARELO */}
            <div className="glass rounded-2xl p-6 border border-white/10 hover:border-yellow-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  {calculatePercentage(chartData.stats.planned)}%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {chartData.stats.planned}
              </h3>
              <p className="text-white/60 text-sm">Planejados</p>
            </div>

            {/* Em Progresso Card - AZUL */}
            <div className="glass rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-sky-500/20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {calculatePercentage(chartData.stats.inProgress)}%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {chartData.stats.inProgress}
              </h3>
              <p className="text-white/60 text-sm">Em progresso</p>
            </div>

            {/* Concluídos Card - VERDE */}
            <div className="glass rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  {calculatePercentage(chartData.stats.completed)}%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {chartData.stats.completed}
              </h3>
              <p className="text-white/60 text-sm">Concluídos</p>
            </div>

            {/* Abandonados Card - VERMELHO */}
            <div className="glass rounded-2xl p-6 border border-white/10 hover:border-red-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20 group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  {calculatePercentage(chartData.stats.dropped)}%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {chartData.stats.dropped}
              </h3>
              <p className="text-white/60 text-sm">Abandonados</p>
            </div>
          </div>

          {error ? (
            <div className="text-center py-12">
              <div className="glass border border-white/10 rounded-2xl p-12 max-w-md mx-auto">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Erro ao carregar dashboard
                </h3>
                <p className="text-white/60 mb-8">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="primary"
                    onClick={fetchDashboardData}
                    icon={RefreshCw}
                    className="bg-gradient-primary hover:bg-gradient-secondary min-w-[180px]"
                  >
                    Tentar novamente
                  </Button>
                </div>
              </div>
            </div>
          ) : chartData.total === 0 ? (
            <div className="text-center py-12">
              <div className="glass border border-white/10 rounded-2xl p-12 max-w-md mx-auto">
                <div className="text-white/40 text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Dashboard vazio
                </h3>
                <p className="text-white/60 mb-8">
                  Adicione algumas mídias para visualizar as estatísticas
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/search">
                    <Button
                      variant="primary"
                      className="bg-gradient-primary hover:bg-gradient-secondary min-w-[180px]"
                    >
                      Buscar Mídias
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Chart by Type */}
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Film className="w-5 h-5 text-blue-400" />
                        Distribuição por Tipo
                      </h2>
                      <p className="text-white/60 text-sm mt-1">
                        Quantidade de mídias por categoria
                      </p>
                    </div>
                    <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Total: {chartData.stats.total}
                    </div>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.byType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent, value }) =>
                            percent > 0.05 ? `${name}\n${(percent * 100).toFixed(0)}% (${value})` : ''
                          }
                          outerRadius={80}
                          innerRadius={40}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartData.byType.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              className="hover:opacity-80 transition-opacity"
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart by Status */}
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Distribuição por Status
                      </h2>
                      <p className="text-white/60 text-sm mt-1">
                        Progresso geral da coleção
                      </p>
                    </div>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.byStatus}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#ffffff10"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: '#ffffff80' }}
                          axisLine={{ stroke: '#ffffff20' }}
                          tickLine={{ stroke: '#ffffff20' }}
                        />
                        <YAxis
                          tick={{ fill: '#ffffff80' }}
                          axisLine={{ stroke: '#ffffff20' }}
                          tickLine={{ stroke: '#ffffff20' }}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={false}
                        />
                        <Bar
                          dataKey="value"
                          name="Quantidade"
                          radius={[8, 8, 0, 0]}
                        >
                          {chartData.byStatus.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Activity - Mostrar apenas se temos dados reais */}
              {mediaData.length > 0 && Array.isArray(mediaData) && mediaData[0]?.mediaCacheId && (
                <div className="mt-8 glass rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-bold text-white mb-6">Atividade Recente</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mediaData
                      .filter(item => item.mediaCacheId?.essentialData?.title) // Filtra apenas itens com título
                      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
                      .slice(0, 6)
                      .map((item, index) => {
                        const mediaType = item.mediaType || item.mediaCacheId?.mediaType;
                        const title = item.mediaCacheId?.essentialData?.title || 'Sem título';
                        const IconComponent = getTypeIcon(mediaType);

                        return (
                          <div
                            key={index}
                            className="group hover:bg-white/5 p-4 rounded-xl border border-white/5 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${getMediaTypeColor(mediaType)} group-hover:scale-110 transition-transform`}>
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-white truncate">{title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                                    {formatStatusName(item.status)}
                                  </span>
                                  <span className="text-xs text-white/60">
                                    {formatTypeName(mediaType)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}