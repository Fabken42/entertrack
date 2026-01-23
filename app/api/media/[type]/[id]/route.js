import { getCacheModelByType, getUserMediaModelByType } from '@/lib/models';

const API_CLIENTS = {
  jikan: jikanClient,
  tmdb: tmdbClient,
  rawg: rawgClient,
};

export default async function handler(req, res) {
  const { source, id } = req.query;
  const { userId } = req.body; // Do seu sistema de auth

  // 1. Determinar o tipo de mídia baseado na source
  const mediaType = getMediaTypeFromSource(source);
  
  // 2. Verificar cache primeiro usando o modelo correto
  const CacheModel = getCacheModelByType(mediaType);
  const cached = await CacheModel.findOne({
    sourceApi: source,
    sourceId: id.toString()
  });

  const now = new Date();
  
  // 3. Cache válido?
  if (cached && cached.cacheControl.nextFetch > now) {
    // Atualizar estatísticas
    cached.usageStats.accessCount += 1;
    cached.usageStats.lastAccessed = now;
    await cached.save();
    
    // 4. Se temos userId, buscar informações do usuário também
    let userMediaData = null;
    if (userId) {
      const UserMediaModel = getUserMediaModelByType(mediaType);
      userMediaData = await UserMediaModel.findOne({
        userId,
        mediaCacheId: cached._id
      }).lean();
    }
    
    return res.status(200).json({
      ...cached.essentialData,
      userData: userMediaData
    });
  }

  // 5. Buscar da API externa
  try {
    const apiClient = API_CLIENTS[source];
    if (!apiClient) {
      return res.status(400).json({ error: 'API source inválida' });
    }

    const freshData = await apiClient.fetchById(id);
    
    // 6. Normalizar dados (usando sua função normalizeSearchResults)
    const normalizedData = normalizeMediaData(freshData, source);
    
    // 7. Atualizar ou criar cache usando o modelo específico
    const cacheData = {
      sourceApi: source,
      sourceId: id.toString(),
      mediaType: normalizedData.mediaType || mediaType,
      essentialData: normalizedData,
      fullData: freshData,
      'cacheControl.lastFetched': now,
      'cacheControl.nextFetch': calculateNextFetch(normalizedData),
      'cacheControl.fetchCount': (cached?.cacheControl.fetchCount || 0) + 1,
      'usageStats.lastAccessed': now
    };

    if (cached) {
      await CacheModel.updateOne(
        { _id: cached._id },
        { $set: cacheData }
      );
    } else {
      await CacheModel.create(cacheData);
    }

    // 8. Buscar dados do usuário se userId estiver presente
    let userMediaData = null;
    if (userId) {
      const UserMediaModel = getUserMediaModelByType(mediaType);
      userMediaData = await UserMediaModel.findOne({
        userId,
        mediaCacheId: cached?._id
      }).lean();
    }

    res.status(200).json({
      ...normalizedData,
      userData: userMediaData
    });

  } catch (error) {
    console.error(`Error fetching from ${source}:`, error);
    
    // 9. Se API falhar, retornar cache mesmo que expirado
    if (cached) {
      cached.cacheControl.errorCount += 1;
      await cached.save();
      
      // Buscar dados do usuário se userId estiver presente
      let userMediaData = null;
      if (userId) {
        const UserMediaModel = getUserMediaModelByType(mediaType);
        userMediaData = await UserMediaModel.findOne({
          userId,
          mediaCacheId: cached._id
        }).lean();
      }
      
      return res.status(200).json({
        ...cached.essentialData,
        userData: userMediaData
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch media data' });
  }
}

// Função para determinar o tipo de mídia baseado na fonte
function getMediaTypeFromSource(source) {
  const sourceToType = {
    'tmdb': ['movie', 'series'], // Pode ser movie ou series, será refinado na API
    'jikan': ['anime', 'manga'], // Pode ser anime ou manga
    'rawg': 'game',
    'manual': null // Será definido no payload
  };
  
  const type = sourceToType[source];
  if (!type) {
    throw new Error(`Fonte não suportada: ${source}`);
  }
  return type;
}

// Função auxiliar para normalizar dados da API
function normalizeMediaData(rawData, source) {
  // Sua implementação existente aqui
  switch (source) {
    case 'tmdb':
      return normalizeTMDBData(rawData);
    case 'jikan':
      return normalizeJikanData(rawData);
    case 'rawg':
      return normalizeRAWGData(rawData);
    default:
      return rawData;
  }
}

// Função para calcular quando buscar novamente
function calculateNextFetch(mediaData) {
  const now = new Date();
  
  if (mediaData.status === 'ongoing') {
    // Conteúdo em lançamento: atualizar em 1 dia
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  } else if (mediaData.status === 'upcoming') {
    // Conteúdo anunciado: 7 dias
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else {
    // Conteúdo finalizado: 30 dias
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
}