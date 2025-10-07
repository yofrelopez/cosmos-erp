// src/app/api/pricing/glass/calc/route.ts
import { NextResponse } from "next/server";
import { areaFt2, applyMin } from "@/lib/pricing/math";
import { getGlassBase, getGlassModifiers, getGlassServices } from "@/lib/pricing/repo";

type Body = {
  companyId: number;
  family: "PLANO" | "CATEDRAL" | "TEMPLADO" | "REFLEJANTE"; // ← ampliar aquí
  thicknessMM: number;
  finish?: "INCOLORO"|"MATE"|"POLARIZADO"|"REFLEJANTE";
  color?: "NONE"|"GRIS"|"AMBAR"|"AZUL";
  anchoCm: number;
  altoCm: number;
  services?: Array<{ process: string; unit: "FT2"|"UNIDAD"; qty?: number }>;
};

export async function POST(req: Request) {
  const b = (await req.json()) as Body;

  const familyForBase = b.family; // intentamos la familia tal cual
let base = await getGlassBase(b.companyId, familyForBase as any, b.thicknessMM);

if (!base && (b.family === "TEMPLADO" || b.family === "REFLEJANTE")) {
  // Fallback temporal mientras no tengas tarifas propias cargadas
  base = await getGlassBase(b.companyId, "PLANO" as any, b.thicknessMM);
}

if (!base) {
  return NextResponse.json({ error: "No hay tarifa base vigente" }, { status: 400 });
}

  const ft2 = areaFt2(b.anchoCm, b.altoCm);
  let baseSubtotal = Number(base.pricePerFt2) * ft2;
  baseSubtotal = applyMin(baseSubtotal, base.minCharge !== undefined ? Number(base.minCharge) : undefined);
  const minFt2 = base.minBillableFt2 ? Math.max(ft2, Number(base.minBillableFt2)) : ft2;
  // recalcular por mínimo de ft² si aplica
  baseSubtotal = Math.max(baseSubtotal, Number(base.pricePerFt2) * minFt2);

  // Modificadores
  let modifiersTotal = 0;
  // FINISH_COLOR (para PLANO con finish/color)
  if (b.family === "PLANO" && b.finish && ["POLARIZADO","REFLEJANTE"].includes(b.finish) && b.color && b.color !== "NONE") {
    const mods = await getGlassModifiers(b.companyId, { target: "FINISH_COLOR", family: "PLANO", finish: b.finish, color: b.color });
    for (const m of mods) {
      const val = Number(m.value);
      modifiersTotal += m.valueType === "PERCENT" ? baseSubtotal * val : val * ft2;
    }
  }
  // CATEDRAL_COLOR
  if (b.family === "CATEDRAL" && b.color && b.color !== "NONE") {
    const mods = await getGlassModifiers(b.companyId, { target: "CATEDRAL_COLOR", family: "CATEDRAL", color: b.color });
    for (const m of mods) {
      const val = Number(m.value);
      modifiersTotal += m.valueType === "PERCENT" ? baseSubtotal * val : val * ft2;
    }
  }
  // TEMPLADO (umbral)
  if (b.thicknessMM >= 6) {
    const mods = await getGlassModifiers(b.companyId, { target: "TEMPLADO" });
    for (const m of mods) {
      if (m.minThicknessMM && Number(m.minThicknessMM) > b.thicknessMM) continue;
      const val = Number(m.value);
      modifiersTotal += m.valueType === "PERCENT" ? baseSubtotal * val : val * ft2;
    }
  }

  // Servicios
  let servicesTotal = 0;
  if (b.services?.length) {
    const svcs = await getGlassServices(b.companyId);
    for (const s of b.services) {
      const match = svcs.find(x => x.process === s.process && x.unit === s.unit);
      if (!match) continue;
      const price = Number(match.price);
      const partial = s.unit === "FT2" ? price * ft2 : price * (s.qty ?? 1);
      servicesTotal += applyMin(partial, match.minCharge !== undefined ? Number(match.minCharge) : undefined);
    }
  }

  const total = Number((baseSubtotal + modifiersTotal + servicesTotal).toFixed(2));

  return NextResponse.json({
    ft2: Number(ft2.toFixed(4)),
    base: Number(base.pricePerFt2),
    baseSubtotal: Number(baseSubtotal.toFixed(2)),
    modifiersTotal: Number(modifiersTotal.toFixed(2)),
    servicesTotal: Number(servicesTotal.toFixed(2)),
    total,
    description: `Vidrio ${b.family} ${b.thicknessMM}mm ${b.finish ?? ""} ${b.color ?? ""} ${b.anchoCm}x${b.altoCm}cm`,
    unit: "unidad", // puedes decidir "pieza"
    quantity: 1,
    unitPrice: total,
    subtotal: total,
  });
}
