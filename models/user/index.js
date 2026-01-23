import UserMovie from './UserMovie.js';
import UserSeries from './UserSeries.js';
import UserAnime from './UserAnime.js';
import UserManga from './UserManga.js';
import UserGame from './UserGame.js';

// Não exportamos mais UserMediaBase pois não será um modelo
// Exportamos apenas o schema base para reutilização

export {
  UserMovie,
  UserSeries,
  UserAnime,
  UserManga,
  UserGame
};

export function getUserMediaModelByType(mediaType) {
  const models = {
    'movie': UserMovie,
    'series': UserSeries,
    'anime': UserAnime,
    'manga': UserManga,
    'game': UserGame
  };

  const model = models[mediaType];
  if (!model) {
    throw new Error(`Tipo de mídia do usuário não suportado: ${mediaType}`);
  }
  return model;
}