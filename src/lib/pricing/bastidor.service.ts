import { prisma } from "@/lib/prisma";
import type { BastidorItemInput, BastidorPriceResult } from "@/types/newTypes";

const MOLDING_WASTE_CM = 4;
const ROUND_TO = 0.01;

function round2(n: number) {
  return Math.round(n / ROUND_TO) * ROUND_TO;
}

/**
 * Calcula el precio de un bastidor usando precios reales desde la BD.
 * No requiere castear al tipo ThicknessPricing; solo lee los campos necesarios.
 */
export async function calculateBastidorPrice(item: BastidorItemInput, companyId: number) {
  const thickness = await prisma.pricingThickness.findFirst({
    where: {
      id: item.thicknessId,
      companyId,
      isActive: true,
      category: "BASTIDOR",            // ← FILTRO por categoría
    },
    select: {
      id: true,
      name: true,
      category: true,
      pricePerM: true,                 // ← LEEMOS el precio por metro
    },
  });

  if (!thickness) {
    throw new Error("Espesor de BASTIDOR no encontrado o inactivo");
  }
  if (thickness.pricePerM == null) {
    throw new Error(`Espesor "${thickness.name}" no tiene pricePerM configurado`);
  }

  // Geometría
  const widthM = item.widthCm / 100;
  const heightM = item.heightCm / 100;
  const perimeterM = 2 * (widthM + heightM) + MOLDING_WASTE_CM / 100;

  const minSideM = Math.min(widthM, heightM);
  const crossbarsM =
    item.hasInnerCrossbars && item.crossbarCount > 0
      ? item.crossbarCount * minSideM
      : 0;

  const totalMeters = perimeterM + crossbarsM;

  // Precio desde BD
  const pricePerM = thickness.pricePerM;
  const unitPrice = round2(Number(totalMeters) * Number(pricePerM));
  const totalPrice = round2(unitPrice * item.quantity);

  return {
    unitPrice,
    totalPrice,
    metersUsed: round2(totalMeters),
    breakdown: {
      perimeterM: round2(perimeterM),
      crossbarsM: round2(crossbarsM),
      pricePerM,
    },
  };
}
