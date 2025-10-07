// src/lib/pricing/math.ts
export const CM2_TO_FT2 = 0.00107639104; // 1 cm² = 0.00107639104 ft²
export const areaFt2 = (anchoCm: number, altoCm: number) => (anchoCm * altoCm) * CM2_TO_FT2;

export function applyMin(value: number, min?: number) {
  return typeof min === "number" ? Math.max(value, min) : value;
}
