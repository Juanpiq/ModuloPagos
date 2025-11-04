import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pagoId = Number(params.id);

    if (isNaN(pagoId)) {
      return NextResponse.json(
        { message: 'ID de pago inválido.' },
        { status: 400 }
      );
    }

    const pago = await prisma.pagos.findUnique({
      where: { id: pagoId },
      select: {
        archivo: true,
        archivo_nombre: true,
      },
    });

    if (!pago || !pago.archivo) {
      return NextResponse.json(
        { message: 'Archivo no encontrado.' },
        { status: 404 }
      );
    }

    let contentType = 'application/octet-stream'; // valor por defecto
    if (pago.archivo_nombre?.endsWith('.pdf')) contentType = 'application/pdf';
    else if (pago.archivo_nombre?.endsWith('.jpg') || pago.archivo_nombre?.endsWith('.jpeg'))
      contentType = 'image/jpeg';
    else if (pago.archivo_nombre?.endsWith('.png')) contentType = 'image/png';

    return new NextResponse(pago.archivo, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(
          pago.archivo_nombre || 'comprobante'
        )}"`,
      },
    });
  } catch (error) {
    console.error('Error al obtener comprobante:', error);
    return NextResponse.json(
      { message: 'Error al obtener comprobante de pago.' },
      { status: 500 }
    );
  }
}
