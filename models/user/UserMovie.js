import mongoose from 'mongoose';
const { Schema } = mongoose;
import UserMediaBaseSchema from './UserMediaBase.js';

const UserMovieSchema = new Schema({
  ...UserMediaBaseSchema.obj,
  progress: {
    minutes: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }
});

// Coleção específica para filmes do usuário
const UserMovie = mongoose.models.UserMovie ||
  mongoose.model('UserMovie', UserMovieSchema, 'usermovies');

export default UserMovie;