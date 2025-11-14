// Endpoint temporal para debuggear el problema de imágenes
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar quotes con imágenes
    const quotes = await prisma.quote.findMany({
      include: { 
        client: true, 
        items: { 
          include: { 
            images: true 
          } 
        } 
      },
      take: 3 // Solo las primeras 3 para testing
    });

    console.log('=== DEBUG QUOTES API ===');
    quotes.forEach((quote, index) => {
      console.log(`Quote ${index + 1}:`, {
        id: quote.id,
        itemsCount: quote.items.length,
        items: quote.items.map(item => ({
          id: item.id,
          description: item.description,
          imagesCount: item.images.length,
          images: item.images.map(img => ({
            id: img.id,
            imageUrl: img.imageUrl,
            fileName: img.fileName
          }))
        }))
      });
    });

    // 2. Verificar contratos con imágenes  
    const contracts = await prisma.contract.findMany({
      include: {
        items: {
          include: {
            images: true
          }
        }
      },
      take: 3
    });

    console.log('=== DEBUG CONTRACTS ===');
    contracts.forEach((contract, index) => {
      console.log(`Contract ${index + 1}:`, {
        id: contract.id,
        code: contract.code,
        itemsCount: contract.items.length,
        items: contract.items.map(item => ({
          id: item.id,
          description: item.description,
          imagesCount: item.images.length,
          images: item.images.map(img => ({
            id: img.id,
            imageUrl: img.imageUrl,
            fileName: img.fileName
          }))
        }))
      });
    });

    return NextResponse.json({
      quotes: quotes.length,
      contracts: contracts.length,
      quotesData: quotes,
      contractsData: contracts
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Error in debug API' },
      { status: 500 }
    );
  }
}