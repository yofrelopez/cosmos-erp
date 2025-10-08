// src/app/api/empresas/[id]/reactivate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH: Reactiva una empresa (cambio de status a ACTIVE)
 * Permite reactivar empresas que fueron desactivadas anteriormente
 */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const companyId = Number(params.id);

  if (isNaN(companyId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    // Verificar que la empresa existe
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, status: true }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    if (existingCompany.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'La empresa ya está activa' },
        { status: 400 }
      );
    }

    // Actualizar solo el status a ACTIVE
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { 
        status: 'ACTIVE',
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        status: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      company: updatedCompany,
      message: `Empresa "${existingCompany.name}" reactivada correctamente`
    });

  } catch (err) {
    console.error('Error al reactivar empresa:', err);
    return NextResponse.json(
      { error: 'Error interno al reactivar empresa' },
      { status: 500 }
    );
  }
}