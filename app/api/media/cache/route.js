import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/database/connect';
import { getCacheModelByType } from '@/models';

const cleanObject = (obj, preserveFields = ['title']) => {
  const cleaned = { ...obj };

  Object.keys(cleaned).forEach(key => {
    const value = cleaned[key];

    // Preservar campos obrigatórios mesmo se vazios
    if (preserveFields.includes(key)) {
      return;
    }

    // Tratamento especial para releasePeriod
    if (key === 'releasePeriod') {
      if (!value ||
        (typeof value === 'object' &&
          (!value.year || Object.keys(value).length === 0))) {
        delete cleaned[key];
      }
      return;
    }

    // Remover campos com valores "vazios"
    if (
      value === undefined ||
      value === null ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'string' && value.trim() === '') ||
      (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
    ) {
      delete cleaned[key];
    }
  });

  return cleaned;
};

const createCleanedEssentialData = (essentialData, mediaType) => {
  // Campos base que todos os tipos podem ter
  const baseData = {
    title: essentialData.title,
    description: essentialData.description,
    coverImage: essentialData.coverImage,
    releasePeriod: essentialData.releasePeriod,
    genres: Array.isArray(essentialData.genres) ? essentialData.genres : undefined,
    averageRating: essentialData.apiRating || essentialData.averageRating,
    ratingCount: essentialData.apiVoteCount || essentialData.ratingCount,
  };

  // Campos específicos por tipo
  const typeSpecificData = {};

  switch (mediaType) {
    case 'game':
      Object.assign(typeSpecificData, {
        playHours: essentialData.playHours,
        metacritic: essentialData.metacritic,
        platforms: Array.isArray(essentialData.platforms) ? essentialData.platforms : undefined,
      });
      break;

    case 'movie':
      Object.assign(typeSpecificData, {
        runtime: essentialData.runtime,
      });
      break;

    case 'series':
      Object.assign(typeSpecificData, {
        runtime: essentialData.runtime,
        episodes: essentialData.episodes,
        seasons: essentialData.seasons,
        episodesPerSeason: essentialData.episodesPerSeason,
      });
      break;

    case 'anime':
      Object.assign(typeSpecificData, {
        episodes: essentialData.episodes,
        popularity: essentialData.popularity,
        members: essentialData.members,
        studios: essentialData.studios,
      });
      break;

    case 'manga':
      Object.assign(typeSpecificData, {
        chapters: essentialData.chapters,
        volumes: essentialData.volumes,
        pageCount: essentialData.pageCount,
        popularity: essentialData.popularity,
        members: essentialData.members,
        authors: essentialData.authors,
      });
      break;
  }

  // Campos que podem existir em qualquer tipo (não específicos)
  const optionalFields = {
    category: essentialData.category,
  };

  // Combinar todos os campos e limpar
  const combinedData = {
    ...baseData,
    ...typeSpecificData,
    ...optionalFields
  };

  return cleanObject(combinedData, ['title']);
};

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { sourceApi, sourceId, mediaType, essentialData } = body;


    if (!sourceApi || !sourceId || !mediaType) {
      console.error('❌ Campos obrigatórios faltando:', { sourceApi, sourceId, mediaType });
      return NextResponse.json(
        { error: 'Missing required fields: sourceApi, sourceId, mediaType' },
        { status: 400 }
      );
    }

    if (!essentialData) {
      console.error('❌ essentialData está undefined');
      return NextResponse.json(
        { error: 'Missing required field: essentialData' },
        { status: 400 }
      );
    }

    if (!essentialData.title || essentialData.title.trim() === '') {
      console.error('❌ essentialData.title está undefined ou vazio');
      return NextResponse.json(
        { error: 'Missing required field: essentialData.title' },
        { status: 400 }
      );
    }

    const cleanedEssentialData = createCleanedEssentialData(essentialData, mediaType);

    const CacheModel = getCacheModelByType(mediaType);

    const existingCache = await CacheModel.findOne({
      sourceApi,
      sourceId,
      mediaType
    });

    if (existingCache) {
      const mergedEssentialData = cleanObject({
        ...existingCache.essentialData,
        ...cleanedEssentialData
      }, ['title']);

      if (existingCache.essentialData.playHours !== undefined && cleanedEssentialData.playHours === undefined) {
        mergedEssentialData.playHours = existingCache.essentialData.playHours;
      }
      if (existingCache.essentialData.metacritic !== undefined && cleanedEssentialData.metacritic === undefined) {
        mergedEssentialData.metacritic = existingCache.essentialData.metacritic;
      }

      existingCache.essentialData = mergedEssentialData;
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

    const mediaCacheData = {
      sourceApi,
      sourceId,
      mediaType,
      essentialData: cleanedEssentialData,
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
    };

    const mediaCache = new CacheModel(mediaCacheData);
    await mediaCache.save();

    return NextResponse.json({
      cacheId: mediaCache._id,
      cached: false
    });

  } catch (error) {
    console.error('Error caching media:', error);
    console.error('Stack trace:', error.stack);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation error', details: errors },
        { status: 400 }
      );
    }

    if (error.message?.includes('getCacheModelByType') || error.message?.includes('Tipo de mídia não suportado')) {
      return NextResponse.json(
        { error: `Tipo de mídia não suportado: ${body.mediaType}` },
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

    const CacheModel = getCacheModelByType(mediaType);

    const cache = await CacheModel.findOne({
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

    cache.usageStats.accessCount += 1;
    cache.usageStats.lastAccessed = new Date();
    await cache.save();

    return NextResponse.json(cache);

  } catch (error) {
    console.error('Error fetching media cache:', error);

    if (error.message?.includes('getCacheModelByType') || error.message?.includes('Tipo de mídia não suportado')) {
      return NextResponse.json(
        { error: `Tipo de mídia não suportado: ${searchParams.get('mediaType')}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch media cache: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('mediaType');
    const olderThan = searchParams.get('olderThan'); // Dias

    if (!mediaType) {
      return NextResponse.json(
        { error: 'Missing mediaType parameter' },
        { status: 400 }
      );
    }

    const CacheModel = getCacheModelByType(mediaType);
    const filter = {};

    if (olderThan) {
      const olderThanDate = new Date();
      olderThanDate.setDate(olderThanDate.getDate() - parseInt(olderThan));
      filter['cacheControl.lastFetched'] = { $lt: olderThanDate };
    }

    const result = await CacheModel.deleteMany(filter);

    return NextResponse.json({
      message: `Deleted ${result.deletedCount} ${mediaType} cache entries`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error deleting cache:', error);
    return NextResponse.json(
      { error: 'Failed to delete cache: ' + error.message },
      { status: 500 }
    );
  }
}