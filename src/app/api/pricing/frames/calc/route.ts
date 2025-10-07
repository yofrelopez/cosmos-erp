import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateFramePrice } from "@/lib/pricing/frame.service";
import type { FrameItemInput } from "@/types/newTypes";

// Validación con Zod
const frameCalcSchema = z.object({
  companyId: z.number().int().positive(),
  moldingId: z.number().int().positive(),
  widthCm: z.number().positive(),
  heightCm: z.number().positive(),
  thicknessId: z.number().int().positive().optional().nullable(),
  matboardId: z.number().int().positive().optional().nullable(),
  backingId: z.number().int().positive().optional().nullable(),
  accessories: z
    .array(z.object({ id: z.number().int().positive(), qty: z.number().int().min(1) }))
    .optional()
    .default([]),
  quantity: z.number().int().min(1),
  useInnerMolding: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = frameCalcSchema.parse(body) as FrameItemInput;
    const result = await calculateFramePrice(parsed);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: err?.message ?? "Error interno" }, { status: 500 });
  }
}
