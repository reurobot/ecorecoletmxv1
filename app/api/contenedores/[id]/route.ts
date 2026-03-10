import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Contenedor } from '@/models/Contenedor';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await request.json();
    
    const contenedor = await Contenedor.findByIdAndUpdate(id, data, { new: true });
    
    if (!contenedor) {
      return NextResponse.json({ error: 'Contenedor no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(contenedor);
  } catch (error) {
    console.error('Error updating contenedor:', error);
    return NextResponse.json({ error: 'Error al actualizar contenedor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const contenedor = await Contenedor.findByIdAndDelete(id);
    
    if (!contenedor) {
      return NextResponse.json({ error: 'Contenedor no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contenedor:', error);
    return NextResponse.json({ error: 'Error al eliminar contenedor' }, { status: 500 });
  }
}
