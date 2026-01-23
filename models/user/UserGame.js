import mongoose from 'mongoose';
const { Schema } = mongoose;
import UserMediaBaseSchema from './UserMediaBase.js';

const UserGameSchema = new Schema({
  ...UserMediaBaseSchema.obj,
  progress: {
    hours: { type: Number, default: 0 },
    tasks: [{
      name: { type: String, required: true },
      completed: { type: Boolean, default: false },
      addedAt: { type: Date, default: Date.now }
    }],
    lastUpdated: { type: Date, default: Date.now }
  }
});

UserGameSchema.methods.calculateTaskProgress = function () {
  const tasks = this.progress?.tasks || [];
  if (tasks.length === 0) return null;

  const completedTasks = tasks.filter(task => task.completed).length;
  return {
    completed: completedTasks,
    total: tasks.length,
    percentage: Math.round((completedTasks / tasks.length) * 100)
  };
};

// Coleção específica para games do usuário
const UserGame = mongoose.models.UserGame ||
  mongoose.model('UserGame', UserGameSchema, 'usergames');

export default UserGame;