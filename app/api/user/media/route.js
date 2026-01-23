import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { connectToDatabase } from '@/lib/database/connect';
import { 
  getCacheModelByType,
  getUserMediaModelByType
} from '@/models';

// ATUALIZADA: Função auxiliar para criar progresso inicial baseado no tipo de mídia
const createInitialProgress = (mediaType, initialProgress = {}) => {
  const progress = {
    lastUpdated: new Date()
  };

  switch (mediaType) {
    case 'anime':
      progress.episodes = initialProgress.episodes || 0;
      break;
    case 'manga':
      progress.chapters = initialProgress.chapters || 0;
      progress.volumes = initialProgress.volumes || 0;
      break;
    case 'series':
      progress.seasons = initialProgress.seasons || 0;
      progress.episodes = initialProgress.episodes || 0;
      break;
    case 'game':
      progress.hours = initialProgress.hours || 0;
      progress.tasks = initialProgress.tasks || [];
      break;
    case 'movie':
      progress.minutes = initialProgress.minutes || 0;
      break;
    default:
      // Para tipos genéricos ou desconhecidos, usar percentage
      progress.percentage = initialProgress.percentage || 0;
  }

  // Remover campos undefined
  Object.keys(progress).forEach(key => {
    if (progress[key] === undefined) {
      delete progress[key];
    }
  });

  return progress;
};

// Função: Buscar todas as mídias do usuário através de todos os tipos
const getAllUserMedia = async (userId) => {
  const mediaTypes = ['movie', 'series', 'anime', 'manga', 'game'];
  const allMedia = [];

  for (const mediaType of mediaTypes) {
    try {
      const UserMediaModel = getUserMediaModelByType(mediaType);
      const userMediaList = await UserMediaModel.find({ userId });
      
      // Buscar cache para cada item
      for (const media of userMediaList) {
        const CacheModel = getCacheModelByType(mediaType);
        const cacheData = await CacheModel.findById(media.mediaCacheId);
        allMedia.push({
          ...media.toObject(),
          mediaCacheId: cacheData
        });
      }
    } catch (error) {
      console.error(`Error fetching ${mediaType} for user ${userId}:`, error);
      continue;
    }
  }

  // Ordenar por data de criação (mais recente primeiro)
  return allMedia.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

    // Usar função para buscar todas as mídias do usuário
    const userMedia = await getAllUserMedia(session.user.id);
    
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

    // Determinar o tipo de mídia para buscar no cache correto
    let mediaType = null;
    let mediaCache = null;
    
    // Tentar buscar em cada tipo de cache
    const cacheTypes = ['movie', 'series', 'anime', 'manga', 'game'];
    
    for (const type of cacheTypes) {
      try {
        const CacheModel = getCacheModelByType(type);
        const cache = await CacheModel.findById(mediaCacheId);
        if (cache) {
          mediaCache = cache;
          mediaType = type;
          break;
        }
      } catch (error) {
        // Continuar para o próximo tipo
        continue;
      }
    }

    if (!mediaCache) {
      return NextResponse.json(
        { error: 'Cache da mídia não encontrado' },
        { status: 404 }
      );
    }

    // Obter modelo específico de UserMedia
    const UserMediaModel = getUserMediaModelByType(mediaType);

    // Verificar duplicata usando o modelo específico
    const existingUserMedia = await UserMediaModel.findOne({
      userId: session.user.id,
      mediaCacheId
    });

    if (existingUserMedia) {
      return NextResponse.json(
        { error: 'Você já tem esta mídia em sua lista!' },
        { status: 400 }
      );
    }

    const progressData = createInitialProgress(mediaType, progress || {});

    // Criar objeto limpo sem campos desnecessários
    const userMediaData = {
      userId: session.user.id,
      mediaCacheId,
      mediaType: mediaType,
      status: status || 'planned',
      lastUpdated: new Date()
    };

    // Apenas adicionar campos se tiverem valores válidos
    if (userRating !== undefined) {
      userMediaData.userRating = userRating;
    }

    if (personalNotes !== undefined && personalNotes.trim() !== '') {
      userMediaData.personalNotes = personalNotes.trim();
    }

    // ATUALIZADA: Adicionar progresso se houver campos relevantes
    const hasProgressData = Object.keys(progressData).some(key => key !== 'lastUpdated');
    if (hasProgressData) {
      userMediaData.progress = progressData;
    }

    // Adicionar datas conforme status
    if (status === 'in_progress') {
      userMediaData.startedAt = new Date();
    } else if (status === 'completed') {
      userMediaData.completedAt = new Date();
    } else if (status === 'dropped') {
      userMediaData.droppedAt = new Date();
    }

    // Criar usando modelo específico
    const userMedia = new UserMediaModel(userMediaData);
    await userMedia.save();

    // Atualizar contador de usuários no cache usando modelo específico
    const CacheModel = getCacheModelByType(mediaType);
    await CacheModel.findByIdAndUpdate(mediaCacheId, {
      $inc: { 'usageStats.userCount': 1 },
      $set: { 'usageStats.lastAccessed': new Date() }
    });

    // Adicionar cache à resposta
    userMedia.mediaCacheId = mediaCache;

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

    // Verificar se é erro de modelo não encontrado
    if (error.message?.includes('getUserMediaModelByType') || error.message?.includes('Tipo de mídia não suportado')) {
      return NextResponse.json(
        { error: `Tipo de mídia não suportado` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao adicionar mídia à sua lista' },
      { status: 500 }
    );
  }
}