// /app/api/user/media/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { connectToDatabase } from '@/lib/database/connect';
import UserMedia from '@/models/UserMedia';
import MediaCache from '@/models/MediaCache';

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

      // Deletar APENAS se userCount = 0 E sourceApi = "manual"
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
    console.log(body)
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
    });

    if (!existingMedia) {
      return NextResponse.json(
        { error: 'Mídia não encontrada, ou você não tem permissão para excluí-la' },
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

        // ✅ CORREÇÃO: Para games completados, garantir progresso 100%
        if (!updateData.progress) {
          updateData.progress = { ...existingMedia.progress };
        }
        if (!updateData.progress.details) {
          updateData.progress.details = { ...existingMedia.progress?.details || {} };
        }
        updateData.progress.details.percentage = 100;
      } else if (status === 'dropped') {
        updateData.droppedAt = new Date();
        updateData.completedAt = null;
      } else if (status === 'planned') {
        updateData.startedAt = null;
        updateData.completedAt = null;
        updateData.droppedAt = null;
      }
    }

    if (startedAt !== undefined) updateData.startedAt = startedAt;
    if (completedAt !== undefined) updateData.completedAt = completedAt;
    if (droppedAt !== undefined) updateData.droppedAt = droppedAt;

    if (userRating !== undefined) updateData.userRating = userRating;
    if (personalNotes !== undefined) {
      updateData.personalNotes = personalNotes;
    }

    if (progress !== undefined) {
      updateData.progress = {
        ...existingMedia.progress,
        lastUpdated: new Date()
      };

      if (progress.details) {
        updateData.progress.details = {
          ...(existingMedia.progress?.details || {}),
          ...progress.details
        };
      }

      if (progress.tasks !== undefined) {
        updateData.progress.tasks = Array.isArray(progress.tasks)
          ? progress.tasks
          : [];
      }
    }

    // Atualizar no banco
    const updatedMedia = await UserMedia.findByIdAndUpdate(
      id,
      updateData,
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