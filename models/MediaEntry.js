import mongoose from 'mongoose';

// Subesquema para progresso específico de cada tipo de mídia
const progressSchema = new mongoose.Schema({
  // Para filmes
  currentTime: {
    type: Number, // em minutos
    min: 0,
  },
  totalTime: {
    type: Number, // em minutos
    min: 0,
  },

  // Para séries e animes
  currentEpisode: {
    type: Number,
    min: 0,
  },
  currentSeason: {
    type: Number,
    min: 1,
    default: 1,
  },
  totalEpisodes: {
    type: Number,
    min: 0,
  },
  totalSeasons: {
    type: Number,
    min: 0,
  },

  // Para mangás
  currentVolume: {
    type: Number,
    min: 0,
  },
  currentChapter: {
    type: Number,
    min: 0,
  },
  currentPage: {
    type: Number,
    min: 0,
  },
  totalVolumes: {
    type: Number,
    min: 0,
  },
  totalChapters: {
    type: Number,
    min: 0,
  },
  totalPages: {
    type: Number,
    min: 0,
  },

  // Para livros
  totalPagesBook: {
    type: Number,
    min: 0,
  },

  // Para jogos
  hoursPlayed: {
    type: Number,
    min: 0,
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  pendingTasks: [{
    type: String,
    trim: true,
  }],
}, { _id: false });

// Subesquema para avaliação
const ratingSchema = new mongoose.Schema({
  value: {
    type: String,
    enum: ['terrible', 'bad', 'ok', 'good', 'great', 'perfect'],
  },
  score: {
    type: Number,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

// Subesquema para datas importantes
const timelineSchema = new mongoose.Schema({
  addedAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: {
    type: Date,
  },
  lastWatchedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  droppedAt: {
    type: Date,
  },
}, { _id: false });

// Subesquema para dados da API externa
const externalDataSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['tmdb', 'jikan', 'rawg', 'google_books', 'manual'],
    required: true,
  },
  externalId: {
    type: String,
    required: true,
  },
  apiRating: {
    type: Number,
    min: 0,
    max: 10,
  },
  apiVoteCount: {
    type: Number,
    min: 0,
  },
  popularity: {
    type: Number,
  },
  members: {
    type: Number,
  },
  rank: {
    type: Number,
  },
}, { _id: false });

const mediaEntrySchema = new mongoose.Schema({
  // Identificação do usuário
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Informações básicas da mídia
  mediaType: {
    type: String,
    enum: ['movie', 'series', 'anime', 'manga', 'book', 'game'],
    required: true,
  },

  // Dados gerais
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  originalTitle: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  posterUrl: {
    type: String,
    trim: true,
  },
  backdropUrl: {
    type: String,
    trim: true,
  },

  // Informações de lançamento
  releaseYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 5,
  },
  releaseDate: {
    type: Date,
  },

  // Gêneros e categorias
  genres: [{
    type: String,
    trim: true,
  }],
  tags: [{
    type: String,
    trim: true,
  }],

  // Status do usuário
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'dropped'],
    default: 'planned',
    required: true,
    index: true,
  },

  // Progresso específico
  progress: {
    type: progressSchema,
    default: () => ({}),
  },

  // Avaliação do usuário
  rating: {
    type: ratingSchema,
  },

  // Metadados de controle
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },

  // Dados da timeline
  timeline: {
    type: timelineSchema,
    default: () => ({}),
  },

  // Dados da API externa
  externalData: {
    type: externalDataSchema,
  },

  // Campos específicos por tipo
  specificData: {
    // Para filmes
    runtime: {
      type: Number, // em minutos
    },

    // Para séries e animes
    seasons: {
      type: Number,
    },
    episodes: {
      type: Number,
    },
    nextEpisodeDate: {
      type: Date,
    },

    // Para animes
    animeType: {
      type: String,
      enum: ['TV', 'Movie', 'OVA', 'ONA', 'Special'],
    },
    studio: {
      type: String,
    },

    // Para mangás
    volumes: {
      type: Number,
    },
    chapters: {
      type: Number,
    },
    mangaType: {
      type: String,
      enum: ['Manga', 'Manhwa', 'Manhua', 'Novel'],
    },

    // Para livros
    authors: [{
      type: String,
      trim: true,
    }],
    publisher: {
      type: String,
    },
    isbn: {
      type: String,
    },
    pageCount: {
      type: Number,
    },

    // Para jogos
    platforms: [{
      type: String,
      trim: true,
    }],
    developer: {
      type: String,
    },
    publisherGame: {
      type: String,
    },
    averagePlaytime: {
      type: Number, // em horas
    },
  },

  // Campos de controle
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true,
  },

  // Rascunhos e revisões
  notes: {
    type: String,
    trim: true,
    maxlength: 5000,
  },
  review: {
    type: String,
    trim: true,
    maxlength: 10000,
  },

  // Para busca e filtros
  searchableText: {
    type: String,
    index: 'text',
  },
}, {
  timestamps: true,
  collection: 'media_entries',
});

// Índices compostos para performance
mediaEntrySchema.index({ userId: 1, mediaType: 1 });
mediaEntrySchema.index({ userId: 1, status: 1, mediaType: 1 });
mediaEntrySchema.index({ userId: 1, mediaType: 1, externalData: 1 });
mediaEntrySchema.index({ userId: 1, isFavorite: 1 });
mediaEntrySchema.index({ userId: 1, priority: 1 });

// Índice para garantir unicidade (usuário não pode ter a mesma mídia duas vezes)
mediaEntrySchema.index(
  { userId: 1, mediaType: 1, 'externalData.externalId': 1 },
  {
    unique: true,
    partialFilterExpression: { 'externalData.externalId': { $exists: true } }
  }
);

