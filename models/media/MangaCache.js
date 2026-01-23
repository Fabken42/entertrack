import mongoose from 'mongoose';
const { Schema } = mongoose;
import MediaBaseSchema from './MediaBase.js';

const MangaCacheSchema = new Schema({
  ...MediaBaseSchema.obj,
  essentialData: {
    ...MediaBaseSchema.obj.essentialData,
    chapters: { type: Number },
    volumes: { type: Number },
    popularity: { type: Number },
    members: { type: Number },
    authors: [{ type: String }]
  }
});

// Coleção específica para mangá
const MangaCache = mongoose.models.MangaCache || 
  mongoose.model('MangaCache', MangaCacheSchema, 'mangacaches');

export default MangaCache;