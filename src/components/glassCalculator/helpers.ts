// components/glassCalculator/helpers.ts
"use client";

/** ===== Tipos UI y payload (locales) ===== */
export type FamilyUI = "PLANO" | "CATEDRAL" | "TEMPLADO" | "REFLEJANTE";
export type FamilyPayload = "PLANO" | "CATEDRAL" | "TEMPLADO" | "REFLEJANTE";

export type Finish = "INCOLORO" | "MATE" | "POLARIZADO" | "REFLEJANTE" | "COLOR";
export type PayloadFinish = "INCOLORO" | "MATE" | "POLARIZADO" | "REFLEJANTE";

export type UiColor = "NONE" | "GRIS" | "AMBAR" | "AZUL" | "BRONCE";
export type PayloadColor = "NONE" | "GRIS" | "AMBAR" | "AZUL";

export type SvcUnit = "FT2" | "UNIDAD";
export type UiServiceKey = "CORTE_ESPECIAL" | "PERFORACION" | "CANTO_PULIDO" | "CANTO_BISEL";

/** ===== Utilidades y catálogos ===== */
export const range = (a: number, b: number) =>
  Array.from({ length: b - a + 1 }, (_, i) => a + i);

// PLANO: 2..12 mm
export const THICKNESS_PLANO = range(2, 12);
export const THICKNESS_BY_FAMILY_UI: Record<FamilyUI, number[]> = {
  PLANO: THICKNESS_PLANO,
  CATEDRAL: [3, 5.5],
  TEMPLADO: [6, 8, 10, 12],
  REFLEJANTE: [6, 8],
};

export function getAvailableFinishes(family: FamilyUI, thickness: number): Finish[] {
  if (family === "CATEDRAL") return ["INCOLORO", "POLARIZADO", "COLOR"];
  if (family === "TEMPLADO") return ["INCOLORO", "POLARIZADO"];
  if (family === "REFLEJANTE") return ["POLARIZADO"]; // regla actual
  // PLANO
  const list: Finish[] = ["INCOLORO"];
  if (thickness === 2) list.push("MATE");         // solo 2mm
  if (thickness >= 4) list.push("POLARIZADO");    // polarizado >=4mm
  return list;
}

export function getAvailableColors(family: FamilyUI, finish: Finish, thickness: number): UiColor[] {
  if (family === "CATEDRAL") {
    // El color libre se escribe en un input cuando finish = COLOR
    return ["NONE"];
  }
  if (family === "TEMPLADO") {
    // Para POLARIZADO: BRONCE/AMBAR (BRONCE solo descripción). Si no, NONE
    return finish === "POLARIZADO" ? ["BRONCE", "AMBAR"] : ["NONE"];
  }
  if (family === "REFLEJANTE") {
    // Colores: AZUL, BRONCE, GRIS (BRONCE solo descripción)
    return finish === "INCOLORO" ? ["NONE"] : ["AZUL", "BRONCE", "GRIS"];
  }
  // PLANO
  if (finish === "POLARIZADO") {
    if (thickness >= 4) return ["BRONCE", "AMBAR"];
    return ["NONE"];
  }
  return ["NONE"];
}

// Mapeo UI color -> payload color + flag de “solo descripción”
export function mapUiColorToPayload(c: UiColor): { payload: PayloadColor; describeOnly?: boolean } {
  if (c === "BRONCE") return { payload: "NONE", describeOnly: true }; // no existe en enum BD
  return { payload: c as PayloadColor };
}

/** ===== Servicios (UI) ===== */
export const UI_SERVICES: Array<{ key: UiServiceKey; label: string; unit: SvcUnit; hasQty?: boolean }> = [
  { key: "CORTE_ESPECIAL", label: "Corte especial", unit: "UNIDAD" },            // sin cantidad
  { key: "PERFORACION",    label: "Perforaciones", unit: "UNIDAD", hasQty: true },
  { key: "CANTO_PULIDO",   label: "Pulido (por ft²)", unit: "FT2" },
  { key: "CANTO_BISEL",    label: "Bordeado/Bisel (por ft²)", unit: "FT2" },
];

export function buildServicesPayload(
  svcState: Record<UiServiceKey, { enabled: boolean; qty?: number }>
) {
  const list: Array<{ process: string; unit: SvcUnit; qty?: number }> = [];
  for (const s of UI_SERVICES) {
    const st = svcState[s.key];
    if (!st?.enabled) continue;
    list.push({ process: s.key, unit: s.unit, ...(s.hasQty ? { qty: st.qty ?? 1 } : {}) });
  }
  return list;
}

/** ===== Descripción amigable (misma lógica actual) ===== */
export function buildDescription(base: string, opts: {
  isTemplado: boolean;
  isCatedral: boolean;
  isReflejante: boolean;
  finish: Finish;
  catedralColorLibre: string;
  uiColor: UiColor;
  describeOnly?: boolean;
}) {
  const { isTemplado, isCatedral, isReflejante, finish, catedralColorLibre, uiColor, describeOnly } = opts;
  let desc = base;

  if (isTemplado && !desc.toUpperCase().includes("TEMPLADO")) {
    desc = `${desc} (Templado)`;
  }
  if (isCatedral && finish === "COLOR" && catedralColorLibre.trim()) {
    desc = `${desc} (Color: ${catedralColorLibre.trim()})`;
  }
  // Colores UI que no están en enum (BRONCE)
  if (!isCatedral && describeOnly && uiColor === "BRONCE") {
    desc = `${desc} (Color: BRONCE)`;
  }
  // REFLEJANTE con BRONCE
  if (isReflejante && uiColor === "BRONCE") {
    desc = `${desc} (Color: BRONCE)`;
  }
  return desc;
}
