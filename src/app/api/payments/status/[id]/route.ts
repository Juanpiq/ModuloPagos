import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ message: 'ID inválido' }, { status: 400 });

    const body = await req.json();
    const newEstadoId = Number(body.estadoPagoId);
    if (!newEstadoId) return NextResponse.json({ message: 'estadoPagoId requerido' }, { status: 400 });

    // Obtener pago y factura
    const pago = await prisma.pagos.findUnique({ where: { id }, include: { facturas: true } });
    if (!pago) return NextResponse.json({ message: 'Pago no encontrado' }, { status: 404 });

    const factura = pago.facturas;
    if (!factura) return NextResponse.json({ message: 'Factura vinculada no encontrada' }, { status: 404 });

    // Obtener nombre de estado nuevo y del pago actual
    const estadoNuevo = await prisma.estados_pago.findUnique({ where: { id: newEstadoId } });
    const estadoActual = pago.estado_pago_id ? await prisma.estados_pago.findUnique({ where: { id: pago.estado_pago_id } }) : null;
    if (!estadoNuevo) return NextResponse.json({ message: 'Estado de pago inválido' }, { status: 400 });

    const nombreNuevo = estadoNuevo.nombre;

    // Si el pago ya estaba en el mismo estado, no hay cambio
    if (pago.estado_pago_id === newEstadoId) {
      return NextResponse.json({ message: 'Estado sin cambios' }, { status: 200 });
    }

    // Si cambiamos a En Proceso / Completado desde Anulado u otro, validar suma
    const estadosValidar = await prisma.estados_pago.findMany({
      where: { nombre: { in: ['En Proceso', 'Completado'] } },
    });
    const idsValidar = estadosValidar.map((s) => s.id);

    // Suma actual
    const sumaActual = await prisma.pagos.aggregate({
      where: {
        factura_id: factura.id,
        estado_pago_id: { in: idsValidar },
        id: { not: pago.id },
      },
      _sum: { monto: true },
    });

    const sumaActualNum = Number(sumaActual._sum.monto ?? 0);
    const montoDelPago = Number(pago.monto ?? 0);

    const entraEnValidacion = ['En Proceso', 'Completado'].includes(nombreNuevo);

    if (entraEnValidacion) {
      const nuevaSuma = sumaActualNum + montoDelPago;
      const montoFactura = Number(factura.monto_total ?? 0);

      if (nuevaSuma > montoFactura) {
        return NextResponse.json(
          { message: `No se puede cambiar el estado. La suma (${nuevaSuma.toFixed(2)}) excede el monto de la factura (${montoFactura.toFixed(2)})` },
          { status: 400 }
        );
      }
    }

    // Ejecutar actualización
    const updated = await prisma.pagos.update({
      where: { id },
      data: { estado_pago_id: newEstadoId },
      include: { estados_pago: true, metodos_pago: true, facturas: true },
    });

    return NextResponse.json({ message: 'Estado actualizado', pago: updated }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al cambiar estado' }, { status: 500 });
  }
}
