'use client';

import * as React from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Company } from '@prisma/client';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Upload, X, ImageIcon, Building2 } from 'lucide-react';

/* ---------------------------------- Tipos ---------------------------------- */

interface Props {
  company: Company;
  onUpdated?: (c: Company) => void; // 👈 nueva prop opcional
}
/**
 * Front schema (debe espejar las reglas clave del generalSchema del backend).
 * - name: requerido, >= 2
 * - ruc: 11 dígitos (Perú)
 * - status: ACTIVO | INACTIVO
 * - los demás opcionales
 */
const generalClientSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  ruc: z
    .string()
    .regex(/^\d{11}$/, 'El RUC debe tener 11 dígitos'),
  address: z.string().optional(),
  legalRepresentative: z.string().optional(),
  administrator: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'], { error: 'Debes seleccionar un estado' }),

  slogan: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type GeneralFormValues = z.infer<typeof generalClientSchema>;

const MAX_LOGO_MB = 3;
const ACCEPTED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'] as const;

/* -------------------------- Componente: LogoUploader ------------------------ */
/**
 * Desacoplado y reutilizable:
 * - Muestra preview si hay URL inicial o archivo nuevo
 * - Permite arrastrar/soltar, cambiar y quitar
 * - Notifica al padre vía callbacks
 */
