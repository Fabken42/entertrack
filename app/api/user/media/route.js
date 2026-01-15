import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { connectToDatabase } from '@/lib/database/connect';
import UserMedia from '@/models/UserMedia';
import MediaCache from '@/models/MediaCache';

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

    const userMedia = await UserMedia.find({ userId: session.user.id })
      .populate('mediaCacheId')
      .sort({ createdAt: -1 });
    return NextResponse.json(userMedia);

  } catch (error) {
    console.error('Error fetching user media:', error);
    return NextResponse.json(
      { error: 'Erro ao consultar mídia do usuário' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { mediaCacheId, status, userRating, personalNotes, progress } = body;

    const existingUserMedia = await UserMedia.findOne({
      userId: session.user.id,
      mediaCacheId
    });

    if (existingUserMedia) {
      return NextResponse.json(
        { error: 'Você já tem esta mídia em sua lista!' },
        { status: 400 }
      );
    }

    const mediaCache = await MediaCache.findById(mediaCacheId);
    if (!mediaCache) {
      return NextResponse.json(
        { error: 'Cache da mídia não encontrado' },
        { status: 404 }
      );
    }

    const progressData = {
      details: {
        episodes: 0,
        chapters: 0,
        volumes: 0,
        seasons: 0,
        episodesInSeason: 0,
        minutes: 0,
        hours: 0,
        percentage: 0,
      },
      tasks: [], 
      lastUpdated: new Date()
    };

    if (progress) {
      if (progress.details) {
        progressData.details = {
          ...progressData.details,
          ...progress.details
        };
      }

      if (progress.tasks !== undefined) {
        progressData.tasks = Array.isArray(progress.tasks)
          ? progress.tasks
          : [];
      }
    }

    // Criar nova UserMedia
    const userMediaData = {
      userId: session.user.id,
      mediaCacheId,
      status: status || 'planned',
      userRating: userRating || null,
      personalNotes: personalNotes || '',
      progress: progressData
    };

    // Adicionar datas conforme status
    if (status === 'in_progress') {
      userMediaData.startedAt = new Date();
    } else if (status === 'completed') {
      userMediaData.completedAt = new Date();
    } else if (status === 'dropped') {
      userMediaData.droppedAt = new Date();
    }

    const userMedia = new UserMedia(userMediaData);
    await userMedia.save();

    // Atualizar contador de usuários no cache
    await MediaCache.findByIdAndUpdate(mediaCacheId, {
      $inc: { 'usageStats.userCount': 1 }
    });

    // Populate antes de retornar
    await userMedia.populate('mediaCacheId');

    return NextResponse.json(userMedia);

  } catch (error) {
    console.error('Error adding user media:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Erro de validação', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao adicionar mídia à sua lista' },
      { status: 500 }
    );
  }
}