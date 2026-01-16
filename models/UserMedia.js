// /models/UserMedia.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserMediaSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  mediaCacheId: {
    type: Schema.Types.ObjectId,
    ref: 'MediaCache',
    required: true,
    index: true
  },

  // Status pessoal
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'dropped'],
    default: 'planned'
  },

  // Progresso flexível para diferentes tipos de mídia
  progress: {
    // Campos específicos por tipo de mídia
    details: {
      // Para animes: somente episódios
      episodes: { type: Number, default: 0 },

      // Para mangás: volumes e capítulos
      volumes: { type: Number, default: 0 },
      chapters: { type: Number, default: 0 },

      // Para séries: temporadas e episódios
      seasons: { type: Number, default: 0 },

      // Para filmes: minutos
      minutes: { type: Number, default: 0 },

      hours: { type: Number, default: 0 },

      // Progresso percentual (para qualquer mídia)
      percentage: { type: Number, default: 0 }
    },

    tasks: [{
      name: { type: String, required: true },
      completed: { type: Boolean, default: false },
      addedAt: { type: Date, default: Date.now }
    }],

    // Data da última atualização
    lastUpdated: { type: Date, default: Date.now }
  },

  // Avaliação pessoal
  userRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },

  // Comentários pessoais
  personalNotes: { type: String, maxlength: 3000, default: '' },
  tags: [{ type: String }],

  // Datas de controle
  startedAt: { type: Date },
  completedAt: { type: Date },
  droppedAt: { type: Date },

  // Metadados
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  indexes: [
    { userId: 1, status: 1 },
    { userId: 1, mediaCacheId: 1, unique: true },
    { userId: 1, createdAt: -1 }
  ]
});

UserMediaSchema.methods.calculateTaskProgress = function () {
  if (this.mediaCacheId?.mediaType !== 'game') {
    return null;
  }

  const tasks = this.progress?.tasks || [];
  if (tasks.length === 0) {
    return {
      completed: 0,
      total: 0,
      percentage: 0
    };
  }

  const completedTasks = tasks.filter(task => task.completed).length;
  const percentage = Math.round((completedTasks / tasks.length) * 100);

  return {
    completed: completedTasks,
    total: tasks.length,
    percentage: percentage
  };
};

UserMediaSchema.methods.getProgressInfo = function () {
  const mediaType = this.mediaCacheId?.mediaType;
  const progress = this.progress?.details || {};

  switch (mediaType) {
    case 'anime':
      return {
        type: 'anime',
        episodes: progress.episodes || 0,
        unit: 'episodes'
      };
    case 'manga':
      return {
        type: 'manga',
        volumes: progress.volumes || 0,
        chapters: progress.chapters || 0,
        unit: 'chapters'
      };
    case 'series':
      return {
        type: 'series',
        seasons: progress.seasons || 0,
        episodes: progress.episodes || 0,
        unit: 'episodes'
      };
    case 'game':
      const taskProgress = this.calculateTaskProgress();
      return {
        type: 'game',
        hours: progress.hours || 0,
        tasks: taskProgress,
        pendingTasks: this.progress?.tasks || [],
        unit: 'tasks'
      };
    case 'movie':
      return {
        type: 'movie',
        minutes: progress.minutes || 0,
        unit: 'minutes'
      };
    default:
      return {
        type: 'generic',
        value: progress.percentage || 0,
        unit: 'percentage'
      };
  }
};

UserMediaSchema.methods.updateProgress = function (data) {
  const mediaType = this.mediaCacheId?.mediaType;

  if (!this.progress.details) {
    this.progress.details = {};
  }

  switch (mediaType) {
    case 'anime':
      if (data.episodes !== undefined) {
        this.progress.details.episodes = data.episodes;
      }
      break;
    case 'manga':
      if (data.volumes !== undefined) {
        this.progress.details.volumes = data.volumes;
      }
      if (data.chapters !== undefined) {
        this.progress.details.chapters = data.chapters;
      }
      break;
    case 'series':
      if (data.seasons !== undefined) {
        this.progress.details.seasons = data.seasons;
      }
      if (data.episodes !== undefined) {
        this.progress.details.episodesInSeason = data.episodes;
      }
      break;
    default:
      if (data.percentage !== undefined) {
        this.progress.details.percentage = data.percentage;
      }
  }

  this.progress.lastUpdated = new Date();
  this.markModified('progress');
};

const UserMedia = mongoose.models.UserMedia || mongoose.model('UserMedia', UserMediaSchema);

export default UserMedia;