// /app/api/media/[id]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import MediaEntry from '@/models/MediaEntry';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Buscar mídia específica
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const mediaEntry = await MediaEntry.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!mediaEntry) {
      return NextResponse.json(
        { error: 'Mídia não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mediaEntry,
    });

  } catch (error) {
    console.error('Error fetching media entry:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar mídia' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar mídia
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const data = await request.json();
    
    // Buscar mídia existente
    const existingEntry = await MediaEntry.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Mídia não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar mídia
    const updatedEntry = await MediaEntry.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { 
        ...data,
        lastUpdated: new Date(),
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedEntry,
      message: 'Mídia atualizada com sucesso!',
    });

  } catch (error) {
    console.error('Error updating media entry:', error);
    
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

// DELETE - Remover mídia
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const result = await MediaEntry.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Mídia não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar stats do usuário
    await updateUserStats(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Mídia removida com sucesso!',
    });

  } catch (error) {
    console.error('Error deleting media entry:', error);
    return NextResponse.json(
      { error: 'Erro ao remover mídia' },
      { status: 500 }
    );
  }
}

async function updateUserStats(userId) {
  // Implementação similar à anterior
}