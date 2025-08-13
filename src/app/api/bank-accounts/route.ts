// src/app/api/bank-accounts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bankAccountSchema } from '@/forms/company/bankSchema';

// POST /api/bank-accounts

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parse = bankAccountSchema.safeParse(body);
        if (!parse.success) {
        const errors = (parse.error as import('zod').ZodError).issues.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
        }));
        return NextResponse.json({ errors }, { status: 400 });
    }
    

    const { bank, accountType, alias, number, cci, currency, companyId } = parse.data;

    const newAccount = await prisma.bankAccount.create({
      data: {
        bank,
        accountType,
        alias,
        number,
        cci,
        currency,
        company: {
          connect: { id: companyId },
        },
      },
    });

    return NextResponse.json(newAccount, { status: 201 });
  } catch (err) {
    console.error('Error al registrar cuenta bancaria:', err);
    return NextResponse.json({ error: 'Error interno al registrar la cuenta' }, { status: 500 });
  }
}


// GET /api/bank-accounts

export async function GET(req: NextRequest) {
  try {
    const companyIdParam = req.nextUrl.searchParams.get('companyId');
    const companyId = Number(companyIdParam);

    if (!companyId || isNaN(companyId)) {
      return NextResponse.json({ error: 'ID de empresa inválido' }, { status: 400 });
    }

    const accounts = await prisma.bankAccount.findMany({
      where: { companyId },
      orderBy: { id: 'asc' }, // Puedes cambiar a 'bank' si prefieres orden alfabético
    });

    return NextResponse.json(accounts);
  } catch (err) {
    console.error('Error al obtener cuentas bancarias:', err);
    return NextResponse.json({ error: 'Error interno al listar cuentas' }, { status: 500 });
  }
}

