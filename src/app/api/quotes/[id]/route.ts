// src/app/api/quotes/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod';
import { generateContractCode } from '@/lib/utils/generateContractCode';

// Función helper para crear contrato automáticamente
async function createContractFromQuote(quote: any) {
  // Verificar si ya existe un contrato
  const existingContract = await prisma.contract.findUnique({
    where: { quoteId: quote.id }
  });

  if (existingContract) {
    return existingContract; // Ya existe, no crear duplicado
  }

  // Crear contrato con items e imágenes
  return await prisma.contract.create({
    data: {
      quoteId: quote.id,
      code: await generateContractCode(quote.companyId),
      clientId: quote.clientId,
      companyId: quote.companyId,
      paymentStatus: 'PENDING',
      amountPaid: 0,
      amountPending: quote.total,
      deliveryStatus: 'PENDING',
      notes: quote.notes,
      items: {
        create: quote.items.map((item: any) => ({
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          images: {
            create: item.images?.map((image: any) => ({
              imageUrl: image.imageUrl,
              fileName: image.fileName,
              fileSize: image.fileSize,
              mimeType: image.mimeType
            })) || []
          }
        }))
      }
    }
  });
}

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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = await parseRouteId(params);

    const body = await req.json();
    
    // DEBUG: Log del body recibido
    console.log('🔍 PUT /api/quotes/[id] - Body recibido:', JSON.stringify(body, null, 2));
    
    // Intentar parseo completo primero (con items)
    const fullParsed = FullUpdateQuoteSchema.safeParse(body);
    
    console.log('🔍 FullParsed success:', fullParsed.success);
    console.log('🔍 FullParsed items:', fullParsed.success ? fullParsed.data.items : 'N/A');
    console.log('🔍 Condition result:', fullParsed.success && fullParsed.data.items);
    
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
          include: { 
            items: {
              include: {
                images: true
              }
            }, 
            client: true 
          }
        });
      });

      // Si el status cambió a ACCEPTED, crear contrato automáticamente
      let contract = null;
      if (status === 'ACCEPTED') {
        try {
          contract = await createContractFromQuote(updated);
        } catch (error) {
          console.warn('Error al crear contrato automático:', error);
        }
      }

      return NextResponse.json({
        ...updated,
        contract: contract ? { id: contract.id, code: contract.code } : null
      });
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
      include: { 
        items: {
          include: {
            images: true
          }
        }, 
        client: true 
      }
    });

    // Si el status cambió a ACCEPTED, crear contrato automáticamente
    let contract = null;
    if (status === 'ACCEPTED') {
      try {
        contract = await createContractFromQuote(updated);
        console.log('Contrato creado automáticamente:', contract.id);
      } catch (error) {
        console.warn('Error al crear contrato automático:', error);
        // No fallar la actualización si el contrato no se puede crear
      }
    }

    return NextResponse.json({
      ...updated,
      contract: contract ? { id: contract.id, code: contract.code } : null
    });
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