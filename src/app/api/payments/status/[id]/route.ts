import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const pagoId = Number(id);
    if (isNaN(pagoId)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const newEstadoId = Number(body.estadoPagoId);
    if (!newEstadoId) {
      return NextResponse.json(
        { message: 'estadoPagoId es requerido' },
        { status: 400 }
      );
    }

    const pago = await prisma.pagos.findUnique({
      where: { id: pagoId },
      include: { facturas: true },
    });

    if (!pago) {
      return NextResponse.json({ message: 'Pago no encontrado' }, { status: 404 });
    }

    const factura = pago.facturas;
    if (!factura) {
      return NextResponse.json(
        { message: 'Factura vinculada no encontrada' },
        { status: 404 }
      );
    }

    if (pago.estado_pago_id === newEstadoId) {
      return NextResponse.json({ message: 'Estado sin cambios' }, { status: 200 });
    }

    // Verificar si se está intentando pasar de "Anulado" a otro estado
    const estadosValidar = await prisma.estados_pago.findMany({
      where: { nombre: { in: ['En Proceso', 'Completado'] } },
    });
    const idsValidar = estadosValidar.map((s) => s.id);

    // Calcular suma actual de pagos válidos
    const sumaActual = await prisma.pagos.aggregate({
      where: {
        factura_id: factura.id,
        estado_pago_id: { in: idsValidar },
        id: { not: pago.id },
      },
      _sum: { monto: true },
    });

    const sumaActualNum = Number(sumaActual._sum?.monto ?? 0);
    const montoDelPago = Number(pago.monto ?? 0);
    const nuevaSuma = sumaActualNum + montoDelPago;

    if (idsValidar.includes(newEstadoId)) {
      const montoFactura = Number(factura.monto_total ?? 0);
      if (nuevaSuma > montoFactura) {
        return NextResponse.json(
          {
            message: `El total (${nuevaSuma.toFixed(
              2
            )}) supera el monto de la factura (${montoFactura.toFixed(2)}).`,
          },
          { status: 400 }
        );
      }
    }

    //Actualizar estado del pago
    const updated = await prisma.pagos.update({
      where: { id: pagoId },
      data: { estado_pago_id: newEstadoId },
      include: {
        estados_pago: { select: { nombre: true } },
        metodos_pago: { select: { nombre: true } },
        facturas: true,
      },
    });

    return NextResponse.json(
      { message: 'Estado actualizado correctamente', pago: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return NextResponse.json(
      { message: 'Error al cambiar estado' },
      { status: 500 }
    );
  }
}
