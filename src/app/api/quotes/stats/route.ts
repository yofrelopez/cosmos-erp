// src/app/api/quotes/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const companyIdNum = parseInt(companyId);
    if (isNaN(companyIdNum)) {
      return NextResponse.json({ error: 'Invalid Company ID' }, { status: 400 });
    }

    // Obtener estadísticas de cotizaciones
    const [total, pending, accepted, rejected] = await Promise.all([
      // Total de cotizaciones
      prisma.quote.count({
        where: { companyId: companyIdNum }
      }),
      
      // Cotizaciones pendientes
      prisma.quote.count({
        where: { 
          companyId: companyIdNum,
          status: 'PENDING'
        }
      }),
      
      // Cotizaciones aceptadas
      prisma.quote.count({
        where: { 
          companyId: companyIdNum,
          status: 'ACCEPTED'
        }
      }),

      // Cotizaciones rechazadas
      prisma.quote.count({
        where: { 
          companyId: companyIdNum,
          status: 'REJECTED'
        }
      })
    ]);

    return NextResponse.json({
      total,
      pending,
      approved: accepted, // Mantenemos el nombre 'approved' para el frontend
      rejected
    });

  } catch (error) {
    console.error('Error getting quote stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}