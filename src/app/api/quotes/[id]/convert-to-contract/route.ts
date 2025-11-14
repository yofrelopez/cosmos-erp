import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateContractCode } from '@/lib/utils/generateContractCode';

// POST /api/quotes/[id]/convert-to-contract
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const quoteId = parseInt(params.id);
    
    // 1. Obtener cotización completa con items e imágenes
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        items: {
          include: {
            images: true
          }
        },
        client: true
      }
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Cotización no encontrada' },
        { status: 404 }
      );
    }

    // 2. Verificar que la cotización esté aprobada
    if (quote.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Solo se pueden convertir cotizaciones aprobadas' },
        { status: 400 }
      );
    }

    // 3. Verificar si ya existe un contrato para esta cotización
    const existingContract = await prisma.contract.findUnique({
      where: { quoteId: quote.id }
    });

    if (existingContract) {
      return NextResponse.json(
        { error: 'Ya existe un contrato para esta cotización', contractId: existingContract.id },
        { status: 409 }
      );
    }

    // 4. Crear contrato con items e imágenes
    const contract = await prisma.contract.create({
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
          create: quote.items.map(item => ({
            description: item.description,
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            images: {
              create: item.images.map(image => ({
                imageUrl: image.imageUrl,
                fileName: image.fileName,
                fileSize: image.fileSize,
                mimeType: image.mimeType
              }))
            }
          }))
        }
      },
      include: {
        items: {
          include: {
            images: true
          }
        },
        client: true,
        quote: true
      }
    });

    return NextResponse.json({
      message: 'Contrato creado exitosamente',
      contract: {
        id: contract.id,
        quoteId: contract.quoteId,
        clientName: contract.client.fullName || contract.client.businessName,
        itemsCount: contract.items.length,
        imagesCount: contract.items.reduce((sum, item) => sum + item.images.length, 0),
        total: quote.total,
        createdAt: contract.date
      }
    }, { status: 201 });

  } catch (error) {
    console.error('[POST /api/quotes/[id]/convert-to-contract]', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}