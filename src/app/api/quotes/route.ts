import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { z }            from 'zod'
import { generateQuoteCode } from '@/lib/utils/generateQuoteCode'

/* ------------------------------------------------------------------------ */
/* 1)  ESQUEMAS DE VALIDACIÓN (Zod)                                         */
/* ------------------------------------------------------------------------ */
const ItemSchema = z.object({
  description : z.string().min(1),
  unit        : z.string().min(1),
  quantity    : z.number().positive(),
  unitPrice   : z.number().nonnegative(),
})

const CreateQuoteSchema = z.object({
  clientId  : z.number(),
  companyId : z.number(),                               // empresa activa
  notes     : z.string().optional(),
  status    : z.enum(['PENDING', 'ACCEPTED', 'REJECTED'])
               .default('PENDING'),
  items     : z.array(ItemSchema).min(1),
})


/* ------------------------------------------------------------------------ */
/* 2)  ENDPOINT  POST  /api/quotes                                          */
/* ------------------------------------------------------------------------ */
export async function POST(req: Request) {
  try {
    /* 1. Leer y validar payload */
    const json   = await req.json();
    const parsed = CreateQuoteSchema.parse(json);

    /* 2. Verificar que el cliente pertenece a la empresa */
    const client = await prisma.client.findFirst({
      where: { id: parsed.clientId, companyId: parsed.companyId },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'El cliente no pertenece a la empresa indicada' },
        { status: 400 },
      );
    }

    /* 3. Calcular subtotal + total */
    const itemsWithSubtotal = parsed.items.map((i) => ({
      ...i,
      subtotal: i.quantity * i.unitPrice,
    }));
    const total = itemsWithSubtotal.reduce((s, i) => s + i.subtotal, 0);

    /* 4. Insertar en la base */
    const quote = await prisma.quote.create({
      data: {
        code: await generateQuoteCode(parsed.companyId),
        clientId:  parsed.clientId,
        companyId: parsed.companyId,
        status:    parsed.status,
        notes:     parsed.notes,
        total,
        items: { create: itemsWithSubtotal },
      },
      include: { items: true, client: true },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (err: any) {
    /* 5. Manejo de errores */
    console.error('[POST /api/quotes]', err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: err.issues },
        { status: 400 },
      );
    }

    if (err.code?.startsWith?.('P20')) {
      return NextResponse.json(
        { error: 'Error de base de datos', detail: err.meta?.cause },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}


/* ------------------------------------------------------------------------ */
/*  MÉTODO  GET  /api/quotes                                                */
/*  ──────────────────────────────────────────────────────────────────────── */
/*  Parámetros de query                                                     */
/*    • companyId  (obligatorio)  →  número                                 */
/*    • status     (opcional)    →  'PENDING' | 'ACCEPTED' | 'REJECTED'     */
/*    • page       (opcional)    →  1‑based,   default = 1                  */
/*    • pageSize   (opcional)    →  1‑100,     default = 20                 */
/*                                                                          */
/*  Respuesta JSON                                                          */
/*    { data: Quote[], pagination: { total, page, pageSize, pages } }       */
/* ------------------------------------------------------------------------ */



const StatusParam = z.enum(['PENDING', 'ACCEPTED', 'REJECTED'])

const positiveInt = (v: unknown, def = 1) => {
  try {
    const n = Number(v ?? def);
    const result = Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
    console.log(`📊 positiveInt(${v}, ${def}) = ${result}`);
    return result;
  } catch (err) {
    console.log(`❌ Error parsing int ${v}:`, err);
    return def;
  }
};

export async function GET(req: Request) {
  try {
    console.log('🔍 GET /api/quotes - Start request');
    const { searchParams } = new URL(req.url);
    console.log('📋 Search params:', Object.fromEntries(searchParams));

    /* -----------  companyId obligatorio y numérico  ---------------- */
    const companyId = positiveInt(searchParams.get('companyId'), NaN);
    console.log('🏢 CompanyId:', companyId);
    
    if (Number.isNaN(companyId)) {
      console.log('❌ Invalid companyId');
      return NextResponse.json(
        { error: 'companyId es obligatorio y debe ser numérico' },
        { status: 400 },
      );
    }

    /* -----------  filtros opcionales  ------------------------------ */
    const status = searchParams.has('status')
      ? StatusParam.parse(searchParams.get('status'))
      : undefined;

    const search   = (searchParams.get('search') ?? '').trim();
    const page     = positiveInt(searchParams.get('page'), 1);
    const pageSize = Math.min(100, positiveInt(searchParams.get('pageSize'), 20));
    const skip     = (page - 1) * pageSize;
    
    console.log('📊 Pagination params:', { search, page, pageSize, skip });
    
    // Validación adicional para evitar skip muy grandes
    if (skip > 10000) {
      console.log('❌ Skip too large:', skip);
      return NextResponse.json(
        { error: 'Página solicitada demasiado alta' },
        { status: 400 }
      );
    }

    /* -----------  cláusula where para Prisma  ---------------------- */
    const where: any = { companyId };
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        {
          client: {
            OR: [
              { fullName:       { contains: search, mode: 'insensitive' } },
              { businessName:   { contains: search, mode: 'insensitive' } },
              { documentNumber: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    console.log('🔍 Where clause:', JSON.stringify(where, null, 2));

    /* -----------  transacción: count + datos paginados  ------------ */
    console.log('📦 Starting database transaction...');
    const [total, quotes] = await prisma.$transaction([
      prisma.quote.count({ where }),
      prisma.quote.findMany({
        where,
        include: { client: true, items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    console.log('✅ Transaction completed:', { total, quotesCount: quotes.length });

    /* -----------  respuesta  -------------------------------------- */
    return NextResponse.json({ data: quotes, total });
  } catch (err) {
    console.error('[GET /api/quotes] ERROR:', err);
    if (err && typeof err === 'object' && 'stack' in err) {
      console.error('Error stack:', (err as { stack?: string }).stack);
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}