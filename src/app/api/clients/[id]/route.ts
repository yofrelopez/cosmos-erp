// app/api/clientes/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'


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