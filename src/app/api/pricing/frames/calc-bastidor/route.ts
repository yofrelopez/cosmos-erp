import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateBastidorPrice } from "@/lib/pricing/bastidor.service";
import type { BastidorItemInput } from "@/types/newTypes";

const bastidorCalcSchema = z.object({
  companyId: z.number().int().positive(),
  widthCm: z.number().positive(),
  heightCm: z.number().positive(),
  quantity: z.number().int().min(1),
  thicknessId: z.number().int().positive(),
  hasInnerCrossbars: z.boolean(),
  crossbarCount: z.number().int().min(0),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bastidorCalcSchema.parse(body) as BastidorItemInput & {
      companyId: number;
    };

    const result = await calculateBastidorPrice(parsed, parsed.companyId);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    return NextResponse.json(
      { error: err?.message ?? "Error interno" },
      { status: 500 }
    );
  }
}
