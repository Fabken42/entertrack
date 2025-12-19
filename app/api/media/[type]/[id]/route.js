// /pages/api/media/[source]/[id].js
import { MediaCache, UserMedia } from '@/lib/models';

const API_CLIENTS = {
  jikan: jikanClient,
  tmdb: tmdbClient,
  rawg: rawgClient,
  google_books: googleBooksClient
};

export default async function handler(req, res) {
  const { source, id } = req.query;
  const { userId } = req.body; // Do seu sistema de auth

  // 1. Verificar cache primeiro
  const cached = await MediaCache.findOne({
    sourceApi: source,
    sourceId: id.toString()
  });

  const now = new Date();
  
  // 2. Cache válido?
  if (cached && cached.cacheControl.nextFetch > now) {
    // Atualizar estatísticas
    cached.usageStats.accessCount += 1;
    cached.usageStats.lastAccessed = now;
    await cached.save();
    
    return res.status(200).json(cached.essentialData);
  }

  // 3. Buscar da API externa
  try {
    const apiClient = API_CLIENTS[source];
    if (!apiClient) {
      return res.status(400).json({ error: 'API source inválida' });
    }

    const freshData = await apiClient.fetchById(id);
    
    // 4. Normalizar dados (usando sua função normalizeSearchResults)
    const normalizedData = normalizeMediaData(freshData, source);
    
    // 5. Atualizar ou criar cache
    const cacheData = {
      sourceApi: source,
      sourceId: id.toString(),
      mediaType: normalizedData.mediaType,
      essentialData: normalizedData,
      fullData: freshData,
      'cacheControl.lastFetched': now,
      'cacheControl.nextFetch': calculateNextFetch(normalizedData),
      'cacheControl.fetchCount': (cached?.cacheControl.fetchCount || 0) + 1,
      'usageStats.lastAccessed': now
    };

    if (cached) {
      await MediaCache.updateOne(
        { _id: cached._id },
        { $set: cacheData }
      );
    } else {
      await MediaCache.create(cacheData);
    }

    res.status(200).json(normalizedData);

  } catch (error) {
    console.error(`Error fetching from ${source}:`, error);
    
    // 6. Se API falhar, retornar cache mesmo que expirado
    if (cached) {
      cached.cacheControl.errorCount += 1;
      await cached.save();
      return res.status(200).json(cached.essentialData);
    }
    
    res.status(500).json({ error: 'Failed to fetch media data' });
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