// app/api/dashboard/stats/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { connectToDatabase } from '@/lib/database/connect';
import { 
  getCacheModelByType,
  getUserMediaModelByType
} from '@/models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado!' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const userId = session.user.id;
    const mediaTypes = ['movie', 'series', 'anime', 'manga', 'game'];
    
    const stats = {
      total: 0,
      byType: {},
      byStatus: {
        planned: 0,
        in_progress: 0,
        completed: 0,
        dropped: 0
      },
      recentAdditions: []
    };

    // Contar mídias por tipo e status
    for (const mediaType of mediaTypes) {
      try {
        const UserMediaModel = getUserMediaModelByType(mediaType);
        const userMediaList = await UserMediaModel.find({ userId });
        
        stats.byType[mediaType] = userMediaList.length;
        stats.total += userMediaList.length;

        // Contar por status
        userMediaList.forEach(item => {
          if (item.status && stats.byStatus[item.status] !== undefined) {
            stats.byStatus[item.status] += 1;
          }
        });

        // Adicionar adições recentes (últimas 5)
        const recent = userMediaList
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(item => ({
            id: item._id,
            mediaType,
            status: item.status,
            createdAt: item.createdAt,
            title: item.mediaCacheId?.essentialData?.title || 'Sem título'
          }));

        stats.recentAdditions.push(...recent);
      } catch (error) {
        console.error(`Error processing ${mediaType} stats:`, error);
        continue;
      }
    }

    // Ordenar adições recentes
    stats.recentAdditions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar estatísticas' },
      { status: 500 }
    );
  }
}