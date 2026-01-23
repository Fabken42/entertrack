import mongoose from 'mongoose';
const { Schema } = mongoose;
import UserMediaBaseSchema from './UserMediaBase.js';

const UserMangaSchema = new Schema({
  ...UserMediaBaseSchema.obj,
  progress: {
    volumes: { type: Number, default: 0 },
    chapters: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }
});

// Coleção específica para mangá do usuário
const UserManga = mongoose.models.UserManga ||
  mongoose.model('UserManga', UserMangaSchema, 'usermangas');

export default UserManga;