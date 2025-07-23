import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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
