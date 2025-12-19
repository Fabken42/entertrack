// /models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  password: {
    type: String,
    // Senha é obrigatória apenas para usuários não-OAuth
  },
  image: {
    type: String,
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'github', null],
    default: null,
  },
  oauthId: {
    type: String,
    index: true,
    sparse: true, // Permite valores nulos para usuários não-OAuth
  },
  emailVerified: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: 'pt-BR',
    },
  },
  stats: {
    totalEntries: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
}, {
  timestamps: true,
});

// Middleware para atualizar updatedAt
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Índice composto para buscas rápidas
UserSchema.index({ email: 1, oauthProvider: 1 });

// Método para verificar se é usuário OAuth
UserSchema.methods.isOAuthUser = function() {
  return !!this.oauthProvider;
};

// Método para obter dados públicos (sem senha)
UserSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// 🔥 PADRÃO CORRETO: Verificar se o modelo já existe
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;