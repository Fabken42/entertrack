import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/database/connect';
import MediaEntry from '@/models/MediaEntry';
import { formatMediaEntryFromForm } from '@/lib/utils/media-utils';

// GET - Listar todas as mídias do usuário
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    const query = { userId: session.user.id };
    
    if (mediaType && mediaType !== 'all') {
      query.mediaType = mediaType;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const [entries, total] = await Promise.all([
      MediaEntry.find(query)
        .sort({ lastUpdated: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MediaEntry.countDocuments(query),
    ]);
    
    return NextResponse.json({
      success: true,
      data: entries,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('Error fetching media entries:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova entrada de mídia
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const formData = await request.json();
    await connectDB();
    
    // Verificar se já existe uma entrada igual
    const existingEntry = await MediaEntry.findOne({
      userId: session.user.id,
      mediaType: formData.mediaType,
      $or: [
        { 'externalData.externalId': formData.externalId },
        { title: formData.title, 'externalData.source': 'manual' }
      ]
    });
    
    if (existingEntry) {
      return NextResponse.json(
        { error: 'Esta mídia já está na sua biblioteca' },
        { status: 409 }
      );
    }
    
    // Criar nova entrada
    const mediaData = formatMediaEntryFromForm(formData, session.user.id, formData.externalData);
    const newEntry = await MediaEntry.create(mediaData);
    
    return NextResponse.json(
      { 
        success: true, 
        data: newEntry,
        message: 'Mídia adicionada com sucesso!' 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating media entry:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Esta mídia já está na sua biblioteca' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao adicionar mídia' },
      { status: 500 }
    );
  }
}