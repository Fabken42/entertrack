import mongoose from 'mongoose';
const { Schema } = mongoose;
import MediaBaseSchema from './MediaBase.js';

const GameCacheSchema = new Schema({
  ...MediaBaseSchema.obj,
  essentialData: {
    ...MediaBaseSchema.obj.essentialData,
    platforms: [{ type: String }],
    metacritic: { type: Number }
  }
});

// Coleção específica para games
const GameCache = mongoose.models.GameCache || 
  mongoose.model('GameCache', GameCacheSchema, 'gamecaches');

export default GameCache;