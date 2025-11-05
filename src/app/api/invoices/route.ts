import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import type { InvoiceResponse } from '@/types/invoices';

const invoiceSchema = z.object({
  clienteId: z.number().positive('El clienteId debe ser un número positivo'),
  montoTotal: z.number().positive('El montoTotal debe ser mayor que 0'),
  actividad: z.string().min(3, 'La actividad debe tener al menos 3 caracteres'),
});

type InvoiceRequest = z.infer<typeof invoiceSchema>;

/**
 * GET: Obtiene facturas
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get('id');
    const estado = searchParams.get('estado');
    const clienteId = searchParams.get('clienteId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    //factura por id
    if (id) {
      const factura = await prisma.facturas.findUnique({
        where: { id: Number(id) },
        include: {
          clientes: { select: { nombre: true } },
          estados_factura: { select: { nombre: true } },
        },
      });

      if (!factura)
        return NextResponse.json({ message: 'Factura no encontrada' }, { status: 404 });

      const facturaResponse: InvoiceResponse = {
        id: factura.id,
        clienteId: factura.cliente_id,
        cliente: factura.clientes?.nombre ?? 'Sin cliente',
        montoTotal: Number(factura.monto_total),
        balanceRestante: Number(factura.balance_restante),
        estado: factura.estados_factura?.nombre ?? 'Desconocido',
        actividad: factura.actividad,
        fecha: factura.fecha?.toISOString() ?? '',
      };

      return NextResponse.json(facturaResponse, { status: 200 });
    }
    const where: any = {};

    if (clienteId) {
      where.cliente_id = Number(clienteId);
    }

    if (estado) {
      where.estados_factura = { nombre: estado };
    }

    if (from && to) {
      const [fy, fm, fd] = from.split('-').map((s) => Number(s));
      const [ty, tm, td] = to.split('-').map((s) => Number(s));

      const startDate = new Date(fy, fm - 1, fd, 0, 0, 0, 0);

      const endExclusive = new Date(ty, tm - 1, td, 0, 0, 0, 0);
      endExclusive.setDate(endExclusive.getDate() + 1);

      where.fecha = {
        gte: startDate,
        lt: endExclusive,
      };
    }

    // Obtener facturas con filtros
    const facturasDB = await prisma.facturas.findMany({
      where,
      include: {
        clientes: { select: { nombre: true } },
        estados_factura: { select: { nombre: true } },
      },
      orderBy: { id: 'asc' },
    });

    const facturas: InvoiceResponse[] = facturasDB.map((f) => ({
      id: f.id,
      clienteId: f.cliente_id,
      cliente: f.clientes?.nombre ?? 'Sin cliente',
      montoTotal: Number(f.monto_total),
      balanceRestante: Number(f.balance_restante),
      estado: f.estados_factura?.nombre ?? 'Desconocido',
      actividad: f.actividad,
      fecha: f.fecha?.toISOString() ?? '',
    }));

    return NextResponse.json(facturas, { status: 200 });
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    return NextResponse.json(
      { message: 'Error al obtener facturas' },
      { status: 500 }
    );
  }
}

//POST
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = invoiceSchema.parse(body);

    await prisma.facturas.create({
      data: {
        cliente_id: parsed.clienteId,
        monto_total: parsed.montoTotal,
        actividad: parsed.actividad,
      },
    });

    return NextResponse.json(
      { message: 'Factura creada correctamente' },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error al crear factura:', error);

    if (error instanceof ZodError) {
      const validationErrors = error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return NextResponse.json(
        { message: 'Error de validación', errors: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
