import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Recoleccion } from '@/models/Recoleccion';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'pagos') {
      const pagos = await Recoleccion.find({ pago: true })
        .select('choferNombre localNombre cantidadCobrada formaPago fechaAsignacion')
        .sort({ fechaAsignacion: -1 });
      return NextResponse.json({ recolecciones: pagos });
    }

    const recolecciones = await Recoleccion.find()
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ recolecciones });
  } catch (error) {
    console.error('Error fetching reportes:', error);
    return NextResponse.json({ error: 'Error al obtener reportes' }, { status: 500 });
  }
}
