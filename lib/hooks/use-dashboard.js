// /lib/hooks/use-dashboard.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const useDashboard = () => {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchDashboardData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Buscar estatísticas e atividade recente em paralelo
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activity')
      ]);

      if (!statsResponse.ok || !activityResponse.ok) {
        throw new Error('Erro ao buscar dados do dashboard');
      }

      const statsData = await statsResponse.json();
      const activityData = await activityResponse.json();

      setStats(statsData.data);
      setRecentActivity(activityData.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    fetchDashboardData();
  };

  return {
    stats,
    recentActivity,
    loading,
    error,
    refreshDashboard,
    isAuthenticated: status === 'authenticated'
  };
};