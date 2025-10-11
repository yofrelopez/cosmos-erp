// src/app/api/quotes/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod';

// Schema para actualización simple (solo status y notes)
const UpdateQuoteSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
  notes:  z.string().optional(),
});

// Schema para actualización completa (incluye items)
const FullUpdateQuoteSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
  notes:  z.string().optional(),
  items: z.array(z.object({
    id: z.number().optional(),
    description: z.string().min(1),
    unit: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative(),
  })).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    
    // Intentar parseo completo primero (con items)
    const fullParsed = FullUpdateQuoteSchema.safeParse(body);
    
    if (fullParsed.success && fullParsed.data.items) {
      // Actualización completa con items
      const { status, notes, items } = fullParsed.data;
      
      // Calcular subtotales y total
      const itemsWithSubtotal = items.map((item) => ({
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      }));
      
      const total = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);

      // Actualizar en transacción
      const updated = await prisma.$transaction(async (tx) => {
        // Eliminar items existentes
        await tx.quoteItem.deleteMany({
          where: { quoteId: id }
        });

        // Actualizar cotización con nuevos items
        return await tx.quote.update({
          where: { id },
          data: {
            status,
            notes,
            total,
            items: {
              create: itemsWithSubtotal
            }
          },
          include: { items: true, client: true }
        });
      });

      return NextResponse.json(updated);
    }
    
    // Fallback: actualización simple (solo status y notes)
    const parsed = UpdateQuoteSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: parsed.error.format() 
      }, { status: 400 });
    }

    const { status, notes } = parsed.data;

    const updated = await prisma.quote.update({
      where: { id },
      data: { status, notes },
      include: { items: true, client: true }
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[API] PUT /api/quotes/[id] >', err);
    return NextResponse.json({ error: 'Error interno al actualizar' }, { status: 500 });
  }
}



interface Params {
  params: { id: string }
}


export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }   // 👈 params es Promise
) {
  const { id } = await context.params;            // ✅ await antes de usar
  const quoteId = Number(id);

  if (isNaN(quoteId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { client: true, items: true },
  });

  if (!quote) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }

  return NextResponse.json(quote);                // solo ejemplo
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const quoteId = Number(id);

    if (isNaN(quoteId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Verificar que la cotización existe antes de eliminar
    const existingQuote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { items: true }
    });

    if (!existingQuote) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
    }

    // Eliminar en transacción para mantener integridad
    await prisma.$transaction(async (tx) => {
      // Primero eliminar los items de la cotización
      await tx.quoteItem.deleteMany({
        where: { quoteId: quoteId }
      });

      // Luego eliminar la cotización
      await tx.quote.delete({
        where: { id: quoteId }
      });
    });

    return NextResponse.json({ 
      message: 'Cotización eliminada exitosamente',
      deletedId: quoteId 
    });

  } catch (err) {
    console.error('[API] DELETE /api/quotes/[id] >', err);
    return NextResponse.json({ 
      error: 'Error interno al eliminar la cotización' 
    }, { status: 500 });
  }
}