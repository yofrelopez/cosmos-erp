// app/api/pricing/pricing-glass-base/[id]/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient, GlassFamily } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

/* Helpers */
const toDec = (n?: number | null) =>
  typeof n === 'number' ? n.toString() : undefined

/* Zod */
const FAMILY_VALUES = Object.values(GlassFamily) as [
  GlassFamily,
  ...GlassFamily[]
]
const familySchema = z.enum(FAMILY_VALUES).transform(v => v as GlassFamily)

const updateSchema = z.object({
  family: familySchema.optional(),
  thicknessMM: z.number().positive().optional(),
  pricePerFt2: z.number().nonnegative().optional(),
  minBillableFt2: z.number().positive().optional(),
  minCharge: z.number().nonnegative().optional(),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
})

/* GET: detalle */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id)
    if (!Number.isFinite(id)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

    const item = await prisma.pricingGlass.findUnique({ where: { id } })
    if (!item) return NextResponse.json({ message: 'No encontrado' }, { status: 404 })

    return NextResponse.json(item)
  } catch (e) {
    console.error('GET [id] error:', e)
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}

/* PATCH: actualizar con validación de duplicado (companyId,family,thicknessMM,validFrom) */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id)
    if (!Number.isFinite(id)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

    const current = await prisma.pricingGlass.findUnique({ where: { id } })
    if (!current) return NextResponse.json({ message: 'No encontrado' }, { status: 404 })

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ message: 'Datos inválidos', issues: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // Combinación candidata (usa valores nuevos o actuales)
    const candidate = {
      companyId: current.companyId,
      family: data.family ?? current.family,
      thicknessMM: toDec(data.thicknessMM ?? Number(current.thicknessMM)),
      validFrom: data.validFrom ?? current.validFrom,
    }

    // Duplicado excepto el mismo ID
    const dup = await prisma.pricingGlass.findFirst({
      where: {
        id: { not: id },
        companyId: candidate.companyId,
        family: candidate.family,
        thicknessMM: candidate.thicknessMM!,
        validFrom: candidate.validFrom,
      },
      select: { id: true },
    })
    if (dup) {
      return NextResponse.json(
        { message: 'Duplicado: (companyId, family, thicknessMM, validFrom) ya existe.' },
        { status: 409 }
      )
    }

    const updated = await prisma.pricingGlass.update({
      where: { id },
      data: {
        family: candidate.family,
        thicknessMM: candidate.thicknessMM!,
        validFrom: candidate.validFrom,
        pricePerFt2: toDec(data.pricePerFt2) ?? undefined,
        minBillableFt2: toDec(data.minBillableFt2),
        minCharge: toDec(data.minCharge),
        validTo: data.validTo ?? undefined,
        isActive: data.isActive ?? undefined,
      },
    })

    return NextResponse.json(updated)
  } catch (e: any) {
    console.error('PATCH [id] error:', e)
    if (e?.code === 'P2002') {
      return NextResponse.json({ message: 'Violación de índice único.' }, { status: 409 })
    }
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}

/* DELETE: eliminar */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id)
    if (!Number.isFinite(id)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

    await prisma.pricingGlass.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE [id] error:', e)
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
