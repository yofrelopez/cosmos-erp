'use client';

import { useForm } from 'react-hook-form';
import { Company } from '@prisma/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

type SocialValues = {
  website?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
};

function normalizeUrl(v?: string) {
  if (!v) return v;
  const trimmed = v.trim();
  if (trimmed === '') return undefined;
  // agrega https:// si falta protocolo
  const withProto = /^(https?:)?\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProto);
    return url.toString(); // normalizada
  } catch {
    return trimmed; // deja tal cual; la validación mostrará el error
  }
}

function isValidUrl(v?: string) {
  if (!v || v.trim() === '') return true;
  try {
    // aceptamos http/https únicamente
    const u = new URL(/^(https?:)?\/\//i.test(v) ? v : `https://${v}`);
    return ['http:', 'https:'].includes(u.protocol);
  } catch {
    return false;
  }
}

export default function SocialTab({ company }: { company: Company }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty, errors },
    reset,
    getValues,
  } = useForm<SocialValues>({
    defaultValues: {
      website: company.website || '',
      facebookUrl: company.facebookUrl || '',
      instagramUrl: company.instagramUrl || '',
      tiktokUrl: company.tiktokUrl || '',
    },
  });

  async function onSubmit(values: SocialValues) {
    const payload: SocialValues = {
      website: normalizeUrl(values.website),
      facebookUrl: normalizeUrl(values.facebookUrl),
      instagramUrl: normalizeUrl(values.instagramUrl),
      tiktokUrl: normalizeUrl(values.tiktokUrl),
    };

    const res = await fetch(`/api/empresas/${company.id}?tab=social`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      toast.error('No se pudo guardar');
      return;
    }

    toast.success('Redes actualizadas');
    reset(payload); // limpia el form con los valores persistidos
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Website"
          placeholder="https://tudominio.com"
          {...register('website', {
            validate: (v) => isValidUrl(v) || 'URL no válida',
          })}
          error={errors.website?.message}
        />
        <Input
          label="Facebook"
          placeholder="https://facebook.com/tu_pagina"
          {...register('facebookUrl', {
            validate: (v) => isValidUrl(v) || 'URL no válida',
          })}
          error={errors.facebookUrl?.message}
        />
        <Input
          label="Instagram"
          placeholder="https://instagram.com/tu_usuario"
          {...register('instagramUrl', {
            validate: (v) => isValidUrl(v) || 'URL no válida',
          })}
          error={errors.instagramUrl?.message}
        />
        <Input
          label="TikTok"
          placeholder="https://tiktok.com/@tu_usuario"
          {...register('tiktokUrl', {
            validate: (v) => isValidUrl(v) || 'URL no válida',
          })}
          error={errors.tiktokUrl?.message}
        />
      </div>

      <Button
        type="submit"
        action="save"
        size="md"
        loading={isSubmitting}
        disabled={!isDirty || isSubmitting}
      >
        Guardar cambios
      </Button>
    </form>
  );
}
