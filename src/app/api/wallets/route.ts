import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WalletType } from '@prisma/client';

// GET - Obtener billeteras por empresa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { message: 'Company ID es requerido' },
        { status: 400 }
      );
    }

    const wallets = await prisma.wallet.findMany({
      where: {
        companyId: parseInt(companyId),
      },
      orderBy: {
        type: 'asc',
      },
    });

    return NextResponse.json(wallets);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva billetera
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, type, phone, qrUrl } = body;

    // Validaciones básicas
    if (!companyId || !type || !phone) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar que el tipo sea válido
    if (!Object.values(WalletType).includes(type)) {
      return NextResponse.json(
        { message: 'Tipo de billetera no válido' },
        { status: 400 }
      );
    }

    // Verificar que no exista otra billetera del mismo tipo para la empresa
    const existingWallet = await prisma.wallet.findFirst({
      where: {
        companyId: parseInt(companyId),
        type: type,
      },
    });

    if (existingWallet) {
      return NextResponse.json(
        { message: `Ya existe una billetera ${type} para esta empresa` },
        { status: 409 }
      );
    }

    const wallet = await prisma.wallet.create({
      data: {
        companyId: parseInt(companyId),
        type,
        phone: phone.trim(),
        qrUrl: qrUrl?.trim() || null,
      },
    });

    return NextResponse.json(wallet, { status: 201 });
  } catch (error) {
    console.error('Error creating wallet:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}