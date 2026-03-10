import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Recoleccion } from '@/models/Recoleccion';

export async function GET() {
  try {
    await connectDB();
    const recolecciones = await Recoleccion.find().sort({ createdAt: -1 });
    return NextResponse.json(recolecciones);
  } catch (error) {
    console.error('Error fetching recolecciones:', error);
    return NextResponse.json({ error: 'Error al obtener recolecciones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    
    const { 
      choferId, choferNombre, camionId, localId, localNombre, 
      contenedores, creadoPor, status, pago, formaPago, cantidadCobrada, fechaCreacion 
    } = data;
    
    if (!choferId || !choferNombre || !camionId || !localId || !localNombre || !contenedores || !creadoPor) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const recoleccion = await Recoleccion.create({
      choferId,
      choferNombre,
      camionId,
      localId,
      localNombre,
      contenedores,
      creadoPor,
      status: status || 'completado',
      pago: pago || false,
      formaPago: formaPago || '',
      cantidadCobrada: cantidadCobrada || 0,
      fechaAsignacion: fechaCreacion ? new Date(fechaCreacion) : new Date(),
    });

    return NextResponse.json({ id: recoleccion._id }, { status: 201 });
  } catch (error) {
    console.error('Error creating recoleccion:', error);
    return NextResponse.json({ error: 'Error al crear recoleccion' }, { status: 500 });
  }
}
