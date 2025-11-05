import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ message: 'ID inválido' }, { status: 400 });

    const body = await req.json();
    const newEstadoName = String(body?.estado ?? '').trim();
    const allowed = ['En Proceso', 'Completado', 'Anulado'];
    if (!allowed.includes(newEstadoName)) {
      return NextResponse.json({ message: 'Estado inválido' }, { status: 400 });
    }

    // Obtener pago actual
    const pago = await prisma.pagos.findUnique({
      where: { id },
      select: { id: true, monto: true, factura_id: true, estado_pago_id: true },
    });

    if (!pago) return NextResponse.json({ message: 'Pago no encontrado' }, { status: 404 });

    // Obtener los ids de estados de pago (por nombre)
    const estadosAll = await prisma.estados_pago.findMany({
      where: { nombre: { in: allowed } },
      select: { id: true, nombre: true },
    });
    const estadoMap = Object.fromEntries(estadosAll.map((e) => [e.nombre, e.id]));

    const targetEstadoId = estadoMap[newEstadoName];
    if (!targetEstadoId) return NextResponse.json({ message: 'Estado no configurado en DB' }, { status: 500 });

    const inProcOrCompIds = estadosAll.filter((e) => e.nombre === 'En Proceso' || e.nombre === 'Completado').map((e) => e.id);
    const completedIds = estadosAll.filter((e) => e.nombre === 'Completado').map((e) => e.id);

    const updatedPago = await prisma.$transaction(async (tx) => {
      // obtener factura relacionada
      const factura = await tx.facturas.findUnique({
        where: { id: pago.factura_id },
        select: { id: true, monto_total: true },
      });
      if (!factura) throw new Error('Factura asociada no encontrada');

      // Suma actual de pagos (EN PROCESO + COMPLETADO)
      const sumInProcOrCompRow = await tx.pagos.aggregate({
        _sum: { monto: true },
        where: {
          factura_id: factura.id,
          id: { not: pago.id },
          estado_pago_id: { in: inProcOrCompIds.length ? inProcOrCompIds : [-1] },
        },
      });
      const sumInProcOrComp = Number(sumInProcOrCompRow._sum?.monto ?? 0);

      const includeThis = newEstadoName === 'En Proceso' || newEstadoName === 'Completado';
      const montoPago = Number(pago.monto ?? 0);
      const prospectiveSumInProcOrComp = sumInProcOrComp + (includeThis ? montoPago : 0);

      if (prospectiveSumInProcOrComp > Number(factura.monto_total)) {
        throw new Error(
          `No se puede cambiar el estado. La suma (${prospectiveSumInProcOrComp.toFixed(
            2
          )}) excede el monto de la factura (${Number(factura.monto_total).toFixed(2)}).`
        );
      }

      // Actualizar el pago con el nuevo estado
      const updated = await tx.pagos.update({
        where: { id: pago.id },
        data: { estado_pago_id: targetEstadoId },
      });

      // Recalcular suma de pagos COMPLETADOS
      const sumCompletedRow = await tx.pagos.aggregate({
        _sum: { monto: true },
        where: {
          factura_id: factura.id,
          estado_pago_id: { in: completedIds.length ? completedIds : [-1] },
        },
      });
      const sumCompleted = Number(sumCompletedRow._sum?.monto ?? 0);

      // Recalcular suma in-proc or comp (para decidir estado factura)
      const sumInProcOrCompRow2 = await tx.pagos.aggregate({
        _sum: { monto: true },
        where: {
          factura_id: factura.id,
          estado_pago_id: { in: inProcOrCompIds.length ? inProcOrCompIds : [-1] },
        },
      });
      const sumInProcOrComp2 = Number(sumInProcOrCompRow2._sum?.monto ?? 0);

      // Nuevo balance y estado de factura
      const newBalance = Number(factura.monto_total) - sumCompleted;

      const estadosFactura = await tx.estados_factura.findMany({
        where: { nombre: { in: ['Pendiente', 'En Proceso', 'Pagado'] } },
        select: { id: true, nombre: true },
      });
      const efMap = Object.fromEntries(estadosFactura.map((e) => [e.nombre, e.id]));

      let newEstadoFacturaId = efMap['Pendiente'];
      if (sumCompleted >= Number(factura.monto_total)) {
        newEstadoFacturaId = efMap['Pagado'];
      } else if (sumInProcOrComp2 > 0) {
        newEstadoFacturaId = efMap['En Proceso'];
      } else {
        newEstadoFacturaId = efMap['Pendiente'];
      }

      // Actualizar factura (balance + estado)
      await tx.facturas.update({
        where: { id: factura.id },
        data: {
          balance_restante: newBalance,
          estado_factura_id: newEstadoFacturaId,
        },
      });

      return updated;
    });

    return NextResponse.json({ message: 'OK', pago: updatedPago }, { status: 200 });
  } catch (err: any) {
    console.error('Error en status update:', err);
    const msg = err?.message ?? 'Error interno';
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}
