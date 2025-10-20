// src/app/api/empresas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadLogo } from '@/lib/uploads/logo';
import type { Prisma } from '@prisma/client';
import { generalSchema, contactSchema, socialSchema } from '@/forms/company';

// (Opcional, recomendado si usas Cloudinary en backend)
export const runtime = 'nodejs';

/* ============================================================================
 * Utils de normalización
 * ==========================================================================*/

// Solo dígitos y '+'
const normalizePhone = (v?: string) => (v ? v.replace(/[^\d+]/g, '').trim() : v);

// Asegura https:// si falta
const withProto = (url: string) => (/^(https?:)?\/\//i.test(url) ? url : `https://${url}`);

const normalizeUrl = (v?: string) => {
  if (!v) return v;
  const t = v.trim();
  if (!t) return undefined;
  try {
    return new URL(withProto(t)).toString();
  } catch {
    return t; // el schema decidirá si es válido
  }
};

// Helper simple para flags tipo "1/true/on/yes"
const truthy = (val: unknown) => {
  const s = String(val ?? '').toLowerCase();
  return s === '1' || s === 'true' || s === 'on' || s === 'yes';
};

/* ============================================================================
 * Builders por pestaña
 * ==========================================================================*/

async function buildGeneralData(
  validated: any,
  companyId: number,
  opts: { logoFile: File | null; removeLogo: boolean }
): Promise<Prisma.companyUpdateInput> {
  const data: Prisma.companyUpdateInput = {
    name: validated.name.trim(),
    ruc: validated.ruc,
    address: validated.address?.trim() || null,
    legalRepresentative: validated.legalRepresentative?.trim() || null,
    administrator: validated.administrator?.trim() || null,
    status: validated.status, // Enum validado en schema
    slogan: validated.slogan?.trim() || null,
    description: validated.description?.trim() || null,
    notes: validated.notes?.trim() || null,
  };

  // Prioridad: si hay archivo nuevo, subir y guardar; si no, aplicar removeLogo
  if (opts.logoFile) {
    const logoUrl = await uploadLogo(opts.logoFile, {
      folder: 'vd-cosmos/logos',
      publicId: `empresa-${companyId}`,
    });
    data.logoUrl = logoUrl; // ← guarda URL versionada de Cloudinary
  } else if (opts.removeLogo) {
    data.logoUrl = null;
  }

  return data;
}

function buildContactData(validated: any): Prisma.companyUpdateInput {
  return {
    phone: normalizePhone(validated.phone) || null,
    whatsapp: normalizePhone(validated.whatsapp) || null,
    email: validated.email?.trim() || null,
  };
}

function buildSocialData(validated: any): Prisma.companyUpdateInput {
  return {
    website: normalizeUrl(validated.website) || null,
    facebookUrl: normalizeUrl(validated.facebookUrl) || null,
    instagramUrl: normalizeUrl(validated.instagramUrl) || null,
    tiktokUrl: normalizeUrl(validated.tiktokUrl) || null,
  };
}

/* ============================================================================
 * PATCH principal
 * ==========================================================================*/
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // mantenemos tu firma
) {
  try {
    const { id } = await ctx.params;
    const companyId = Number(id);
    if (Number.isNaN(companyId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Detectar tipo de contenido
    const contentType = req.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const isForm =
      contentType.includes('multipart/form-data') ||
      contentType.includes('application/x-www-form-urlencoded');

    // Cargar payload base (raw) y, si es form, extras del logo
    let raw: Record<string, any> = {};
    let logoFile: File | null = null;
    let removeLogo = false;

    if (isForm) {
      const form = await req.formData();
      raw = Object.fromEntries(form.entries());

      const entry = form.get('logo');
      logoFile = entry instanceof File && entry.size > 0 ? (entry as File) : null;
      removeLogo = truthy(form.get('removeLogo'));
    } else if (isJson) {
      raw = await req.json();
      // en JSON no hay archivo; permitimos removeLogo por si lo envían así
      removeLogo = truthy(raw.removeLogo);
    } else {
      try {
        raw = await req.json();
        removeLogo = truthy(raw.removeLogo);
      } catch {
        raw = {};
      }
    }

    // Descubrir pestaña (desde body o query)
    const url = new URL(req.url);
    const tabParam = url.searchParams.get('tab');
    const tab = String(raw.tab ?? tabParam ?? '');

    const schemaMap = {
      general: generalSchema,
      contact: contactSchema,
      social: socialSchema,
    } as const;

    if (!tab || !(tab in schemaMap)) {
      return NextResponse.json(
        { error: 'Pestaña inválida o no especificada' },
        { status: 400 }
      );
    }

    // Validar SOLO campos del schema (logo/removeLogo NO están en el schema)
    const parsed = schemaMap[tab as keyof typeof schemaMap].safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const validated = parsed.data;

    // Construir `data` según pestaña
  let data: Prisma.companyUpdateInput = {};
    if (tab === 'general') {
      data = await buildGeneralData(validated, companyId, { logoFile, removeLogo });
    } else if (tab === 'contact') {
      data = buildContactData(validated);
    } else if (tab === 'social') {
      data = buildSocialData(validated);
    }

    // Evitar update vacío: devuelve el registro tal cual
    if (!Object.keys(data).length) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      return NextResponse.json({ ok: true, company });
    }

    // Guardar y devolver empresa actualizada
    const company = await prisma.company.update({ where: { id: companyId }, data });
    return NextResponse.json({ ok: true, company });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'El RUC ya existe' }, { status: 409 });
    }
    console.error('Error en PATCH /empresas/[id]', err);
    return NextResponse.json(
      { error: 'Error al actualizar empresa' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: elimina la empresa solo si **no** tiene relaciones activas.
 */


export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const companyId = Number(params.id);

  if (isNaN(companyId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    // 1 · Verificar existencia + contar relaciones
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        _count: {
          select: {
            clients: true,
            quotes: true,
            contracts: true,
            bankAccounts: true,
            wallets: true,
            // branches: true, // No existe en el modelo actual
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    const {
      clients,
      quotes,
      contracts,
      bankAccounts,
      wallets,
    } = company._count;

    const totalRelations =
      clients + quotes + contracts + bankAccounts + wallets;

    if (totalRelations > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar: empresa con relaciones activas' },
        { status: 400 }
      );
    }

    // 2 · Eliminar (sin relaciones)
    await prisma.company.delete({ where: { id: companyId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Error interno al intentar eliminar' },
      { status: 500 }
    );
  }
}