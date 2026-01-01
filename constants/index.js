import {
  Bookmark, Calendar, PlayCircle, CheckCircle, XCircle,
  Star, TrendingUp
} from 'lucide-react';

export const FETCH_MEDIA_ITEMS_LIMIT = '20';

export const statusColors = [
  { value: 'planned', label: '🟡 Planejado' },
  { value: 'in_progress', label: '🔵 Em Progresso' },
  { value: 'completed', label: '🟢 Concluído' },
  { value: 'dropped', label: '🔴 Abandonado' }, 
];

export const statusOptions = [
  { value: 'all', label: 'Todos', icon: Bookmark, color: 'bg-gray-500' },
  { value: 'planned', label: 'Planejados', icon: Calendar, color: 'bg-yellow-500' },
  { value: 'in_progress', label: 'Em Progresso', icon: PlayCircle, color: 'bg-blue-500' },
  { value: 'completed', label: 'Concluídos', icon: CheckCircle, color: 'bg-green-500' },
  { value: 'dropped', label: 'Desistidos', icon: XCircle, color: 'bg-red-500' }
];

export const sortOptions = [
  { value: 'recent', label: 'Mais Recentes', icon: Calendar },
  { value: 'title', label: 'Título (A-Z)', icon: Bookmark },
  { value: 'rating', label: 'Melhor Avaliados', icon: Star },
  { value: 'progress', label: 'Progresso', icon: TrendingUp }
];


export const ratingLabels = {
  1: { label: 'Péssimo', color: 'text-red-400' },
  2: { label: 'Ruim', color: 'text-orange-400' },
  3: { label: 'OK', color: 'text-yellow-400' },
  4: { label: 'Bom', color: 'text-lime-400' },
  5: { label: 'Perfeito', color: 'text-emerald-400' }
};

//modificar para usar generos de cada midia
export const availableGenres = [
  'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia',
  'Ficção Científica', 'Terror', 'Romance', 'Slice of Life',
  'Sobrenatural', 'Mistério', 'Mecha', 'Esportes', 'Musical'
];

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

export const RATING_OPTIONS = ['terrible', 'bad', 'ok', 'good', 'perfect'];