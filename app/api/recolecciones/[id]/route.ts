import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Recoleccion } from '@/models/Recoleccion';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await request.json();
    
    const recoleccion = await Recoleccion.findByIdAndUpdate(id, data, { new: true });
    
    if (!recoleccion) {
      return NextResponse.json({ error: 'Recoleccion no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating recoleccion:', error);
    return NextResponse.json({ error: 'Error al actualizar recoleccion' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const recoleccion = await Recoleccion.findByIdAndDelete(id);
    
    if (!recoleccion) {
      return NextResponse.json({ error: 'Recoleccion no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recoleccion:', error);
    return NextResponse.json({ error: 'Error al eliminar recoleccion' }, { status: 500 });
  }
}
