export const DISCOVERY_ITEMS_PER_PAGE = 30;

export const MEDIA_TYPES = {
  movie: 'Filme',
  series: 'Série',
  anime: 'Anime',
  book: 'Livro',
  game: 'Game'
};

export const STATUS_LABELS = {
  planned: 'Planejado',
  in_progress: 'Em Progresso',
  completed: 'Concluído',
  dropped: 'Abandonado'
};

export const RATING_LABELS = {
  terrible: 'Péssimo',
  bad: 'Ruim',
  ok: 'Ok',
  good: 'Bom',
  great: 'Ótimo',
  perfect: 'Perfeito'
};

export const RATING_VALUES = {
  terrible: 1,
  bad: 2,
  ok: 3,
  good: 4,
  great: 5,
  perfect: 6
};

export const GENRES = {
  movie: [
    'Ação', 'Aventura', 'Animação', 'Comédia', 'Crime', 'Documentário',
    'Drama', 'Família', 'Fantasia', 'Ficção Científica', 'Guerra',
    'História', 'Horror', 'Música', 'Mistério', 'Romance', 'Suspense',
    'Terror', 'Thriller'
  ],
  series: [
    'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Ficção Científica',
    'Horror', 'Mistério', 'Romance', 'Suspense', 'Thriller', 'Crime'
  ],
  anime: [
    'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Ficção Científica',
    'Horror', 'Mistério', 'Romance', 'Suspense', 'Slice of Life', 'Esportes',
    'Sobrenatural', 'Mecha', 'Isekai', 'Shounen', 'Shoujo', 'Seinen', 'Josei'
  ],
  book: [
    'Ficção', 'Não-Ficção', 'Fantasia', 'Ficção Científica', 'Mistério',
    'Romance', 'Suspense', 'Horror', 'Biografia', 'História', 'Autoajuda',
    'Negócios', 'Young Adult', 'Infantil'
  ],
  game: [
    'Ação', 'Aventura', 'RPG', 'Estratégia', 'Esportes', 'Corrida',
    'Tiro', 'Luta', 'Quebra-cabeça', 'Simulação', 'Indie', 'MMO'
  ]
};