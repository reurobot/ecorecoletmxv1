import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    await connectDB();
    const { uid } = await params;
    const data = await request.json();
    
    const { nombre, email, password } = data;
    
    const updateData: any = {};
    if (nombre) updateData.nombre = nombre;
    if (email) updateData.email = email.toLowerCase();
    if (password && password.length >= 8) updateData.password = password;

    const admin = await User.findByIdAndUpdate(uid, updateData, { new: true }).select('-password');
    
    if (!admin) {
      return NextResponse.json({ error: 'Administrador no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ uid: admin._id, nombre: admin.nombre, email: admin.email });
  } catch (error) {
    console.error('Error updating administrador:', error);
    return NextResponse.json({ error: 'Error al actualizar administrador' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    await connectDB();
    const { uid } = await params;
    
    const admin = await User.findByIdAndDelete(uid);
    
    if (!admin) {
      return NextResponse.json({ error: 'Administrador no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ uid });
  } catch (error) {
    console.error('Error deleting administrador:', error);
    return NextResponse.json({ error: 'Error al eliminar administrador' }, { status: 500 });
  }
}
