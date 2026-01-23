import mongoose from 'mongoose';
const { Schema } = mongoose;
import MediaBaseSchema from './MediaBase.js';

const SeriesCacheSchema = new Schema({
  ...MediaBaseSchema.obj,
  essentialData: {
    ...MediaBaseSchema.obj.essentialData,
    episodes: { type: Number },
    seasons: { type: Number },
    episodesPerSeason: [{ type: Number }]
  }
});

// Coleção específica para séries
const SeriesCache = mongoose.models.SeriesCache || 
  mongoose.model('SeriesCache', SeriesCacheSchema, 'seriescaches');

export default SeriesCache;