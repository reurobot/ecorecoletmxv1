import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Local } from '@/models/Local';

export async function GET() {
  try {
    await connectDB();
    const locales = await Local.find().sort({ createdAt: -1 });
    return NextResponse.json({ locales });
  } catch (error) {
    console.error('Error fetching locales:', error);
    return NextResponse.json({ error: 'Error al obtener locales' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    
    const { nombreNegocio, nombrePropietario, direccion, telefono, contenedores } = data;
    
    if (!nombreNegocio || !nombrePropietario || !direccion || !telefono || !contenedores) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const local = await Local.create({
      nombreNegocio,
      nombrePropietario,
      direccion,
      telefono,
      contenedores,
    });

    return NextResponse.json({ local }, { status: 201 });
  } catch (error) {
    console.error('Error creating local:', error);
    return NextResponse.json({ error: 'Error al crear local' }, { status: 500 });
  }
}
