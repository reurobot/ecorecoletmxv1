import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Camion } from '@/models/Camion';

export async function GET() {
  try {
    await connectDB();
    const camiones = await Camion.find().sort({ createdAt: -1 });
    return NextResponse.json({ camiones });
  } catch (error) {
    console.error('Error fetching camiones:', error);
    return NextResponse.json({ error: 'Error al obtener camiones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    
    const { placa, marca, costo, capacidad, estado } = data;
    
    if (!placa || !marca || !costo || !capacidad || !estado) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const camion = await Camion.create({
      placa,
      marca,
      costo,
      capacidad,
      estado,
    });

    return NextResponse.json({ success: true, id: camion._id }, { status: 201 });
  } catch (error) {
    console.error('Error creating camion:', error);
    return NextResponse.json({ error: 'Error al crear camion' }, { status: 500 });
  }
}
