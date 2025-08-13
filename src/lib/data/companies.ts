// lib/data/companies.ts
import { prisma } from '@/lib/prisma';

export async function getCompanyById(id: number) {
  try {
    const company = await prisma.company.findUnique({
      where: { id },
    });
    return company;
  } catch (error) {
    console.error('Error al obtener la empresa:', error);
    return null;
  }
}
