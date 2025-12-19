// /models/UserMedia.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserMediaSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Referência ao cache (único vínculo com dados externos)
  mediaCacheId: {
    type: Schema.Types.ObjectId,
    ref: 'MediaCache',
    required: true,
    index: true
  },

  // Status pessoal
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'dropped'],
    default: 'planned'
  },

  // Progresso flexível
  progress: {
    // Valor atual (episódio, capítulo, página, minutos, etc.)
    current: { type: Number, default: 0 },
    // Unidade de progresso
    unit: {
      type: String,
      enum: ['episodes', 'chapters', 'pages', 'minutes', 'hours', 'percentage', 'seasons'],
      default: 'episodes'
    },
    // Data da última atualização
    lastUpdated: { type: Date, default: Date.now }
  },

  // Avaliação pessoal
  userRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },

  // comentários pessoais
  personalNotes: { type: String, maxlength: 3000, default: '' },
  tags: [{ type: String }],

  // Datas de controle
  startedAt: { type: Date },
  completedAt: { type: Date },
  droppedAt: { type: Date },

  // Metadados
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  indexes: [
    // Busca rápida por usuário + status
    { userId: 1, status: 1 },
    // Evitar duplicatas
    { userId: 1, mediaCacheId: 1, unique: true },
    // Ordenação por data de adição
    { userId: 1, createdAt: -1 }
  ]
});

// 🔥 PADRÃO CORRETO: Verificar se o modelo já existe
const UserMedia = mongoose.models.UserMedia || mongoose.model('UserMedia', UserMediaSchema);

export default UserMedia;