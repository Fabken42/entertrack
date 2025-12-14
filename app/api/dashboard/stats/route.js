// /app/api/dashboard/stats/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connect';
import MediaEntry from '@/models/MediaEntry';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const userId = session.user.id;

    // Buscar estatísticas agregadas
    const stats = await MediaEntry.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          planned: {
            $sum: { $cond: [{ $eq: ['$status', 'planned'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          dropped: {
            $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] }
          },
          favorites: {
            $sum: { $cond: [{ $eq: ['$isFavorite', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Estatísticas por tipo de mídia
    const statsByType = await MediaEntry.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$mediaType',
          count: { $sum: 1 },
          planned: {
            $sum: { $cond: [{ $eq: ['$status', 'planned'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Estatísticas de progresso
    const progressStats = await MediaEntry.aggregate([
      { 
        $match: { 
          userId: userId,
          status: { $in: ['in_progress', 'dropped'] }
        } 
      },
      {
        $group: {
          _id: '$mediaType',
          averageProgress: { $avg: { $ifNull: ['$progress.completionPercentage', 0] } },
          totalHours: { 
            $sum: { 
              $cond: [
                { $eq: ['$mediaType', 'game'] },
                { $ifNull: ['$progress.hoursPlayed', 0] },
                0
              ]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const defaultStats = {
      total: 0,
      planned: 0,
      inProgress: 0,
      completed: 0,
      dropped: 0,
      favorites: 0
    };

    const result = {
      ...(stats[0] || defaultStats),
      byType: statsByType,
      progress: progressStats,
      lastUpdated: new Date()
    };

    // Atualizar última atividade do usuário
    await User.findByIdAndUpdate(userId, {
      'stats.lastActive': new Date()
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}