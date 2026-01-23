// /models/index.js - Ponto único de exportação
import User from './User.js';
import Session from './Session.js';

// Importa todos os novos modelos
import {
  MovieCache,
  SeriesCache,
  AnimeCache,
  MangaCache,
  GameCache,
  getCacheModelByType
} from './media/index.js';

import {
  UserMovie,
  UserSeries,
  UserAnime,
  UserManga,
  UserGame,
  getUserMediaModelByType
} from './user/index.js';

// Exportações nomeadas
export {
  User,
  Session,
  
  // Modelos específicos de cache
  MovieCache,
  SeriesCache,
  AnimeCache,
  MangaCache,
  GameCache,
  
  // Modelos específicos de user media
  UserMovie,
  UserSeries,
  UserAnime,
  UserManga,
  UserGame,
  
  // Funções auxiliares
  getCacheModelByType,
  getUserMediaModelByType
};

// ✅ NOVO: Exportação por tipo para facilitar a importação
export const mediaModels = {
  movie: MovieCache,
  series: SeriesCache,
  anime: AnimeCache,
  manga: MangaCache,
  game: GameCache
};

export const userMediaModels = {
  movie: UserMovie,
  series: UserSeries,
  anime: UserAnime,
  manga: UserManga,
  game: UserGame
};

// ✅ FUNÇÃO DE COMPATIBILIDADE: Para substituir chamadas diretas a MediaBase
export async function findMediaCacheById(id) {
  // Tentar buscar em cada tipo de cache
  const mediaTypes = ['movie', 'series', 'anime', 'manga', 'game'];
  
  for (const mediaType of mediaTypes) {
    try {
      const model = getCacheModelByType(mediaType);
      const cache = await model.findById(id);
      if (cache) return cache;
    } catch (error) {
      // Continuar para o próximo tipo
      continue;
    }
  }
  
  return null;
}

// ✅ FUNÇÃO DE COMPATIBILIDADE: Para substituir chamadas diretas a UserMediaBase
export async function findUserMediaById(id) {
  // Tentar buscar em cada tipo de user media
  const mediaTypes = ['movie', 'series', 'anime', 'manga', 'game'];
  
  for (const mediaType of mediaTypes) {
    try {
      const model = getUserMediaModelByType(mediaType);
      const userMedia = await model.findById(id);
      if (userMedia) return userMedia;
    } catch (error) {
      // Continuar para o próximo tipo
      continue;
    }
  }
  
  return null;
}

// ✅ FUNÇÃO DE COMPATIBILIDADE: Para encontrar múltiplos user medias
export async function findUserMediasByUserId(userId) {
  const results = [];
  const mediaTypes = ['movie', 'series', 'anime', 'manga', 'game'];
  
  for (const mediaType of mediaTypes) {
    try {
      const model = getUserMediaModelByType(mediaType);
      const userMedias = await model.find({ userId });
      results.push(...userMedias);
    } catch (error) {
      console.error(`Error fetching ${mediaType} for user ${userId}:`, error);
      continue;
    }
  }
  
  return results;
}