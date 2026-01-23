import mongoose from 'mongoose';
const { Schema } = mongoose;

export const MediaBaseSchema = new Schema({
  // Campos comuns a todos os tipos
  sourceApi: {
    type: String,
    enum: ['tmdb', 'jikan', 'rawg', 'manual'],
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
    enum: ['movie', 'series', 'anime', 'manga', 'game'],
    required: true,
    index: true
  },
  essentialData: {
    title: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    genres: [{
      id: String,
      name: String
    }],
    averageRating: { type: Number },
    ratingCount: { type: Number },
    releaseYear: { type: Number }
  },

  // Cache control (comum a todos)
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
  }
}, {
  timestamps: true
});

// Não exporta um modelo, apenas o schema
export default MediaBaseSchema;