import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { connectToDatabase } from '@/lib/database/connect';
import {
  getCacheModelByType,
  getUserMediaModelByType
} from '@/models';

const updateProgressOnCompletion = (mediaType, existingProgress, cacheData) => {
  const progress = { ...existingProgress };

  switch (mediaType) {
    case 'anime':
      const totalEpisodes = cacheData?.essentialData?.episodes;
      if (totalEpisodes) {
        progress.episodes = totalEpisodes;
      }
      break;
    case 'manga':
      const totalChapters = cacheData?.essentialData?.chapters;
      const totalVolumes = cacheData?.essentialData?.volumes;
      if (totalChapters) progress.chapters = totalChapters;
      if (totalVolumes) progress.volumes = totalVolumes;
      break;
    case 'series':
      const totalSeasons = cacheData?.essentialData?.seasons;
      const totalEpisodesSeries = cacheData?.essentialData?.episodes;
      if (totalSeasons) progress.seasons = totalSeasons;
      if (totalEpisodesSeries) progress.episodes = totalEpisodesSeries;
      break;
    case 'game':
      // Marcar todas as tarefas como completas
      if (progress.tasks && Array.isArray(progress.tasks)) {
        progress.tasks = progress.tasks.map(task => ({
          ...task,
          completed: true
        }));
      }
      break;
    case 'movie':
      const totalMinutes = cacheData?.essentialData?.runtime;
      if (totalMinutes) progress.minutes = totalMinutes;
      break;
  }

  // Apenas definir porcentagem para tipos que não sejam game
  if (mediaType !== 'game') {
    progress.percentage = 100;
  }

  progress.lastUpdated = new Date();
  return progress;
};