// Índice para evitar duplicação de entradas manuais com mesmo título
mediaEntrySchema.index(
  { userId: 1, mediaType: 1, title: 1, 'externalData.source': 'manual' },
  {
    unique: true,
    partialFilterExpression: { 'externalData.source': 'manual' }
  }
);

// Middleware para atualizar automaticamente as datas da timeline
mediaEntrySchema.pre('save', function (next) {
  if (!this.timeline) {
    this.timeline = {};
  }

  // Atualizar addedAt se for novo documento
  if (this.isNew) {
    this.timeline.addedAt = new Date();
  }

  // Atualizar startedAt se status mudou para in_progress ou dropped
  if (this.isModified('status') &&
    (this.status === 'in_progress' || this.status === 'dropped') &&
    !this.timeline.startedAt) {
    this.timeline.startedAt = new Date();
  }

  // Atualizar lastWatchedAt quando houver alteração no progresso
  if (this.isModified('progress') &&
    (this.status === 'in_progress' || this.status === 'dropped')) {
    this.timeline.lastWatchedAt = new Date();
  }

  // Atualizar completedAt se status mudou para completed
  if (this.isModified('status') && this.status === 'completed') {
    this.timeline.completedAt = new Date();
  }

  // Atualizar droppedAt se status mudou para dropped
  if (this.isModified('status') && this.status === 'dropped') {
    this.timeline.droppedAt = new Date();
  }

  // Atualizar lastUpdated
  this.lastUpdated = new Date();

  // Criar campo searchableText para busca
  this.searchableText = [
    this.title,
    this.originalTitle,
    ...(this.genres || []),
    ...(this.specificData?.authors || []),
    this.specificData?.studio,
    this.specificData?.developer,
    this.specificData?.publisher,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Converter rating em valor numérico para ordenação
  if (this.rating?.value) {
    const ratingMap = {
      terrible: 1,
      bad: 2,
      ok: 3,
      good: 4,
      perfect: 5,
    };
    this.rating.score = ratingMap[this.rating.value];
  }

  next();
});

// Métodos de instância
mediaEntrySchema.methods.getProgressPercentage = function () {
  if (this.status === 'in_progress' || this.status === 'dropped') {
    switch (this.mediaType) {
      case 'movie':
        if (this.progress?.currentTime && this.specificData?.runtime) {
          return (this.progress.currentTime / this.specificData.runtime) * 100;
        }
        break;

      case 'series':
      case 'anime':
        if (this.progress?.currentEpisode && this.specificData?.episodes) {
          return (this.progress.currentEpisode / this.specificData.episodes) * 100;
        }
        break;

      case 'manga':
        if (this.progress?.currentChapter && this.specificData?.chapters) {
          return (this.progress.currentChapter / this.specificData.chapters) * 100;
        }
        if (this.progress?.currentVolume && this.specificData?.volumes) {
          return (this.progress.currentVolume / this.specificData.volumes) * 100;
        }
        break;

      case 'book':
        if (this.progress?.currentPage && this.specificData?.pageCount) {
          return (this.progress.currentPage / this.specificData.pageCount) * 100;
        }
        break;

      case 'game':
        if (this.progress?.completionPercentage) {
          return this.progress.completionPercentage;
        }
        if (this.progress?.hoursPlayed && this.specificData?.averagePlaytime) {
          return Math.min((this.progress.hoursPlayed / this.specificData.averagePlaytime) * 100, 100);
        }
        break;
    }
  }

  return 0;
};

mediaEntrySchema.methods.getTimeDisplay = function () {
  // Permitir para status in_progress e dropped
  if ((this.status === 'in_progress' || this.status === 'dropped') &&
    this.mediaType === 'movie' && this.progress?.currentTime) {
    const hours = Math.floor(this.progress.currentTime / 60);
    const minutes = this.progress.currentTime % 60;
    return `${hours}h ${minutes}m`;
  }

  if ((this.status === 'in_progress' || this.status === 'dropped') &&
    this.mediaType === 'game' && this.progress?.hoursPlayed) {
    return `${this.progress.hoursPlayed.toFixed(1)} horas`;
  }

  return null;
};

mediaEntrySchema.methods.getEpisodeDisplay = function () {
  // Permitir para status in_progress e dropped
  if ((this.status === 'in_progress' || this.status === 'dropped')) {
    if (['series', 'anime'].includes(this.mediaType) && this.progress?.currentEpisode) {
      const season = this.progress.currentSeason || 1;
      return `S${season}E${this.progress.currentEpisode}`;
    }

    if (this.mediaType === 'manga' && this.progress?.currentChapter) {
      const volume = this.progress.currentVolume ? `V${this.progress.currentVolume} ` : '';
      return `${volume}Cap. ${this.progress.currentChapter}`;
    }
  }

  return null;
};

// Métodos estáticos
mediaEntrySchema.statics.findByUserAndType = function (userId, mediaType, status) {
  const query = { userId, mediaType };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ lastUpdated: -1 });
};

mediaEntrySchema.statics.findFavorites = function (userId) {
  return this.find({ userId, isFavorite: true }).sort({ lastUpdated: -1 });
};

mediaEntrySchema.statics.getStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId.createFromHexString(userId) } },
    {
      $group: {
        _id: '$mediaType',
        total: { $sum: 1 },
        planned: {
          $sum: { $cond: [{ $eq: ['$status', 'planned'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        dropped: {
          $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] }
        },
        favorites: {
          $sum: { $cond: [{ $eq: ['$isFavorite', true] }, 1, 0] }
        },
      }
    }
  ]);

  return stats;
};

export default mongoose.models.MediaEntry || mongoose.model('MediaEntry', mediaEntrySchema);