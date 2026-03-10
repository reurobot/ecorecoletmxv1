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

    const chofer = await User.findByIdAndUpdate(uid, updateData, { new: true }).select('-password');
    
    if (!chofer) {
      return NextResponse.json({ error: 'Chofer no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ uid: chofer._id, nombre: chofer.nombre, email: chofer.email });
  } catch (error) {
    console.error('Error updating chofer:', error);
    return NextResponse.json({ error: 'Error al actualizar chofer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    await connectDB();
    const { uid } = await params;
    
    const chofer = await User.findByIdAndDelete(uid);
    
    if (!chofer) {
      return NextResponse.json({ error: 'Chofer no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ uid });
  } catch (error) {
    console.error('Error deleting chofer:', error);
    return NextResponse.json({ error: 'Error al eliminar chofer' }, { status: 500 });
  }
}
