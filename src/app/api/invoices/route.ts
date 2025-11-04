import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { InvoiceResponse } from '@/types/invoices';

// Validación Zod
const invoiceSchema = z.object({
  clienteId: z.number().positive('El clienteId debe ser un número positivo'),
  montoTotal: z.number().positive('El montoTotal debe ser mayor que 0'),
  estadoFacturaId: z.number().optional(),
  actividad: z.string().min(3, 'La actividad debe tener al menos 3 caracteres'),
});

type InvoiceRequest = z.infer<typeof invoiceSchema>;

// ✅ GET
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado'); // filtro opcional

    const facturasDB = await prisma.facturas.findMany({
      where: estado ? { estados_factura: { nombre: estado } } : {},
      include: {
        clientes: { select: { id: true, nombre: true } },
        estados_factura: { select: { nombre: true } },
      },
      orderBy: { id: 'asc' },
    });

    const facturas: InvoiceResponse[] = facturasDB.map((f) => ({
      id: f.id,
      clienteId: f.clientes?.id ?? 0,
      cliente: f.clientes?.nombre ?? 'Sin cliente',
      montoTotal: Number(f.monto_total),
      balanceRestante: Number(f.balance_restante),
      estado: f.estados_factura?.nombre ?? 'Desconocido',
      actividad: f.actividad,
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

// POST: Crear una nueva factura
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = invoiceSchema.parse(body);

    await prisma.facturas.create({
      data: {
        cliente_id: parsed.clienteId,
        monto_total: parsed.montoTotal,
        // balance_restante lo maneja la DB
        // estado_factura_id puede tener un valor por defecto (Pendiente)
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
