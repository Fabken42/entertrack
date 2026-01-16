import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { connectToDatabase } from '@/lib/database/connect';
import UserMedia from '@/models/UserMedia';
import MediaCache from '@/models/MediaCache';

// Função auxiliar para criar progresso inicial baseado no tipo de mídia
const createInitialProgress = (mediaType, initialProgress = {}) => {
  const progress = {
    details: {},
    tasks: initialProgress.tasks || [],
    lastUpdated: new Date()
  };

  // Apenas inicializar campos relevantes para o tipo de mídia
  const initialDetails = initialProgress.details || {};

  switch (mediaType) {
    case 'anime':
      progress.details.episodes = initialDetails.episodes || 0;
      break;
    case 'manga':
      progress.details.chapters = initialDetails.chapters || 0;
      progress.details.volumes = initialDetails.volumes || 0;
      break;
    case 'series':
      progress.details.seasons = initialDetails.seasons || 0;
      progress.details.episodes = initialDetails.episodes || 0;
      break;
    case 'game':
      progress.details.hours = initialDetails.hours || 0;
      progress.tasks = initialProgress.tasks || [];
      break;
    case 'movie':
      progress.details.minutes = initialDetails.minutes || 0;
      break;
    default:
      // Para tipos genéricos ou desconhecidos, usar percentage
      progress.details.percentage = initialDetails.percentage || 0;
  }

  // Remover campos undefined
  Object.keys(progress.details).forEach(key => {
    if (progress.details[key] === undefined) {
      delete progress.details[key];
    }
  });

  return progress;
};

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

    // ✅ CORREÇÃO: Criar progresso específico para o tipo de mídia
    const progressData = createInitialProgress(mediaCache.mediaType, progress || {});

    // ✅ CORREÇÃO: Criar objeto limpo sem campos desnecessários
    const userMediaData = {
      userId: session.user.id,
      mediaCacheId,
      status: status || 'planned'
    };

    // Apenas adicionar campos se tiverem valores válidos
    if (userRating !== undefined) {
      userMediaData.userRating = userRating;
    }

    if (personalNotes !== undefined && personalNotes.trim() !== '') {
      userMediaData.personalNotes = personalNotes.trim();
    }

    if (progressData && Object.keys(progressData.details).length > 0) {
      userMediaData.progress = progressData;
    } else {
      // Se não houver details, criar estrutura mínima
      userMediaData.progress = {
        details: {},
        tasks: progressData.tasks || [],
        lastUpdated: new Date()
      };
    }

    // ✅ CORREÇÃO: Adicionar datas conforme status (mas sem valores padrão desnecessários)
    if (status === 'in_progress') {
      userMediaData.startedAt = new Date();
    } else if (status === 'completed') {
      userMediaData.completedAt = new Date();
    } else if (status === 'dropped') {
      userMediaData.droppedAt = new Date();
    }

    // ✅ CORREÇÃO: Não inicializar tags se não fornecidas
    // (o schema já define default: [])

    const userMedia = new UserMedia(userMediaData);
    await userMedia.save();

    // Atualizar contador de usuários no cache
    await MediaCache.findByIdAndUpdate(mediaCacheId, {
      $inc: { 'usageStats.userCount': 1 },
      $set: { 'usageStats.lastAccessed': new Date() }
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