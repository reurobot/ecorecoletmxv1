import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { localId, pngBase64 } = data;

    if (!localId || !pngBase64) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const base64Data = pngBase64.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const qrDir = join(process.cwd(), 'public', 'qr');
    await mkdir(qrDir, { recursive: true });

    const fileName = `${localId}.png`;
    const filePath = join(qrDir, fileName);
    await writeFile(filePath, buffer);

    const url = `/qr/${fileName}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading QR:', error);
    return NextResponse.json({ error: 'Error al subir QR' }, { status: 500 });
  }
}
