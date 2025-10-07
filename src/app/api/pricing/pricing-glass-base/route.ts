// app/api/pricing/pricing-glass-base/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient, PricingGlassFamily, Prisma } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

/* ------------ Schemas Zod ------------ */
const createSchema = z.object({
  companyId: z.number().int().positive(),
  family: z.nativeEnum(PricingGlassFamily),
  thicknessMM: z.number().positive(),           // mm (ej. 5.5)
  pricePerFt2: z.number().nonnegative(),        // precio
  minBillableFt2: z.number().positive().optional(),
  minCharge: z.number().nonnegative().optional(),
  validFrom: z.coerce.date().optional(),        // default: now()
  isActive: z.boolean().optional(),             // default: true
})

/* ------------ Helpers ------------ */
function toDecimalInput(n?: number) {
  return typeof n === 'number' ? n.toString() : undefined
}

function parseQueryInt(value: string | null, fallback: number) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function resolveFamilyFromQuery(q?: string | null): PricingGlassFamily | null {
  if (!q) return null
  const norm = q.trim().toUpperCase()
  // Acepta "PLANO", "Plano", "reflejante", etc.
  const match = Object.values(PricingGlassFamily).find(
    (f) => f.toUpperCase() === norm
  )
  return match ?? null
}

/* ===================================
   GET  /api/pricing/pricing-glass-base
   Query: ?companyId=1&page=1&pageSize=10&q=PLANO|5.5
   =================================== */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = Number(searchParams.get('companyId') ?? '')
    if (!Number.isFinite(companyId) || companyId <= 0) {
      return NextResponse.json({ message: 'companyId requerido' }, { status: 400 })
    }

    const page = parseQueryInt(searchParams.get('page'), 1)
    const pageSize = parseQueryInt(searchParams.get('pageSize'), 10)
    const q = searchParams.get('q') ?? searchParams.get('search')

    // Filtro por búsqueda:
    // - Si q es numérico -> thicknessMM = q
    // - Si q coincide con un enum de family -> family = q
    const asNumber = q ? Number(q) : NaN
    const familyFromQ = resolveFamilyFromQuery(q)

    const where: Prisma.PricingGlassBaseWhereInput = {
      companyId,
      ...(familyFromQ
        ? { family: familyFromQ }
        : Number.isFinite(asNumber) && asNumber > 0
        ? { thicknessMM: asNumber.toString() } // Decimal como string
        : {}),
    }

    const [items, totalItems] = await prisma.$transaction([
      prisma.pricingGlassBase.findMany({
        where,
        orderBy: [
          { family: 'asc' },
          { thicknessMM: 'asc' },
          { validFrom: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.pricingGlassBase.count({ where }),
    ])

    return NextResponse.json({
  items,
  totalItems,
  data: items,          // ← compatibilidad con tu hook
  total: totalItems,    // ← compatibilidad con tu hook
  page,
  pageSize,
})
  } catch (err) {
    console.error('GET /pricing-glass-base error:', err)
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}

/* ===================================
   POST /api/pricing/pricing-glass-base
   Body: { companyId, family, thicknessMM, pricePerFt2, [minBillableFt2], [minCharge], [validFrom], [isActive] }
   Valida duplicado: (companyId, family, thicknessMM, validFrom)
   =================================== */
export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = createSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      companyId,
      family,
      thicknessMM,
      pricePerFt2,
      minBillableFt2,
      minCharge,
      validFrom,
      isActive,
    } = parsed.data

    const effectiveFrom = validFrom ?? new Date()

    // Verificar duplicado exacto por combinación única
    const exists = await prisma.pricingGlassBase.findFirst({
      where: {
        companyId,
        family,
        thicknessMM: toDecimalInput(thicknessMM),
        validFrom: effectiveFrom,
      },
      select: { id: true },
    })

    if (exists) {
      return NextResponse.json(
        {
          message:
            'Registro duplicado: ya existe un precio para (companyId, family, thicknessMM, validFrom).',
        },
        { status: 409 }
      )
    }

    const created = await prisma.pricingGlassBase.create({
      data: {
        companyId,
        family,
        thicknessMM: toDecimalInput(thicknessMM)!,
        pricePerFt2: toDecimalInput(pricePerFt2)!,
        minBillableFt2: toDecimalInput(minBillableFt2),
        minCharge: toDecimalInput(minCharge),
        validFrom: effectiveFrom,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    console.error('POST /pricing-glass-base error:', err)

    // Manejo de violación de unique index (por si corre en paralelo)
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { message: 'Violación de índice único: combinación ya existente.' },
        { status: 409 }
      )
    }

    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
