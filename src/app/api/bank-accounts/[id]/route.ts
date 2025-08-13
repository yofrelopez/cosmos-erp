import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bankAccountSchema } from '@/forms/company/bankSchema';
import { Prisma } from '@prisma/client';

/**
 * PATCH /api/bank-accounts/[id]
 * Actualiza una cuenta bancaria existente.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bankAccountId = Number(params.id);
    if (!bankAccountId || isNaN(bankAccountId)) {
      return NextResponse.json({ error: 'ID de cuenta inválido' }, { status: 400 });
    }

    const body = await req.json();

    const parse = bankAccountSchema.omit({ companyId: true }).safeParse(body);
    if (!parse.success) {
      const errors = parse.error.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { bank, accountType, alias, number, cci, currency } = parse.data;

    const updated = await prisma.bankAccount.update({
      where: { id: bankAccountId },
      data: {
        bank,
        accountType,
        alias,
        number,
        cci,
        currency,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'La cuenta bancaria no existe' }, { status: 404 });
    }

    console.error('Error al actualizar cuenta bancaria:', err);
    return NextResponse.json({ error: 'Error interno al actualizar cuenta' }, { status: 500 });
  }
}

/**
 * DELETE /api/bank-accounts/[id]
 * Elimina una cuenta bancaria por su ID.
 */
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bankAccountId = Number(params.id);
    if (!bankAccountId || isNaN(bankAccountId)) {
      return NextResponse.json({ error: 'ID de cuenta inválido' }, { status: 400 });
    }

    await prisma.bankAccount.delete({
      where: { id: bankAccountId },
    });

    return NextResponse.json({ message: 'Cuenta bancaria eliminada correctamente' });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'La cuenta bancaria no existe' }, { status: 404 });
    }

    console.error('Error al eliminar cuenta bancaria:', err);
    return NextResponse.json({ error: 'Error interno al eliminar cuenta' }, { status: 500 });
  }
}