function LogoUploader({
  initialUrl,
  onFileChange,
  onRemove,
}: {
  initialUrl?: string | null;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const pickFile = () => {
    if (!inputRef.current) return;
    inputRef.current.value = '';   // ← permite re-seleccionar el mismo archivo
    inputRef.current.click();
  };

  const revoke = React.useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  }, []);

  React.useEffect(() => {
    return () => revoke(previewUrl); // cleanup al desmontar
  }, [previewUrl, revoke]);

  function validateAndSet(file: File) {
    if (!ACCEPTED_MIME.includes(file.type as any)) {
      toast.error('Formato no permitido. Usa PNG, JPG, WEBP o SVG.');
      return;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_LOGO_MB) {
      toast.error(`El logo supera ${MAX_LOGO_MB}MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    revoke(previewUrl);
    setPreviewUrl(url);
    onFileChange(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  }

  function handleRemove(e?: React.MouseEvent) {
    e?.stopPropagation();
    revoke(previewUrl);
    setPreviewUrl(null);
    onFileChange(null);
    onRemove();
  }

  const shown = previewUrl ?? initialUrl ?? null;

  return (
    <div className="order-1 w-full md:w-44 md:shrink-0 mx-auto md:mx-0 max-w-xs sm:max-w-sm">
      <label className="block text-sm font-semibold text-gray-700 mb-2">Logo</label>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
        onClick={pickFile}
        style={{ aspectRatio: '1 / 1' }}
        aria-label="Cargar logo"
      >
        {shown ? (
          <Image
            src={shown}
            alt="Logo"
            fill
            className="object-contain p-3"
            sizes="176px"
            priority={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 p-6 text-center">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-xs">Arrastra o haz clic para subir</span>
            <span className="text-[11px] mt-1">PNG, JPG, WEBP, SVG · ≤ {MAX_LOGO_MB}MB</span>
          </div>
        )}

        {/* Overlay de acciones */}
        <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/40">
          <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="solid"
                  className="gap-1"
                  onClick={(e) => {
                    e.stopPropagation();     // ← evita doble disparo
                    pickFile();
                  }}
                >
                  <Upload className="w-4 h-4" /> Cambiar
                </Button>
            {shown && (
              <Button
                type="button"
                size="sm"
                variant="solid"
                className="gap-1"
                onClick={(e) => {
                  e.stopPropagation();     // ← también detener aquí
                  handleRemove();
                }}
              >
                <X className="w-4 h-4" /> Quitar
              </Button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME.join(',')}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

/* ------------------------------- GeneralTab -------------------------------- */

export default function GeneralTab({ company, onUpdated }: Props) {
  // Mantener una URL local para que el UI refleje cambios sin recargar
  const [currentLogoUrl, setCurrentLogoUrl] = React.useState<string | null>(
    company.logoUrl ?? null,
  );
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useForm<GeneralFormValues>({
    resolver: zodResolver(generalClientSchema),
    defaultValues: {
      name: company.name ?? '',
      ruc: company.ruc ?? '',
      address: company.address ?? '',
      legalRepresentative: company.legalRepresentative ?? '',
      administrator: company.administrator ?? '',
      // Importante: usamos ACTIVO/INACTIVO para alinear con tu requerimiento
      status: (company.status as any) ?? 'ACTIVE',
      slogan: company.slogan ?? '',
      description: company.description ?? '',
      notes: company.notes ?? '',
    },
    mode: 'onBlur',
  });

  function handleLogoFileChange(file: File | null) {
    setLogoFile(file);
    if (file) {
      // El usuario decidió reemplazar el logo -> no remover
      setRemoveLogo(false);
    }
  }

  function handleLogoRemove() {
    setCurrentLogoUrl(null);
    setRemoveLogo(true);
    setLogoFile(null);
  }

  async function onSubmit(values: GeneralFormValues) {
    try {
      const form = new FormData();
      form.append('tab', 'general');

      // Campos de texto
      (Object.keys(values) as (keyof GeneralFormValues)[]).forEach((key) => {
        const val = values[key];
        if (val !== undefined && val !== null) {
          form.append(key, String(val));
        }
      });

      // Control de logo
      if (logoFile) {
        form.append('logo', logoFile);
      } else if (removeLogo) {
        form.append('removeLogo', '1');
      }

       // 🔍 Depuración: ver qué se envía
    for (const [k, v] of form.entries()) console.log(k, v);

      const res = await fetch(`/api/empresas/${company.id}`, {
        method: 'PATCH',
        body: form,
      });

      // Lee el body UNA sola vez
      let payload: any = null;
      try {
        payload = await res.json();



      } catch {
        payload = null;
      }

      if (!res.ok) {
        console.error('PATCH /empresas/[id] (general) error:', payload);
        toast.error(payload?.message || 'No se pudo guardar. Revisa los campos.');
        return;
      }

      

      // Si tu endpoint devuelve { company }, toma eso; si devuelve la empresa directa, usa payload
      const updated = payload?.company ?? payload;




              //borrar
        console.log('Frontend recibió logoUrl =', updated?.logoUrl);




      toast.success('Cambios guardados correctamente');

      // 👉 avisa al contenedor para actualizar el estado global de la empresa
      onUpdated?.(updated);                 // actualiza TabsWrapper
      setCurrentLogoUrl(updated.logoUrl ?? null);  // ✅ toma la URL nueva (versionada)

        reset({
          name: updated.name ?? '',
          ruc: updated.ruc ?? '',
          address: updated.address ?? '',
          legalRepresentative: updated.legalRepresentative ?? '',
          administrator: updated.administrator ?? '',
          status: updated.status ?? 'ACTIVE',
          slogan: updated.slogan ?? '',
          description: updated.description ?? '',
          notes: updated.notes ?? '',
        });
        setRemoveLogo(false);
        setLogoFile(null);
    } catch (e) {
      console.error(e);
      toast.error('Error inesperado al guardar');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Sección: Información Básica */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
            <p className="text-sm text-gray-500">Datos fundamentales de la empresa</p>
          </div>
        </div>

        {/* Layout principal: grid 2 col + uploader a la derecha */}
        <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Datos básicos: 2 columnas en md+ */}
        <div className="order-2 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          <div>
            <Input
              label="Nombre *"
              placeholder="Nombre de la empresa"
              {...register('name')}
              error={errors.name?.message}
            />
          </div>

          <div>
            <Input
              label="RUC *"
              placeholder="11 dígitos"
              inputMode="numeric"
              maxLength={11}
              {...register('ruc')}
              error={errors.ruc?.message}
            />
          </div>

          <div>
            <Input label="Dirección" placeholder="Calle, número" {...register('address')} />
          </div>

          <div>
            <Input
              label="Representante legal"
              placeholder="Nombre completo"
              {...register('legalRepresentative')}
            />
          </div>

          <div>
            <Input label="Administrador" placeholder="Nombre completo" {...register('administrator')} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Estado *</label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="SUSPENDED">Suspendido</option>
                </select>
              )}
            />
            {errors.status?.message && (
              <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
            )}
          </div>
        </div>

          {/* Uploader de logo (cuadrado, moderno) */}
          <LogoUploader
            initialUrl={currentLogoUrl}
            onFileChange={handleLogoFileChange}
            onRemove={handleLogoRemove}
          />
        </div>
      </div>

      {/* Sección: Perfil Institucional */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <ImageIcon size={18} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Perfil Institucional</h3>
            <p className="text-sm text-gray-500">Información adicional y descripción de la empresa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Slogan" placeholder="Frase comercial" {...register('slogan')} />
          {/* reservado para futuros campos cortos */}
          <div className="hidden md:block" />
        </div>

        {/* Campos largos: una sola columna a lo ancho */}
        <div className="grid grid-cols-1 gap-4">
          <Textarea
            label="Descripción"
            rows={4}
            placeholder="Breve descripción de la empresa"
            {...register('description')}
          />
          <Textarea
            label="Notas internas"
            rows={4}
            placeholder="Observaciones internas o adicionales"
            {...register('notes')}
          />
        </div>
      </div>

      {/* Sección: Acciones */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex justify-end">
          <Button type="submit" size="md" action="save" loading={isSubmitting}>
            Guardar cambios
          </Button>
        </div>
      </div>
    </form>
  );
}
