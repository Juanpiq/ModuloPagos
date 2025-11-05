import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, context: { params: Promise<{ balanceId: string }> }) {
  try {
    const { balanceId } = await context.params;

    const formData = await req.formData();

    const monto = Number(formData.get('monto'));
    const estadoPagoId = Number(formData.get('estadoPagoId'));
    const metodoPagoId = Number(formData.get('metodoPagoId'));
    const archivo = formData.get('archivo') as File | null;

    if (!balanceId || !monto || !estadoPagoId || !metodoPagoId) {
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios.' },
        { status: 400 }
      );
    }

    if (!archivo) {
      return NextResponse.json(
        { message: 'Debe adjuntar un archivo PDF, JPG o PNG.' },
        { status: 400 }
      );
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(archivo.type)) {
      return NextResponse.json(
        { message: 'Tipo de archivo no permitido. Solo PDF, JPG o PNG.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await archivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const nombreArchivo = archivo.name;

    const nuevoPago = await prisma.pagos.create({
      data: {
        factura_id: Number(balanceId),
        monto,
        estado_pago_id: estadoPagoId,
        metodo_pago_id: metodoPagoId,
        archivo: buffer,
        archivo_nombre: nombreArchivo,
      },
      include: {
        estados_pago: { select: { nombre: true } },
        metodos_pago: { select: { nombre: true } },
        facturas: {
          select: {
            id: true,
            actividad: true,
            clientes: { select: { nombre: true } },
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Pago registrado correctamente', pago: nuevoPago },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al subir comprobante:', error);
    return NextResponse.json(
      { message: 'Error al subir comprobante de pago.' },
      { status: 500 }
    );
  }
}
