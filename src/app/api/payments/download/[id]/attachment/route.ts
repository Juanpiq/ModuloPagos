import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const pagoId = Number(id);

    if (isNaN(pagoId)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const pago = await prisma.pagos.findUnique({
      where: { id: pagoId },
      select: { archivo: true, archivo_nombre: true },
    });

    if (!pago || !pago.archivo) {
      return NextResponse.json({ message: 'Archivo no encontrado' }, { status: 404 });
    }

    const buffer = pago.archivo as Buffer;
    const fileData = new Uint8Array(buffer);
    const nombre = pago.archivo_nombre ?? `pago-${pagoId}`;

    const ext = (nombre.split('.').pop() ?? '').toLowerCase();
    const mime =
      ext === 'pdf'
        ? 'application/pdf'
        : ext === 'png'
        ? 'image/png'
        : ext === 'jpg' || ext === 'jpeg'
        ? 'image/jpeg'
        : 'application/octet-stream';

    //descarga con nombre
    return new NextResponse(fileData, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(nombre)}"`,
      },
    });
  } catch (err) {
    console.error('Error al descargar el archivo:', err);
    return NextResponse.json(
      { message: 'Error al descargar el archivo' },
      { status: 500 }
    );
  }
}
