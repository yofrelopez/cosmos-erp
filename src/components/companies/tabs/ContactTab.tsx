'use client';

import { useForm } from 'react-hook-form';
import { Company } from '@prisma/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

type ContactValues = {
  phone?: string;
  whatsapp?: string;
  email?: string;
};

export default function ContactTab({ company }: { company: Company }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty, errors },
    reset,
  } = useForm<ContactValues>({
    defaultValues: {
      phone: company.phone || '',
      whatsapp: company.whatsapp || '',
      email: company.email || '',
    },
  });

  function normalizePhone(v?: string) {
    if (!v) return v;
    // quita espacios/puntos/guiones; deja dígitos
    return v.replace(/[^\d+]/g, '').trim();
  }

  async function onSubmit(values: ContactValues) {
    const payload: ContactValues = {
      phone: normalizePhone(values.phone),
      whatsapp: normalizePhone(values.whatsapp),
      email: values.email?.trim(),
    };

    const res = await fetch(`/api/empresas/${company.id}?tab=contact`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      toast.error('No se pudo guardar');
      return;
    }

    toast.success('Contacto actualizado');
    reset(payload); // marca el form como limpio con los valores guardados
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Teléfono"
          inputMode="tel"
          autoComplete="tel"
          placeholder="987654321"
          {...register('phone', {
            validate: (v) =>
              !v || (normalizePhone(v)?.length ?? 0) >= 6 || 'Número demasiado corto',
          })}
          error={errors.phone?.message}
        />

        <Input
          label="WhatsApp"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="987654321"
          {...register('whatsapp', {
            validate: (v) =>
              !v || (normalizePhone(v)?.length ?? 0) >= 6 || 'Número demasiado corto',
          })}
          error={errors.whatsapp?.message}
        />

        <Input
          className="md:col-span-2"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="empresa@correo.com"
          {...register('email', {
            pattern: {
              // patrón simple y suficiente para front
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Email no válido',
            },
          })}
          error={errors.email?.message}
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
