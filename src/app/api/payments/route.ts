import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';
import { PaymentResponse } from '@/types/payments';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const estado = searchParams.get('estado');
    const metodo = searchParams.get('metodo');
    const facturaId = searchParams.get('facturaId');
    const desde = searchParams.get('from');
    const hasta = searchParams.get('to');
    const sort = (searchParams.get('sort') as 'asc' | 'desc') || 'desc';


    const where: Prisma.pagosWhereInput = {
      ...(facturaId && { factura_id: Number(facturaId) }),
      ...(estado && { estados_pago: { nombre: estado } }),
      ...(metodo && { metodos_pago: { nombre: metodo } }),
      ...(desde &&
        hasta && {
          fecha: { gte: new Date(desde), lte: new Date(hasta) },
        }),
    };


    const pagosDB = await prisma.pagos.findMany({
      where,
      include: {
        facturas: {
          select: {
            id: true,
            actividad: true,
            clientes: { select: { nombre: true } },
          },
        },
        estados_pago: { select: { nombre: true } },
        metodos_pago: { select: { nombre: true } },
      },
      orderBy: { fecha: sort },
    });


    const pagos: PaymentResponse[] = pagosDB.map((p) => ({
      id: p.id,
      facturaId: p.factura_id,
      monto: Number(p.monto),
      fecha: p.fecha ? p.fecha.toISOString() : '',
      estado: p.estados_pago?.nombre ?? 'Desconocido',
      metodoPago: p.metodos_pago?.nombre ?? 'No especificado',
      cliente: p.facturas?.clientes?.nombre ?? 'Sin cliente',
      archivoNombre: p.archivo_nombre ?? '',
    }));

    return NextResponse.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return NextResponse.json(
      { message: 'Error al obtener pagos' },
      { status: 500 }
    );
  }
}
