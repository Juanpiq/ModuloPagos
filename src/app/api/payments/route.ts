import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const pagos = await prisma.pagos.findMany({
    orderBy: {
      id: 'asc'
    },
    include: { facturas: true },
  });
  return NextResponse.json(pagos);
}
