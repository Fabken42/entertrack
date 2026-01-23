import mongoose from 'mongoose';
const { Schema } = mongoose;
import UserMediaBaseSchema from './UserMediaBase.js';

const UserAnimeSchema = new Schema({
  ...UserMediaBaseSchema.obj,
  progress: {
    episodes: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }
});

const UserAnime = mongoose.models.UserAnime ||
  mongoose.model('UserAnime', UserAnimeSchema, 'useranimes');

export default UserAnime;

