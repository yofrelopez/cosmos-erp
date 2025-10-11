// src/lib/pricing/repo.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const nowFilter = (alias = "") => ({
  AND: [
    { isActive: true },
    { validFrom: { lte: new Date() } },
    { OR: [{ validTo: null }, { validTo: { gte: new Date() } }] },
  ],
});

export const getGlassBase = (companyId: number, family: "PLANO"|"CATEDRAL", thicknessMM: number) =>
  prisma.pricingGlass.findFirst({
    where: { companyId, family, thicknessMM, ...nowFilter() },
    orderBy: { validFrom: "desc" },
  });

export const getGlassModifiers = (companyId: number, params: {
  target?: "FINISH_COLOR"|"CATEDRAL_COLOR"|"TEMPLADO",
  family?: "PLANO"|"CATEDRAL",
  finish?: "INCOLORO"|"MATE"|"POLARIZADO"|"REFLEJANTE",
  color?: "NONE"|"GRIS"|"AMBAR"|"AZUL",
  thicknessMM?: number,
}) => prisma.pricingGlass.findMany({
  where: {
    companyId,
    ...nowFilter(),
    ...(params.target ? { target: params.target } : {}),
    ...(params.family ? { family: params.family } : {}),
    ...(params.finish ? { finish: params.finish } : {}),
    ...(params.color ? { color: params.color } : {}),
  },
});

export const getGlassServices = (companyId: number) =>
  prisma.pricingGlass.findMany({ where: { companyId, ...nowFilter() } });

export const getFrameCatalogs = (companyId: number) => Promise.all([
  prisma.pricingMolding.findMany({ where: { companyId, ...nowFilter() } }),
  prisma.pricingMatboard.findMany({ where: { companyId, ...nowFilter() } }),
  prisma.pricingBacking.findMany({ where: { companyId, ...nowFilter() } }),
  prisma.pricingAccessory.findMany({ where: { companyId, ...nowFilter() } }),
]);
