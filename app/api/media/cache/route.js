// /app/api/media/cache/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/database/connect';
import { MediaCache } from '@/models';

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { sourceApi, sourceId, mediaType, essentialData } = body;

    // VALIDAÇÃO E TRATAMENTO DE VALORES UNDEFINED
    if (!sourceApi || !sourceId || !mediaType) {
      console.error('❌ Campos obrigatórios faltando:', { sourceApi, sourceId, mediaType });
      return NextResponse.json(
        { error: 'Missing required fields: sourceApi, sourceId, mediaType' },
        { status: 400 }
      );
    }

    // Garantir que essentialData existe e tem título
    if (!essentialData) {
      console.error('❌ essentialData está undefined');
      return NextResponse.json(
        { error: 'Missing required field: essentialData' },
        { status: 400 }
      );
    }

    if (!essentialData.title) {
      console.error('❌ essentialData.title está undefined ou vazio');
      return NextResponse.json(
        { error: 'Missing required field: essentialData.title' },
        { status: 400 }
      );
    }

    const validatedEssentialData = {
      title: essentialData.title,
      description: essentialData.description || '',
      coverImage: essentialData.imageUrl || essentialData.coverImage || '',
      releaseYear: essentialData.releaseYear || null,
      runtime: essentialData.runtime || null,

      status: essentialData.status || 'finished',
      episodes: essentialData.episodes || null,
      seasons: essentialData.seasons || null,
      episodesPerSeason: essentialData.episodesPerSeason || null,
      chapters: essentialData.chapters || null,
      volumes: essentialData.volumes || null,
      pageCount: essentialData.pageCount || null,

      genres: Array.isArray(essentialData.genres) ? essentialData.genres : [],
      averageRating: essentialData.apiRating || essentialData.averageRating || null,
      ratingCount: essentialData.apiVoteCount || essentialData.ratingCount || null,

      // CAMPOS JIKAN
      popularity: essentialData.popularity || null,
      members: essentialData.members || null,
      studios: essentialData.studios || [],
      authors: essentialData.authors || [],
    };

    // Verificar se já existe cache para esta mídia
    const existingCache = await MediaCache.findOne({
      sourceApi,
      sourceId,
      mediaType
    });

    if (existingCache) {
      // Atualizar dados e estatísticas de uso
      existingCache.essentialData = {
        ...existingCache.essentialData,
        ...validatedEssentialData
      };

      existingCache.cacheControl.lastFetched = new Date();
      existingCache.cacheControl.nextFetch = new Date(Date.now() + 24 * 60 * 60 * 1000);
      existingCache.usageStats.accessCount += 1;
      existingCache.usageStats.lastAccessed = new Date();

      await existingCache.save();

      return NextResponse.json({
        cacheId: existingCache._id,
        cached: true
      });
    }

    const mediaCache = new MediaCache({
      sourceApi,
      sourceId,
      mediaType,
      essentialData: validatedEssentialData,
      cacheControl: {
        lastFetched: new Date(),
        nextFetch: new Date(Date.now() + 24 * 60 * 60 * 1000),
        ttl: 86400,
        fetchCount: 1
      },
      usageStats: {
        userCount: 0,
        lastAccessed: new Date(),
        accessCount: 1
      }
    });

    await mediaCache.save();

    return NextResponse.json({
      cacheId: mediaCache._id,
      cached: false
    });

  } catch (error) {
    console.error('Error caching media:', error);
    console.error('Stack trace:', error.stack);

    // Verificar se é erro de validação do Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation error', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cache media data: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const sourceApi = searchParams.get('sourceApi');
    const sourceId = searchParams.get('sourceId');
    const mediaType = searchParams.get('mediaType');

    if (!sourceApi || !sourceId || !mediaType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const cache = await MediaCache.findOne({
      sourceApi,
      sourceId,
      mediaType
    });

    if (!cache) {
      return NextResponse.json(
        { error: 'Cache not found' },
        { status: 404 }
      );
    }

    // Atualizar estatísticas de acesso
    cache.usageStats.accessCount += 1;
    cache.usageStats.lastAccessed = new Date();
    await cache.save();

    return NextResponse.json(cache);

  } catch (error) {
    console.error('Error fetching media cache:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media cache' },
      { status: 500 }
    );
  }
}