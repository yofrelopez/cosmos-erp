import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

import { z } from 'zod';


const CreateClientSchema = z.object({
  documentType: z.enum(['DNI', 'RUC', 'CE', 'PASSPORT']),
  documentNumber: z.string().min(8),
  fullName: z.string().min(2),
  businessName: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  companyId: z.number(), // obligatorio y validado
});

// GET: Listar clientes paginados
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // 🔴 1) companyId es obligatorio
  const companyId = Number(searchParams.get('companyId'));
  if (!companyId) {
    return NextResponse.json(
      { error: 'companyId requerido' },
      { status: 400 }
    );
  }

  const search   = searchParams.get('search') || '';
  const page     = parseInt(searchParams.get('page')  || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');

  const where: any = { companyId };        // 🟢 2) filtramos por empresa

  if (search) {
    where.OR = [
      { fullName:       { contains: search, mode: 'insensitive' } },
      { businessName:   { contains: search, mode: 'insensitive' } },
      { documentNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip:  (page - 1) * pageSize,
        take:  pageSize,
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
    const body = await req.json();
    const data = CreateClientSchema.parse(body); // Validación Zod

    const client = await prisma.client.create({
      data,
    });

    return NextResponse.json(client, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: err.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}



