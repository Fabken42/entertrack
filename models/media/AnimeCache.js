import mongoose from 'mongoose';
const { Schema } = mongoose;
import MediaBaseSchema from './MediaBase.js';

const AnimeCacheSchema = new Schema({
  ...MediaBaseSchema.obj,
  essentialData: {
    ...MediaBaseSchema.obj.essentialData,
    episodes: { type: Number },
    popularity: { type: Number },
    members: { type: Number },
    studios: [{ type: String }],
    category: { type: String },
  }
});

// Coleção específica para anime
const AnimeCache = mongoose.models.AnimeCache || 
  mongoose.model('AnimeCache', AnimeCacheSchema, 'animecaches');

export default AnimeCache;