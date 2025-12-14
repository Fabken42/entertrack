// /app/api/media/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connect';
import MediaEntry from '@/models/MediaEntry';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth/authOptions';

// GET - Listar mídias do usuário
export async function GET(request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('mediaType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Construir query
    const query = { userId: session.user.id };
    if (mediaType) query.mediaType = mediaType;
    if (status) query.status = status;

    // Buscar mídias
    const mediaEntries = await MediaEntry.find(query)
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(limit);

    // Contar total
    const total = await MediaEntry.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: mediaEntries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching media entries:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar mídias' },
      { status: 500 }
    );
  }
}

// POST - Criar nova mídia
export async function POST(request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const data = await request.json();

    // Validar dados obrigatórios
    if (!data.title || !data.mediaType || !data.status) {
      return NextResponse.json(
        { error: 'Título, tipo de mídia e status são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma entrada igual
    const existingEntry = await MediaEntry.findOne({
      userId: session.user.id,
      mediaType: data.mediaType,
      title: data.title,
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Você já tem esta mídia em sua lista' },
        { status: 409 }
      );
    }

    // Preparar dados
    const mediaData = {
      ...data,
      userId: session.user.id,
      // Garantir que progress seja um objeto válido
      progress: data.progress || {},
      // Garantir que timeline tenha addedAt
      timeline: {
        addedAt: new Date(),
        ...data.timeline,
      },
    };

    // Criar nova entrada
    const mediaEntry = await MediaEntry.create(mediaData);

    // Atualizar stats do usuário
    await updateUserStats(session.user.id);

    return NextResponse.json({
      success: true,
      data: mediaEntry,
      message: 'Mídia adicionada com sucesso!',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating media entry:', error);

    // Tratar erros de validação do Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Erro de validação', details: errors },
        { status: 400 }
      );
    }

    // Tratar erro de chave duplicada
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Esta mídia já existe em sua lista' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao adicionar mídia' },
      { status: 500 }
    );
  }
}

// Função para atualizar stats do usuário
async function updateUserStats(userId) {
  try {
    // Você precisará importar o modelo User
    // const User = require('@/models/User');
    // Atualize conforme seu modelo de usuário
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}