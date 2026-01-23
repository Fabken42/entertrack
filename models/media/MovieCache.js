import mongoose from 'mongoose';
const { Schema } = mongoose;
import MediaBaseSchema from './MediaBase.js';

const MovieCacheSchema = new Schema({
  ...MediaBaseSchema.obj,
  essentialData: {
    ...MediaBaseSchema.obj.essentialData,
    runtime: { type: Number }
  }
});

// Coleção específica para filmes
const MovieCache = mongoose.models.MovieCache || 
  mongoose.model('MovieCache', MovieCacheSchema, 'moviecaches');

export default MovieCache;