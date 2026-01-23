import mongoose from 'mongoose';
const { Schema } = mongoose;
import UserMediaBaseSchema from './UserMediaBase.js';

const UserSeriesSchema = new Schema({
  ...UserMediaBaseSchema.obj,
  progress: {
    episodes: { type: Number, default: 0 },
    seasons: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }
});

// Coleção específica para séries do usuário
const UserSeries = mongoose.models.UserSeries ||
  mongoose.model('UserSeries', UserSeriesSchema, 'userseries');

export default UserSeries;