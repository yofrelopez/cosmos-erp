// src/app/api/quotes/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod';

const UpdateQuoteSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
  notes:  z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    /* 🚩 Solo UNA llamada a req.json() */
    const body = await req.json();                     // ← 1ª y única vez
    const parsed = UpdateQuoteSchema.safeParse(body);  // solo valida, no vuelve a leer

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.format() }, { status: 400 });
    }

    const { status, notes } = parsed.data;

    const updated = await prisma.quote.update({
      where: { id },
      data: { status, notes },
    });

    return NextResponse.json(updated); // 200 OK
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