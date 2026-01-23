// Exporta todos os modelos de mídia
import MovieCache from './MovieCache.js';
import SeriesCache from './SeriesCache.js';
import AnimeCache from './AnimeCache.js';
import MangaCache from './MangaCache.js';
import GameCache from './GameCache.js';

export {
  MovieCache,
  SeriesCache,
  AnimeCache,
  MangaCache,
  GameCache
};

export function getCacheModelByType(mediaType) {
  const models = {
    'movie': MovieCache,
    'series': SeriesCache,
    'anime': AnimeCache,
    'manga': MangaCache,
    'game': GameCache
  };

  const model = models[mediaType];
  if (!model) {
    throw new Error(`Tipo de mídia não suportado: ${mediaType}`);
  }
  return model;
}