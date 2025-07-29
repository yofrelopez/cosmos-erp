// src/lib/utils/generateQuoteCode.ts
import { prisma } from '@/lib/prisma'

export async function generateQuoteCode(companyId: number): Promise<string> {
  const year = new Date().getFullYear()

  return prisma.$transaction(async (tx) => {
    const last = await tx.quote.findFirst({
      where: { companyId, code: { startsWith: `COT-${year}-` } },
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    })

    const lastNumber = last?.code?.split('-')[2] ?? '0000'
    const nextNumber = String(parseInt(lastNumber) + 1).padStart(4, '0')
    return `COT-${year}-${nextNumber}`
  })
}
