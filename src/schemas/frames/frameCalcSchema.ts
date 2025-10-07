// src/schemas/frames/frameCalculator/frameCalcSchema.ts


import { z } from "zod";

// Lista de grosores disponibles para molduras
export const THICKNESS_ALL = [
  "MEDIA",
  "TRES_CUARTOS",
  "UNA_PULGADA",
  "PULGADA_Y_MEDIA",
  "PULGADA_TRES_CUARTOS",
  "DOS_PULGADAS",
  "OTRO",
] as const;

// Esquema del formulario de cálculo de marcos
export const frameCalcSchema = z.object({
  kind: z.enum(["DIRECTO", "CON_FONDO", "FONDO_TRANSPARENTE"]),
  widthCm: z.coerce.number().positive(),
  heightCm: z.coerce.number().positive(),
  moldingThickness: z.union([z.literal(""), z.enum(THICKNESS_ALL)]).optional(),
  moldingId: z.coerce.number().int().positive().optional(),
  useCustomMolding: z.boolean().default(false),
  customMoldingName: z.string().optional(),
  customMoldingPricePerM: z.coerce.number().positive().optional(),
  hasInnerMolding: z.boolean().default(false),
  innerMoldingId: z.coerce.number().int().positive().optional(),
  matboardId: z.coerce.number().int().positive().optional(),
  backingId: z.coerce.number().int().positive().optional(),
  accessories: z.array(
    z.object({
      id: z.coerce.number().int().positive(),
      qty: z.coerce.number().positive(),
    })
  ).default([]),
});

// Tipo inferido desde el esquema
export type FrameCalcFormValues = z.infer<typeof frameCalcSchema>;
