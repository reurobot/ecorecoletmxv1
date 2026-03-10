import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    const administradores = await User.find({ rol: 'admin' }).select('-password');
    return NextResponse.json(administradores);
  } catch (error) {
    console.error('Error fetching administradores:', error);
    return NextResponse.json({ error: 'Error al obtener administradores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    
    const { email, password, nombre } = data;
    
    if (!email || !password || !nombre) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    const admin = await User.create({
      email: email.toLowerCase(),
      password,
      nombre,
      rol: 'admin',
    });

    return NextResponse.json({ uid: admin._id, nombre: admin.nombre, email: admin.email }, { status: 201 });
  } catch (error) {
    console.error('Error creating administrador:', error);
    return NextResponse.json({ error: 'Error al crear administrador' }, { status: 500 });
  }
}
