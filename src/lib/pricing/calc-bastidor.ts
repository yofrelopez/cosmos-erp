import type {
  BastidorItemInput,
  BastidorPriceResult,
  ThicknessPricing,
} from "@/types/newTypes";

// Función para calcular el precio de un bastidor
export function calculateBastidorPrice(
  item: BastidorItemInput,
  pricingList: ThicknessPricing[]
): BastidorPriceResult {
  const widthM = item.widthCm / 100;
  const heightM = item.heightCm / 100;

  // Perímetro del marco: 2 anchos + 2 altos
  const perimeterM = 2 * (widthM + heightM);

  // Metros de travesaños interiores si aplica
  const crossbarsM = item.hasInnerCrossbars
    ? item.crossbarCount * heightM
    : 0;

  const totalMeters = perimeterM + crossbarsM;

  const thickness = pricingList.find(p => p.id === item.thicknessId);
  if (!thickness) {
    throw new Error("Espesor no encontrado en la lista de precios");
  }

  const pricePerM = thickness.pricePerM;
  const unitPrice = parseFloat((totalMeters * pricePerM).toFixed(2));
  const totalPrice = parseFloat((unitPrice * item.quantity).toFixed(2));

  return {
    unitPrice,
    totalPrice,
    metersUsed: parseFloat(totalMeters.toFixed(2)),
    breakdown: {
      perimeterM: parseFloat(perimeterM.toFixed(2)),
      crossbarsM: parseFloat(crossbarsM.toFixed(2)),
      pricePerM,
    },
  };
}
