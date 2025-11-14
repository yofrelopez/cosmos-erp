// src/app/api/empresas/[id]/deactivate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseRouteId } from '@/lib/api-helpers';

/**
 * PATCH: Desactiva una empresa (cambio de status a INACTIVE)
 * Ruta simple y segura para desactivar sin eliminar datos
 */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const companyId = await parseRouteId(params);

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

    if (existingCompany.status === 'INACTIVE') {
      return NextResponse.json(
        { error: 'La empresa ya está desactivada' },
        { status: 400 }
      );
    }

    // Actualizar solo el status a INACTIVE
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { 
        status: 'INACTIVE',
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
      message: `Empresa "${existingCompany.name}" desactivada correctamente`
    });

  } catch (err) {
    console.error('Error al desactivar empresa:', err);
    return NextResponse.json(
      { error: 'Error interno al desactivar empresa' },
      { status: 500 }
    );
  }
}