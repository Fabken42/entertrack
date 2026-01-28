// /entertrack/models/MediaBaseSchema.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

export const MediaBaseSchema = new Schema({
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
      id: Number,
      name: String
    }],
    averageRating: { type: Number },
    ratingCount: { type: Number },
    releasePeriod: {
      year: { type: Number },
      month: { type: Number, min: 1, max: 12 }
    }
  },

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

// Adicionar índice para busca por período
MediaBaseSchema.index({ 'essentialData.releasePeriod.year': 1, 'essentialData.releasePeriod.month': 1 });

// Helper para formatar o período
MediaBaseSchema.methods.getFormattedReleaseDate = function() {
  if (!this.essentialData.releasePeriod || !this.essentialData.releasePeriod.year) {
    return null;
  }
  
  const { year, month } = this.essentialData.releasePeriod;
  if (month) {
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return `${monthNames[month - 1]} ${year}`;
  }
  return year.toString();
};

export default MediaBaseSchema;