

import { prisma } from "@/lib/prisma";
import type { FrameItemInput, FramePriceResult } from "@/types/newTypes";
import { PricingFrameKind } from "@prisma/client";

/**
 * Reglas y constantes
 */
const CM_PER_M = 100;
const FT2_PER_CM2 = 1 / 929.0304; // 1 ft² = 929.0304 cm²
const MOLDING_WASTE_CM = 4;       // desperdicio por corte
const ROUND_TO_2 = 0.01;

function round2(n: number) {
  return Math.round(n / ROUND_TO_2) * ROUND_TO_2;
}
function roundToHalf(n: number) {
  // redondea a múltiplos de 0.50 (termina en .00 o .50)
  return Math.round(n * 2) / 2;
}

/**
 * Entrada extendida para soportar las reglas del formulario
 * (sin romper los tipos existentes).
 *
 * - kind: tipo de cuadro (enum de Prisma)
 * - quality: SIMPLE | FINA  (FINA = +80% al subtotal de molduras y redondeo a .50)
 * - customMoldingPricePerM: precio manual si el Espesor = "OTRO"
 * - innerMoldingEnabled: si se activa la "Moldura interna" (solo si el fondo empieza con "MDF_")
 * - innerMoldingCustomPricePerM: precio manual si no existe thickness "INTERNA"
 */
export type FrameCalcInputExtended = FrameItemInput & {
  kind: PricingFrameKind;
  quality?: "SIMPLE" | "FINA";
  customMoldingPricePerM?: number | null;
  innerMoldingEnabled?: boolean;              // alternativa a useInnerMolding del tipo base
  innerMoldingCustomPricePerM?: number | null;
  // Para compatibilidad con formularios (no afectan precio directamente):
  color?: string | null;
  // NOTA: thicknessId en FrameItemInput representa espesor de MOLDURA (no de vidrio)
  //       el vidrio sale siempre de PricingGlassBase (PLANO, 2mm).
};

/**
 * Calcula precio de un cuadro con moldura (no bastidor).
 * Si el "kind" es CON_BASTIDOR, este servicio no aplica (usar bastidor.service.ts).
 */
