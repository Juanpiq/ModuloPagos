import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const clientes = await prisma.clientes.findMany({
    orderBy: {
      id: 'asc'
    },
  });
  return NextResponse.json(clientes);
}
