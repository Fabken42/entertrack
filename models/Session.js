// /models/Session.js
import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  userAgent: String,
  ipAddress: String,
});

// 🔥 PADRÃO CORRETO: Verificar se o modelo já existe
const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);

export default Session;