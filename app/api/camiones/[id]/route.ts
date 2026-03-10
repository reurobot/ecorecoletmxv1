import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Camion } from '@/models/Camion';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await request.json();
    
    const camion = await Camion.findByIdAndUpdate(id, data, { new: true });
    
    if (!camion) {
      return NextResponse.json({ error: 'Camion no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating camion:', error);
    return NextResponse.json({ error: 'Error al actualizar camion' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const camion = await Camion.findByIdAndDelete(id);
    
    if (!camion) {
      return NextResponse.json({ error: 'Camion no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting camion:', error);
    return NextResponse.json({ error: 'Error al eliminar camion' }, { status: 500 });
  }
}
