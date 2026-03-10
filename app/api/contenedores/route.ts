import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Contenedor } from '@/models/Contenedor';

export async function GET() {
  try {
    await connectDB();
    const contenedores = await Contenedor.find().sort({ creadoEn: -1 });
    return NextResponse.json(contenedores);
  } catch (error) {
    console.error('Error fetching contenedores:', error);
    return NextResponse.json({ error: 'Error al obtener contenedores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    
    const { peso, tipoResiduo, ubicacion, estado } = data;
    
    if (!peso || !tipoResiduo || !ubicacion || !estado) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const contenedor = await Contenedor.create({
      peso,
      tipoResiduo,
      ubicacion,
      estado,
    });

    return NextResponse.json(contenedor, { status: 201 });
  } catch (error) {
    console.error('Error creating contenedor:', error);
    return NextResponse.json({ error: 'Error al crear contenedor' }, { status: 500 });
  }
}
