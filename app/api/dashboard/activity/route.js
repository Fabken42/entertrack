// /app/api/dashboard/activity/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connect';
import MediaEntry from '@/models/MediaEntry';
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

    // Buscar atividade recente (últimas 10 atualizações)
    const recentActivity = await MediaEntry.find({ userId })
      .sort({ lastUpdated: -1 })
      .limit(10)
      .select('title mediaType status timeline rating imageUrl lastUpdated')
      .lean();

    // Formatar atividade
    const formattedActivity = recentActivity.map(entry => {
      let action = '';
      let icon = '📁';
      let color = 'gray';

      // Determinar ação baseada no status
      switch (entry.status) {
        case 'completed':
          action = 'concluiu';
          icon = '✅';
          color = 'emerald';
          break;
        case 'in_progress':
          action = 'está assistindo/jogando/lendo';
          icon = '▶️';
          color = 'blue';
          break;
        case 'dropped':
          action = 'abandonou';
          icon = '❌';
          color = 'red';
          break;
        case 'planned':
          action = 'planejou assistir/jogar/ler';
          icon = '📅';
          color = 'yellow';
          break;
      }

      // Determinar tipo de mídia
      let mediaTypeLabel = '';
      switch (entry.mediaType) {
        case 'movie': mediaTypeLabel = 'o filme'; icon = '🎬'; break;
        case 'series': mediaTypeLabel = 'a série'; icon = '📺'; break;
        case 'anime': mediaTypeLabel = 'o anime'; icon = '🇯🇵'; break;
        case 'manga': mediaTypeLabel = 'o mangá'; icon = '📚'; break;
        case 'book': mediaTypeLabel = 'o livro'; icon = '📖'; break;
        case 'game': mediaTypeLabel = 'o jogo'; icon = '🎮'; break;
      }

      return {
        id: entry._id.toString(),
        title: entry.title,
        action: `${action} ${mediaTypeLabel}`,
        icon,
        color,
        imageUrl: entry.imageUrl,
        time: entry.lastUpdated,
        rating: entry.rating?.value,
        status: entry.status,
        timeline: entry.timeline
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedActivity
    });

  } catch (error) {
    console.error('Dashboard activity error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar atividade recente' },
      { status: 500 }
    );
  }
}