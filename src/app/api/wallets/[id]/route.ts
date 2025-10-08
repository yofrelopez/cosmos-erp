import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WalletType } from '@prisma/client';

// GET - Obtener billetera específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID inválido' },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet) {
      return NextResponse.json(
        { message: 'Billetera no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar billetera
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { type, phone, qrUrl } = body;

    // Verificar que la billetera existe
    const existingWallet = await prisma.wallet.findUnique({
      where: { id },
    });

    if (!existingWallet) {
      return NextResponse.json(
        { message: 'Billetera no encontrada' },
        { status: 404 }
      );
    }

    // Validar tipo si se está cambiando
    if (type && !Object.values(WalletType).includes(type)) {
      return NextResponse.json(
        { message: 'Tipo de billetera no válido' },
        { status: 400 }
      );
    }

    // Si se cambia el tipo, verificar que no exista otro del mismo tipo
    if (type && type !== existingWallet.type) {
      const conflictingWallet = await prisma.wallet.findFirst({
        where: {
          companyId: existingWallet.companyId,
          type: type,
          id: { not: id },
        },
      });

      if (conflictingWallet) {
        return NextResponse.json(
          { message: `Ya existe una billetera ${type} para esta empresa` },
          { status: 409 }
        );
      }
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(phone && { phone: phone.trim() }),
        ...(qrUrl !== undefined && { qrUrl: qrUrl?.trim() || null }),
      },
    });

    return NextResponse.json(updatedWallet);
  } catch (error) {
    console.error('Error updating wallet:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar billetera
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar que la billetera existe
    const existingWallet = await prisma.wallet.findUnique({
      where: { id },
    });

    if (!existingWallet) {
      return NextResponse.json(
        { message: 'Billetera no encontrada' },
        { status: 404 }
      );
    }

    await prisma.wallet.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Billetera eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting wallet:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}