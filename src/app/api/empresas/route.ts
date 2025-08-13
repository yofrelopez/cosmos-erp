// src/app/api/empresas/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { companySchema } from '@/forms/companySchema';
import { uploadLogo } from '@/lib/uploads/logo';
import { Prisma } from '@prisma/client';

/** Crea nueva empresa  */
export async function POST(req: Request) {
  try {
    // 1‑ Recibimos formulario multipart
    const form = await req.formData();
    const rawData = Object.fromEntries(form); // File incluido

    // 2‑ Validamos con Zod
    const parse = companySchema.safeParse(rawData);
    if (!parse.success) {
      return NextResponse.json(
        { errors: parse.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parse.data;

    // 3‑ Subimos logo (si viene)
    let logoUrl: string | undefined;
    if (
      typeof data.logo === 'object' &&
      data.logo !== null &&
      typeof (data.logo as any).arrayBuffer === 'function'
    ) {
      logoUrl = await uploadLogo(data.logo as File, { folder: 'vd-cosmos/logos' });
    }

    // 4‑ Creamos registro en Prisma
    const company = await prisma.company.create({
      data: {
        name:  data.name.trim(),
        ruc:   data.ruc,
        logoUrl,
        address: data.address?.trim() || undefined,
        phone:   data.phone?.trim()   || undefined,
        whatsapp:data.whatsapp?.trim()|| undefined,
        facebookUrl:  data.facebookUrl,
        instagramUrl: data.instagramUrl,
        tiktokUrl:    data.tiktokUrl,
        email:   data.email,
        website: data.website,
        slogan:  data.slogan,
        description: data.description,
        notes:   data.notes,
        status:  'ACTIVE',
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (err) {
    // Manejo de duplicidad RUC
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'El RUC ya existe' },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: 'Error interno al crear la empresa' },
      { status: 500 }
    );
  }
}
