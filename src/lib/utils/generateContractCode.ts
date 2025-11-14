// src/lib/utils/generateContractCode.ts
import { prisma } from '@/lib/prisma'

export async function generateContractCode(companyId: number): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0') // Mes actual (01-12)

  return prisma.$transaction(async (tx) => {
    // Contar contratos del año para generar el siguiente número
    const contractsCount = await tx.contract.count({
      where: {
        companyId,
        date: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`)
        }
      }
    })

    const nextNumber = String(contractsCount + 1).padStart(3, '0') // Cambiado a 3 dígitos
    return `CONT-${year}-${month}-${nextNumber}` // Formato: CONT-2025-10-001
  })
}