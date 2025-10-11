// src/app/api/pricing/frames/options/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const companyId = Number(searchParams.get('companyId') ?? '')
  if (!Number.isFinite(companyId) || companyId <= 0) {
    return NextResponse.json({ message: 'companyId requerido' }, { status: 400 })
  }

  const now = new Date()
  const activeWindow = {
    isActive: true,
    validFrom: { lte: now },
    OR: [{ validTo: null }, { validTo: { gte: now } }],
  }

  const [moldings, matboards, backings, accessories, moldingSimple, moldingBastidor] =
    await Promise.all([
      prisma.pricingMolding.findMany({
        where: { companyId },
        orderBy: [{ name: 'asc' }],
        select: {
          id: true,
          name: true,
          pricePerM: true,
          quality: true,
          thicknessId: true,
          thickness: { select: { name: true } },
        },
      }),
      prisma.pricingMatboard.findMany({
        where: { companyId, ...activeWindow },
        orderBy: [{ name: 'asc' }],
        select: { id: true, name: true, pricePerFt2: true },
      }),
      prisma.pricingBacking.findMany({
        where: { companyId, ...activeWindow },
        orderBy: [{ name: 'asc' }],
        select: { id: true, name: true, pricePerFt2: true },
      }),
      prisma.pricingAccessory.findMany({
        where: { companyId, ...activeWindow },
        orderBy: [{ name: 'asc' }],
        select: { id: true, name: true, price: true },
      }),
      prisma.pricingMolding.findMany({
        where: { companyId, quality: 'SIMPLE', ...activeWindow },
        orderBy: [{ name: 'asc' }],
        select: { id: true, name: true, pricePerM: true },
      }),
      prisma.pricingMolding.findMany({
        where: { companyId, quality: 'BASTIDOR', ...activeWindow },
        orderBy: [{ name: 'asc' }],
        select: { id: true, name: true, pricePerM: true },
      }),
    ])

  const toNum = (v: any) =>
    v === null || v === undefined ? null : Number(v)

  const payload = {
    // Catálogo de molduras (compat: expone thickness como nombre)
    moldings: moldings.map(m => ({
      id: m.id,
      name: m.name,
      thicknessId: m.thicknessId,                      // nuevo
      thickness: m.thickness?.name ?? '',              // compat con front actual
      quality: m.quality,                              // SIMPLE, FINA, BASTIDOR
      pricePerM: toNum(m.pricePerM),                   // number | null
    })),
    // Insumos por ft²
    matboards: matboards.map(x => ({
      id: x.id,
      name: x.name,
      pricePerFt2: toNum(x.pricePerFt2),
    })),
    backings: backings.map(x => ({
      id: x.id,
      name: x.name,
      pricePerFt2: toNum(x.pricePerFt2),
    })),
    // Accesorios por unidad
    accessories: accessories.map(a => ({
      id: a.id,
      name: a.name,
      price: toNum(a.price),
    })),
    // NUEVO: listas de molduras por categoría para poblar selects del front
    thickness: {
      moldura: moldingSimple.map((t: { id: number; name: string; pricePerM: any }) => ({
        id: t.id,
        name: t.name,
        pricePerM: toNum(t.pricePerM), // puede ser null si no lo usas aún
      })),
      bastidor: moldingBastidor.map((t: { id: number; name: string; pricePerM: any }) => ({
        id: t.id,
        name: t.name,
        pricePerM: toNum(t.pricePerM),
      })),
    },
  }

  return NextResponse.json(payload)
}

export const dynamic = 'force-dynamic'
