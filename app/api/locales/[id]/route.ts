import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Local } from '@/models/Local';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await request.json();
    
    const local = await Local.findByIdAndUpdate(id, data, { new: true });
    
    if (!local) {
      return NextResponse.json({ error: 'Local no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ local });
  } catch (error) {
    console.error('Error updating local:', error);
    return NextResponse.json({ error: 'Error al actualizar local' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const local = await Local.findByIdAndDelete(id);
    
    if (!local) {
      return NextResponse.json({ error: 'Local no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting local:', error);
    return NextResponse.json({ error: 'Error al eliminar local' }, { status: 500 });
  }
}
