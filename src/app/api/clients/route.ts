import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'




export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');

  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { businessName: { contains: search, mode: 'insensitive' as const } },
          { documentNumber: { contains: search, mode: 'insensitive' as const } },
        ], 
      }
    : {};

  try {
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({ data: clients, total });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


// POST: Create a new client
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const newClient = await prisma.client.create({
      data: {
        documentType: body.documentType,
        documentNumber: body.documentNumber,
        fullName: body.fullName,
        businessName: body.businessName,
        phone: body.phone,
        email: body.email,
        address: body.address,
        notes: body.notes,
      },
    })

    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error creating client' }, { status: 500 })
  }
}



