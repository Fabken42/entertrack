import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import connectDB from '@/lib/database/connect';

export async function POST(request) {
  try {
    await connectDB();
    
    const { name, email, password } = await request.json();
    
    // Validar dados
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }
    
    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Criar usuário
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    
    // Remover senha do retorno
    const userWithoutPassword = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
    
    return NextResponse.json(
      { 
        success: true, 
        user: userWithoutPassword,
        message: 'Usuário criado com sucesso' 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}