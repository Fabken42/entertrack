import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/database/connect';
import User from '@/models/User';

export const authOptions = {
  // REMOVA o MongoDBAdapter e use session strategy
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  
  providers: [
    // Descomente quando tiver as credenciais
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email e senha são obrigatórios');
          }

          await connectDB();
          
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          
          if (!user) {
            throw new Error('Usuário não encontrado');
          }
          
          // Verificar se o usuário tem senha (não é usuário OAuth)
          if (!user.password) {
            throw new Error('Este email está cadastrado com login social. Use o login com Google.');
          }
          
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            throw new Error('Senha incorreta');
          }
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error(error.message || 'Erro na autenticação');
        }
      }
    })
  ],
  
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/login',
    newUser: '/dashboard',
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDB();
        
        // Se for login do Google
        if (account?.provider === 'google') {
          // Verificar se usuário já existe
          let existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Criar novo usuário com dados do Google
            existingUser = await User.create({
              name: user.name || profile?.name,
              email: user.email,
              image: user.image || profile?.picture,
              oauthProvider: 'google',
              oauthId: profile?.sub,
              password: null, // Usuários OAuth não têm senha
            });
          } else if (!existingUser.oauthProvider) {
            // Se usuário existe mas não tem oauth, adicionar
            existingUser.oauthProvider = 'google';
            existingUser.oauthId = profile?.sub;
            existingUser.image = user.image || profile?.picture || existingUser.image;
            await existingUser.save();
          }
          
          // Atualizar ID do usuário no objeto do NextAuth
          user.id = existingUser._id.toString();
        }
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    
    async jwt({ token, user, account, profile }) {
      // Persistir dados do usuário no token JWT
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Enviar dados do token para a sessão
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
        session.accessToken = token.accessToken;
        session.provider = token.provider;
      }
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // Redirecionar para dashboard após login
      if (url === baseUrl || url === `${baseUrl}/login` || url === `${baseUrl}/register`) {
        return `${baseUrl}/dashboard`;
      }
      return url;
    }
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
};