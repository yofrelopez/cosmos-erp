'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySchema, CompanySchema } from '@/forms/companySchema';
import { useState, useEffect } from 'react';
import { useCompanyStore } from '@/lib/store/useCompanyStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

interface Props {
  initialData?: Partial<CompanySchema> & {
    id?: number;
    logoUrl?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void; // 👈 añade esto
}

export default function CompanyForm({ initialData, onSuccess, onCancel }: Props) {
  const { addCompany, updateCompany } = useCompanyStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: initialData
      ? { ...initialData, logo: undefined }
      : {},
  });

  const logoFile = watch('logo') as FileList | undefined;
  const [preview, setPreview] = useState<string | null>(initialData?.logoUrl ?? null);

  useEffect(() => {
    if (logoFile && logoFile.length > 0) {
      const file = logoFile[0];
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [logoFile]);

  async function onSubmit(values: any) {
    const formData = new FormData();

    const logoInput = values.logo;
    const isFileList = logoInput && typeof logoInput === 'object' && 'length' in logoInput;

    if (isFileList && (logoInput as FileList).length > 0) {
      const file = (logoInput as FileList)[0];
      if (file.size > 1024 * 1024) {
        toast.error('El archivo debe pesar como máximo 1 MB');
        return;
      }
      formData.append('logo', file);
    }

    Object.entries(values).forEach(([key, value]) => {
      if (key === 'logo') return;
      if (typeof value === 'string' && value.trim() !== '') {
        formData.append(key, value.trim());
      }
    });

    const url = initialData
      ? `/api/empresas/${initialData.id}`
      : '/api/empresas';
    const method = initialData ? 'PATCH' : 'POST';

    const res = await fetch(url, { method, body: formData });

    if (!res.ok) {
      toast.error('Error al guardar');
      return;
    }

    const data = await res.json();
    initialData ? updateCompany(data) : addCompany(data);
    toast.success('Guardado correctamente');
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre *"
          {...register('name')}
          error={errors.name?.message}
          required
          className="md:col-span-2"
        />
        <Input
          label="RUC *"
          {...register('ruc')}
          error={errors.ruc?.message}
          required
        />
        <Input
          label="Teléfono"
          {...register('phone')}
        />
        <Input
          label="Dirección"
          {...register('address')}
        />
        <Input
          label="Sitio web"
          type="text"
          {...register('website', {
            pattern: {
              value: /^https?:\/\/.+$/,
              message: 'Debes comenzar con http:// o https://', // 👈 aquí el mensaje UX mejorado
            },
          })}
          error={errors.website?.message}
        />
      </div>

      {/* 🖼️ Logo uploader con estilo e ícono */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Logo <span className="text-red-600">*</span>
        </label>
        <label
          htmlFor="logo"
          className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 font-medium px-4 py-2 rounded-md cursor-pointer hover:bg-blue-100 transition w-fit text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h16M4 7v13h16V7M4 7l4-4h8l4 4M12 11v6M9 14h6" />
          </svg>
          Subir imagen
          <input
            id="logo"
            type="file"
            accept="image/*"
            {...register('logo')}
            className="hidden"
          />
        </label>

        {preview && (
          <img
            src={preview}
            alt="Vista previa"
            className="h-20 mt-2 rounded object-contain"
          />
        )}
        {typeof errors.logo?.message === 'string' && (
          <p className="text-red-600 text-sm">{errors.logo.message}</p>
        )}
      </div>

      {/* 🔘 Botones */}
      <div className="flex gap-3">
        <Button
          type="submit"
          action="save"
          size="md"
          loading={isSubmitting}
        >
          Guardar
        </Button>
        <Button
          type="button"
          action="cancel"
          size="md"
          variant="outline"
          onClick={onCancel} // 👈 simplemente llamamos a la función que cierra el modal
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