// Função auxiliar para limpar campos undefined
const cleanUpdateData = (data) => {
  const cleaned = { ...data };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

// Helper para buscar UserMedia pelo tipo correto
const findUserMediaById = async (id, userId) => {
  // Tentar buscar em cada tipo de UserMedia
  const mediaTypes = ['movie', 'series', 'anime', 'manga', 'game'];

  for (const mediaType of mediaTypes) {
    try {
      const UserMediaModel = getUserMediaModelByType(mediaType);
      const userMedia = await UserMediaModel.findOne({
        _id: id,
        userId
      });

      if (userMedia) {
        // Buscar cache correspondente
        const CacheModel = getCacheModelByType(mediaType);
        const cacheData = await CacheModel.findById(userMedia.mediaCacheId);
        return {
          ...userMedia.toObject(),
          mediaCacheId: cacheData
        };
      }
    } catch (error) {
      // Continuar para o próximo tipo
      continue;
    }
  }

  return null;
};

export async function DELETE(request, context) {
  const { params } = context;
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado!' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Usar helper para buscar UserMedia
    const userMedia = await findUserMediaById(id, session.user.id);

    if (!userMedia) {
      return NextResponse.json(
        { error: 'Mídia não encontrada, ou você não tem permissão para excluí-la' },
        { status: 404 }
      );
    }

    const mediaCacheId = userMedia.mediaCacheId?._id;
    const mediaType = userMedia.mediaType;

    // Usar modelo específico para deletar
    const UserMediaModel = getUserMediaModelByType(mediaType);
    await UserMediaModel.findByIdAndDelete(id);

    if (mediaCacheId) {
      // Usar modelo específico de cache para atualizar
      const CacheModel = getCacheModelByType(mediaType);
      const updatedCache = await CacheModel.findByIdAndUpdate(
        mediaCacheId,
        {
          $inc: { 'usageStats.userCount': -1 },
          $set: { 'usageStats.lastAccessed': new Date() }
        },
        { new: true }
      );

      if (
        updatedCache &&
        updatedCache.usageStats.userCount <= 0 &&
        updatedCache.sourceApi === 'manual'
      ) {
        await CacheModel.findByIdAndDelete(mediaCacheId);
        console.log(`✅ Cache manual deletado: ${mediaCacheId} (${updatedCache.essentialData?.title})`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Media removed successfully',
      deletedId: id,
      mediaCacheDeleted: mediaCacheId && userMedia.mediaCacheId?.sourceApi === 'manual'
    });

  } catch (error) {
    console.error('Error deleting user media:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir mídia' },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  const { params } = context;
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado!' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      status,
      userRating,
      personalNotes,
      progress,
      startedAt,
      completedAt,
      droppedAt
    } = body;

    await connectToDatabase();

    // Usar helper para buscar UserMedia
    const existingMedia = await findUserMediaById(id, session.user.id);

    if (!existingMedia) {
      return NextResponse.json(
        { error: 'Mídia não encontrada, ou você não tem permissão para editá-la' },
        { status: 404 }
      );
    }

    const mediaType = existingMedia.mediaType;

    // Obter modelo específico para atualizar
    const UserMediaModel = getUserMediaModelByType(mediaType);

    // Preparar dados para atualização
    const updateData = {
      lastUpdated: new Date()
    };

    // Atualizar campos se fornecidos
    if (status !== undefined) {
      updateData.status = status;

      // Atualizar datas baseadas no status
      if (status === 'in_progress' && !existingMedia.startedAt) {
        updateData.startedAt = new Date();
        updateData.completedAt = null;
        updateData.droppedAt = null;
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
        updateData.droppedAt = null;

        const cacheData = existingMedia.mediaCacheId;
        updateData.progress = updateProgressOnCompletion(
          mediaType,
          existingMedia.progress || {},
          cacheData
        );

      } else if (status === 'dropped') {
        updateData.droppedAt = new Date();
        updateData.completedAt = null;
      } else if (status === 'planned') {
        updateData.startedAt = null;
        updateData.completedAt = null;
        updateData.droppedAt = null;
      }
    }

    // Atualizar datas específicas se fornecidas
    if (startedAt !== undefined) updateData.startedAt = startedAt;
    if (completedAt !== undefined) updateData.completedAt = completedAt;
    if (droppedAt !== undefined) updateData.droppedAt = droppedAt;

    // Atualizar avaliação e notas
    if (userRating !== undefined) updateData.userRating = userRating;
    if (personalNotes !== undefined) {
      updateData.personalNotes = personalNotes;
    }

    // Atualizar progresso de forma mais eficiente
    if (progress !== undefined) {
      const currentProgress = existingMedia.progress || {};
      const updatedProgress = {
        ...currentProgress,
        lastUpdated: new Date()
      };

      if (progress.hours !== undefined) updatedProgress.hours = progress.hours;
      if (progress.episodes !== undefined) updatedProgress.episodes = progress.episodes;
      if (progress.chapters !== undefined) updatedProgress.chapters = progress.chapters;
      if (progress.volumes !== undefined) updatedProgress.volumes = progress.volumes;
      if (progress.seasons !== undefined) updatedProgress.seasons = progress.seasons;
      if (progress.minutes !== undefined) updatedProgress.minutes = progress.minutes;
      if (progress.percentage !== undefined) updatedProgress.percentage = progress.percentage;

      if (progress.tasks !== undefined) {
        updatedProgress.tasks = Array.isArray(progress.tasks)
          ? progress.tasks
          : currentProgress.tasks || [];
      }

      updateData.progress = updatedProgress;
    }

    // Limpar campos undefined antes de atualizar
    const cleanedUpdateData = cleanUpdateData(updateData);

    // Usar modelo específico para atualizar
    const updatedMedia = await UserMediaModel.findByIdAndUpdate(
      id,
      cleanedUpdateData,
      { new: true, runValidators: true }
    );

    // Buscar cache para incluir na resposta
    if (updatedMedia) {
      const CacheModel = getCacheModelByType(mediaType);
      const cacheData = await CacheModel.findById(updatedMedia.mediaCacheId);
      updatedMedia.mediaCacheId = cacheData;
    }

    return NextResponse.json(updatedMedia);

  } catch (error) {
    console.error('Error updating user media:', error);

    // Tratamento de erros de validação
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
      { error: 'Erro ao atualizar mídia' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado!' },
        { status: 401 }
      );
    }

    const { id } = params;

    await connectToDatabase();

    // Usar helper para buscar UserMedia
    const userMedia = await findUserMediaById(id, session.user.id);

    if (!userMedia) {
      return NextResponse.json(
        { error: 'Mídia não encontrada!' },
        { status: 404 }
      );
    }

    return NextResponse.json(userMedia);

  } catch (error) {
    console.error('Error fetching user media:', error);
    return NextResponse.json(
      { error: 'Erro ao consultar mídia' },
      { status: 500 }
    );
  }
};
