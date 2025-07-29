// src/app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { DocumentType } from '@prisma/client';

/* 1️⃣ Validación de params */
const ParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID inválido'),
});

/* 2️⃣ Esquema PATCH: todos opcionales pero tipados */
const UpdateClientSchema = z.object({
  documentType: z
    .enum(
      Object.values(DocumentType) as [DocumentType, ...DocumentType[]]
    )
    .optional(),
  documentNumber: z.string().min(8).max(15).optional(),
  fullName: z.string().min(2).optional(),
  businessName: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.email('Correo inválido'), z.literal('')]).optional(),

  address: z.string().optional(),
  notes: z.string().optional(),
  companyId: z.number(), // ← obligatorio para control de pertenencia
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    /* 3️⃣ Validar ID */
    const { id } = ParamsSchema.parse(params);
    const body = await req.json();

    /* 4️⃣ Validar payload */
    const data = UpdateClientSchema.parse(body);

    /* 5️⃣ Comprobar que el cliente pertenece a la empresa */
    const exists = await prisma.client.findUnique({
      where: { id: Number(id), companyId: data.companyId },
    });

    if (!exists) {
      return NextResponse.json(
        { error: 'Cliente no encontrado en esta empresa' },
        { status: 404 }
      );
    }

    /* 6️⃣ Actualizar solo campos enviados */
    const updated = await prisma.client.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    /* 7️⃣ Manejo de errores */
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: err.issues },
        { status: 400 }
      );
    }
    console.error('[PATCH /api/clients/[id]]', err);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const clientId = parseInt(params.id, 10);
  if (isNaN(clientId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  return NextResponse.json(client);
}

// PUT: Actualizar cliente por ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const clienteId = parseInt(params.id)
    const data = await req.json()

    const clienteActualizado = await prisma.client.update({
      where: { id: clienteId },
      data: {
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        fullName: data.fullName,
        businessName: data.businessName || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
      },
    })

    return NextResponse.json(clienteActualizado)
  } catch (error) {
    console.error('Error al actualizar cliente:', error)
    return new NextResponse('Error al actualizar cliente', { status: 500 })
  }
}


// DETELE: borrar cliente app/api/clientes/[id]/route.ts
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  try {
    await prisma.client.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error al eliminar cliente:', error)
    return new NextResponse('Error al eliminar cliente', { status: 500 })
  }
}