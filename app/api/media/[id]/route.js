import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/database/connect';
import MediaEntry from '@/models/MediaEntry';

// GET - Obter entrada específica
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const entry = await MediaEntry.findOne({
      _id: params.id,
      userId: session.user.id,
    });
    
    if (!entry) {
      return NextResponse.json(
        { error: 'Entrada não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: entry,
    });
    
  } catch (error) {
    console.error('Error fetching media entry:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar entrada
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    await connectDB();
    
    const entry = await MediaEntry.findOneAndUpdate(
      {
        _id: params.id,
        userId: session.user.id,
      },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!entry) {
      return NextResponse.json(
        { error: 'Entrada não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: entry,
      message: 'Mídia atualizada com sucesso!',
    });
    
  } catch (error) {
    console.error('Error updating media entry:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar mídia' },
      { status: 500 }
    );
  }
}

// DELETE - Remover entrada
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const entry = await MediaEntry.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });
    
    if (!entry) {
      return NextResponse.json(
        { error: 'Entrada não encontrada' },
        { status: 404 }
      );
    }
    
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