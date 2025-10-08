// src/app/api/companies/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const companies = await prisma.company.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, name: true, logoUrl: true, ruc: true, status: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(companies);
}
