import mongoose from 'mongoose';
const { Schema } = mongoose;

// Schema base para reutilização, não é um modelo registrado
export const UserMediaBaseSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Referência ao cache específico
  mediaCacheId: {
    type: Schema.Types.ObjectId,
    required: true
    // Nota: Referência dinâmica removida, será gerenciada nas APIs
  },
  
  mediaType: {
    type: String,
    enum: ['movie', 'series', 'anime', 'manga', 'game'],
    required: true
  },
  
  // Campos comuns
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'dropped'],
    default: 'planned'
  },
  
  userRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  
  personalNotes: { type: String, maxlength: 3000, default: '' },
  tags: [{ type: String }],
  
  // Datas de controle
  startedAt: { type: Date },
  completedAt: { type: Date },
  droppedAt: { type: Date },
  
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Não exportamos um modelo, apenas o schema
export default UserMediaBaseSchema;

