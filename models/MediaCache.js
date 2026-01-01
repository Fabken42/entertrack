import mongoose from 'mongoose';
const { Schema } = mongoose;

const MediaCacheSchema = new Schema({
  sourceApi: {
    type: String,
    enum: ['tmdb', 'jikan', 'rawg', 'google_books', 'manual'],
    required: true,
    index: true
  },
  sourceId: {
    type: String,
    required: true,
    index: true
  },

  mediaType: {
    type: String,
    enum: ['movie', 'series', 'anime', 'manga', 'game', 'book'],
    required: true,
    index: true
  },

  essentialData: {
    title: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    releaseYear: { type: Number },

    status: { type: String }, // 'finished', 'ongoing', 'upcoming'

    // Campos específicos por tipo
    episodes: { type: Number },
    episodesPerSeason: [{ type: Number }],
    seasons: { type: Number },
    chapters: { type: Number },
    volumes: { type: Number },
    pageCount: { type: Number },
    runtime: { type: Number }, //em minutos
    platforms: [{ type: String }],

    // Gêneros
    genres: [{
      id: String,
      name: String
    }],

    // Classificação
    averageRating: { type: Number },
    ratingCount: { type: Number },
    metacriticScore: { type: Number },

    category: { type: String }, // Ranking de popularidade
    popularity: { type: Number }, // Ranking de popularidade
    members: { type: Number },    // Número de membros
    studios: [{ type: String }],  // Estúdios
    authors: [{ type: String }],  // Autores (manga)

    // Outros campos úteis
    source: { type: String },     // Ex: 'jikan', 'tmdb'
    sourceId: { type: String }  // ID na API original
  },

  // 🔥 DADOS COMPLEMENTARES (menos usados)
  fullData: {
    type: Object,
    default: {}
  },

  // Cache control
  cacheControl: {
    lastFetched: { type: Date, default: Date.now },
    nextFetch: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
    ttl: { type: Number, default: 86400 },
    fetchCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 }
  },

  usageStats: {
    userCount: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
    accessCount: { type: Number, default: 0 }
  },

  version: { type: String, default: '1.0' } // 🔥 Atualize a versão
}, {
  timestamps: true,
  indexes: [
    { sourceApi: 1, sourceId: 1, mediaType: 1, unique: true },
    { 'cacheControl.nextFetch': 1 },
    { 'usageStats.userCount': -1 },
    { mediaType: 1, category: 1 },
  ]
});

const MediaCache = mongoose.models.MediaCache || mongoose.model('MediaCache', MediaCacheSchema);
export default MediaCache;