// /app/api/user/media/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { connectToDatabase } from '@/lib/database/connect';
import UserMedia from '@/models/UserMedia';
import MediaCache from '@/models/MediaCache';

const updateProgressOnCompletion = (mediaType, existingProgress, cacheData) => {
  const progress = { ...existingProgress };
  
  if (!progress.details) {
    progress.details = {};
  }

  switch (mediaType) {
    case 'anime':
      const totalEpisodes = cacheData?.essentialData?.episodes;
      if (totalEpisodes) {
        progress.details.episodes = totalEpisodes;
      }
      break;
    case 'manga':
      const totalChapters = cacheData?.essentialData?.chapters;
      const totalVolumes = cacheData?.essentialData?.volumes;
      if (totalChapters) progress.details.chapters = totalChapters;
      if (totalVolumes) progress.details.volumes = totalVolumes;
      break;
    case 'series':
      const totalSeasons = cacheData?.essentialData?.seasons;
      const totalEpisodesSeries = cacheData?.essentialData?.episodes;
      if (totalSeasons) progress.details.seasons = totalSeasons;
      if (totalEpisodesSeries) progress.details.episodes = totalEpisodesSeries;
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
      if (totalMinutes) progress.details.minutes = totalMinutes;
      break;
  }

  // Apenas definir porcentagem para tipos que não sejam game
  if (mediaType !== 'game') {
    progress.details.percentage = 100;
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

    // Buscar UserMedia com o MediaCache populado
    const userMedia = await UserMedia.findOne({
      _id: id,
      userId: session.user.id
    }).populate('mediaCacheId');

    if (!userMedia) {
      return NextResponse.json(
        { error: 'Mídia não encontrada, ou você não tem permissão para excluí-la' },
        { status: 404 }
      );
    }

    const mediaCacheId = userMedia.mediaCacheId?._id;
    await UserMedia.findByIdAndDelete(id);

    if (mediaCacheId) {
      const updatedCache = await MediaCache.findByIdAndUpdate(
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
        await MediaCache.findByIdAndDelete(mediaCacheId);
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
    console.log('Update request body:', body);
    
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

    // Verificar se o UserMedia existe e pertence ao usuário
    const existingMedia = await UserMedia.findOne({
      _id: id,
      userId: session.user.id
    }).populate('mediaCacheId');

    if (!existingMedia) {
      return NextResponse.json(
        { error: 'Mídia não encontrada, ou você não tem permissão para editá-la' },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateData = {
      updatedAt: new Date()
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

        const mediaType = existingMedia.mediaCacheId?.mediaType;
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

    // ✅ CORREÇÃO: Atualizar progresso de forma mais eficiente
    if (progress !== undefined) {
      const currentProgress = existingMedia.progress || {};
      const updatedProgress = {
        ...currentProgress,
        lastUpdated: new Date()
      };

      if (progress.details) {
        // Criar details apenas com campos fornecidos, não inicializar todos
        updatedProgress.details = {
          ...(currentProgress.details || {}),
          ...progress.details
        };
        
        // Remover campos undefined para evitar poluição
        Object.keys(updatedProgress.details).forEach(key => {
          if (updatedProgress.details[key] === undefined) {
            delete updatedProgress.details[key];
          }
        });
      }

      if (progress.tasks !== undefined) {
        updatedProgress.tasks = Array.isArray(progress.tasks)
          ? progress.tasks
          : currentProgress.tasks || [];
      }

      updateData.progress = updatedProgress;
    }

    // Limpar campos undefined antes de atualizar
    const cleanedUpdateData = cleanUpdateData(updateData);

    // Atualizar no banco
    const updatedMedia = await UserMedia.findByIdAndUpdate(
      id,
      cleanedUpdateData,
      { new: true, runValidators: true }
    ).populate('mediaCacheId');

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

    const userMedia = await UserMedia.findOne({
      _id: id,
      userId: session.user.id
    }).populate('mediaCacheId');

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
}