export async function calculateFramePrice(
  input: FrameCalcInputExtended
): Promise<FramePriceResult> {
  const {
    companyId,
    moldingId,
    widthCm,
    heightCm,
    thicknessId, // espesor de moldura (MOLDURA)
    matboardId,
    backingId,
    accessories = [],
    quantity,
    // flags extendidos del formulario
    kind,
    quality = "SIMPLE",
    customMoldingPricePerM,
    innerMoldingEnabled,
    innerMoldingCustomPricePerM,
  } = input;

  // 0) Derivaciones de reglas por tipo
  if (kind === PricingFrameKind.CON_BASTIDOR) {
    // La lógica de bastidor vive en bastidor.service.ts
    throw new Error(
      "Este tipo (CON_BASTIDOR) debe calcularse con el cotizador de Bastidor."
    );
  }

  // Medidas externas para moldura exterior y vidrio (según reglas)
  const add5PerSide =
    kind === PricingFrameKind.CON_FONDO ||
    kind === PricingFrameKind.FONDO_TRANSPARENTE;
  const widthExtCm = widthCm + (add5PerSide ? 10 : 0);
  const heightExtCm = heightCm + (add5PerSide ? 10 : 0);

  // 1) Cargar datos de BD necesarios
  const [
    // Moldura (catálogo): solo si se eligió del catálogo
    moldingRow,
    // Espesor de MOLDURA seleccionado (si viene thicknessId y NO hay precio manual)
    moldingThicknessRow,
    // Fondo (matboard)
    matboardRow,
    // Backing (opcional)
    backingRow,
    // Precios de vidrio base (PLANO 2mm)
    glassBaseRow,
    // Accesorios
    accessoriesRows,
  ] = await Promise.all([
    moldingId
      ? prisma.pricingMolding.findFirst({
          where: { id: moldingId, companyId },
          select: { id: true, name: true, pricePerM: true },
        })
      : Promise.resolve(null),
    moldingId && !customMoldingPricePerM
      ? prisma.pricingMolding.findFirst({
          where: {
            id: moldingId,
            companyId,
            isActive: true,
          },
          select: { id: true, name: true, pricePerM: true },
        })
      : Promise.resolve(null),
    matboardId
      ? prisma.pricingMatboard.findFirst({
          where: { id: matboardId, companyId, isActive: true },
          select: { id: true, name: true, pricePerFt2: true },
        })
      : Promise.resolve(null),
    backingId
      ? prisma.pricingBacking.findFirst({
          where: { id: backingId, companyId, isActive: true },
          select: { id: true, name: true, pricePerFt2: true },
        })
      : Promise.resolve(null),
    prisma.pricingGlass.findFirst({
      where: {
        companyId,
        isActive: true,
        family: "PLANO",
        thicknessMM: 2,
      },
      select: { price: true },
    }),
    accessories.length
      ? prisma.pricingAccessory.findMany({
          where: {
            companyId,
            isActive: true,
            id: { in: accessories.map((a) => a.id) },
          },
          select: { id: true, price: true },
        })
      : Promise.resolve([] as { id: number; price: number | null }[]),
  ]);

  if (!glassBaseRow || glassBaseRow.price == null) {
    throw new Error(
      "No se encontró el precio de vidrio (PLANO 2mm) en PricingGlass."
    );
  }

  // 2) Geometría y perímetros
  const perimeterExtM =
    (2 * (widthExtCm + heightExtCm) + MOLDING_WASTE_CM) / CM_PER_M;
  const perimeterBaseM =
    (2 * (widthCm + heightCm) + MOLDING_WASTE_CM) / CM_PER_M;

  // 3) Precio por metro de la moldura exterior (prioridad: manual -> thickness -> moldura catálogo)
  let pricePerM_molding: number | null = null;

  if (customMoldingPricePerM != null) {
    pricePerM_molding = Number(customMoldingPricePerM);
  } else if (moldingThicknessRow?.pricePerM != null) {
    pricePerM_molding = Number(moldingThicknessRow.pricePerM);
  } else if (moldingRow?.pricePerM != null) {
    // fallback muy conservador (si tu catálogo guarda precioPorMetro directo)
    pricePerM_molding = Number(moldingRow.pricePerM);
  } else {
    // Si llegamos aquí, no tenemos precio para la moldura
    pricePerM_molding = 0;
  }

  // 4) Moldura externa: usar perímetro según tipo
  // - CON_FONDO: perímetro con +5 cm por lado
  // - FONDO_TRANSPARENTE o SIN_FONDO/ESPECIAL: perímetro base
  const perimeterForOuter =
    kind === PricingFrameKind.CON_FONDO ? perimeterExtM : perimeterBaseM;

  let moldingOuterCost = perimeterForOuter * (pricePerM_molding ?? 0);

  // 5) Moldura interna (si aplica)
  // Aplica solo si:
  // - tipo = CON_FONDO
  // - el fondo seleccionado empieza con "MDF_"
  // - innerMoldingEnabled = true (o usa input.useInnerMolding)
  let moldingInnerCost = 0;

  const matboardName = matboardRow?.name ?? "";
  const isMDFBase = matboardName.startsWith("MDF_");
  const innerEnabled = Boolean(innerMoldingEnabled ?? input.useInnerMolding);

  if (kind === PricingFrameKind.CON_FONDO && isMDFBase && innerEnabled) {
    // Buscar thickness "INTERNA" (MOLDURA)
    const innerMolding =
      innerMoldingCustomPricePerM == null
        ? await prisma.pricingMolding.findFirst({
            where: {
              companyId,
              isActive: true,
              name: "INTERNA",
            },
            select: { pricePerM: true },
          })
        : null;

    const pricePerM_inner =
      innerMoldingCustomPricePerM ??
      (innerMolding?.pricePerM != null ? Number(innerMolding.pricePerM) : null);

    if (pricePerM_inner == null) {
      throw new Error(
        'No existe Moldura "INTERNA" ni se ingresó precio manual para la moldura interna.'
      );
    }

    // El metraje de la interna se calcula SIEMPRE con medidas originales (sin +5 cm)
    moldingInnerCost = perimeterBaseM * pricePerM_inner;
  }

  // 6) Calidad (SIMPLE/FINA) aplicada al subtotal de molduras (outer + inner)
  let moldingSubtotal = moldingOuterCost + moldingInnerCost;
  if (quality === "FINA") {
    moldingSubtotal = roundToHalf(moldingSubtotal * 1.8);
  } else {
    moldingSubtotal = round2(moldingSubtotal);
  }

  // 7) Vidrio
  // precio base por ft² (PLANO 2mm) + 50% (fabricación y accesorios)
  const pricePerFt2Glass = Number(glassBaseRow.price) * 1.5;

  // Reglas:
  // - SIN_FONDO: 1 vidrio con medidas originales
  // - CON_FONDO: 1 vidrio con medidas +5 cm por lado
  // - FONDO_TRANSPARENTE: 2 vidrios con medidas +5 cm por lado
  let glassPieces = 0;
  let glassWidthCm = widthCm;
  let glassHeightCm = heightCm;

  if (kind === PricingFrameKind.SIN_FONDO) {
    glassPieces = 1;
    glassWidthCm = widthCm;
    glassHeightCm = heightCm;
  } else if (kind === PricingFrameKind.CON_FONDO) {
    glassPieces = 1;
    glassWidthCm = widthExtCm;
    glassHeightCm = heightExtCm;
  } else if (kind === PricingFrameKind.FONDO_TRANSPARENTE) {
    glassPieces = 2;
    glassWidthCm = widthExtCm;
    glassHeightCm = heightExtCm;
  } else {
    // ESPECIAL u otros: por ahora tratar como SIN_FONDO
    glassPieces = 1;
    glassWidthCm = widthCm;
    glassHeightCm = heightCm;
  }

  const glassAreaFt2 =
    (glassWidthCm * glassHeightCm) * FT2_PER_CM2; // area por vidrio
  const glassCost = round2(glassPieces * glassAreaFt2 * pricePerFt2Glass);

  // 8) Fondo (solo CON_FONDO)
  let matboardCost = 0;
  if (kind === PricingFrameKind.CON_FONDO && matboardRow?.pricePerFt2 != null) {
    const areaFt2 = (widthExtCm * heightExtCm) * FT2_PER_CM2;
    matboardCost = round2(areaFt2 * Number(matboardRow.pricePerFt2));
  }

  // 9) Backing (opcional)
  // - No se cobra en FONDO_TRANSPARENTE (fondo es transparente)
  // - En CON_FONDO podría no usarse (ya hay matboard), pero si lo envían lo calculamos
  let backingCost = 0;
  if (backingRow?.pricePerFt2 != null && kind !== PricingFrameKind.FONDO_TRANSPARENTE) {
    const w = kind === PricingFrameKind.CON_FONDO ? widthExtCm : widthCm;
    const h = kind === PricingFrameKind.CON_FONDO ? heightExtCm : heightCm;
    const areaFt2 = (w * h) * FT2_PER_CM2;
    backingCost = round2(areaFt2 * Number(backingRow.pricePerFt2));
  }

  // 10) Accesorios (por unidad)
  let accessoriesCost = 0;
  if (accessoriesRows?.length) {
    const priceById = new Map(accessoriesRows.map(a => [a.id, Number(a.price ?? 0)]));
    accessoriesCost = accessories.reduce((sum, it) => {
      const p = priceById.get(it.id) ?? 0;
      return sum + Number(p) * it.qty;
    }, 0);
    accessoriesCost = round2(accessoriesCost);
  }

  // 11) Total unitario y total
  const unitPrice = round2(
    moldingSubtotal + glassCost + matboardCost + backingCost + accessoriesCost
  );
  const total = round2(unitPrice * quantity);

  return {
    unitPrice,
    total,
    breakdown: {
      moldingCost: round2(moldingSubtotal), // incluye calidad (FINA) y, si aplica, moldura interna
      glassCost,
      matboardCost,
      backingCost,
      accessoriesCost,
    },
  };
}
