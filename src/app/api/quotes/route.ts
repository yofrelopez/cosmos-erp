import { prisma } from '@/lib/prisma';
import { quoteCreateSchema } from '@/lib/validators/quote';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const search = searchParams.get('search')?.trim() || '';

  const skip = (page - 1) * pageSize;

const where = search
  ? {
      client: {
        // Use 'is' for single object relation filter
        is: {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { businessName: { contains: search, mode: 'insensitive' as const } },
            { documentNumber: { contains: search, mode: 'insensitive' as const } },
          ],
        },
      },
    }
  : {};


  const [quotes, totalItems] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: {
        client: {
            select: {
            id: true,
            fullName: true,
            businessName: true,
            documentType: true,
            documentNumber: true,
            phone: true,
            address: true,
            email: true,
            },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),

    prisma.quote.count({ where }),
  ]);

  return NextResponse.json({ data: quotes, totalItems });
}



// src/app/api/quotes/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, items } = body;

    if (!clientId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios' },
        { status: 400 }
      );
    }

    // Calcular total general
    const total = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);

    const quote = await prisma.quote.create({
      data: {
        clientId: Number(clientId),
        status: 'PENDING', // puedes ajustar esto si deseas usar otro valor
        total,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ ok: true, quote });
  } catch (error: any) {
    console.error('Error en API /api/quotes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}