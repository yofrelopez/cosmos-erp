'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySchema, CompanySchema } from '@/forms/companySchema';
import { useState, useEffect } from 'react';
import { useCompanyStore } from '@/lib/store/useCompanyStore';
import FormField, { FormInput } from '@/components/ui/FormField';
import { toast } from 'sonner';
import { Upload, Image } from 'lucide-react';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Nombre de la Empresa"
          error={errors.name?.message}
          required
          className="md:col-span-2"
        >
          <input
            {...register('name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ingrese el nombre de la empresa"
          />
        </FormField>
        
        <FormField
          label="RUC"
          error={errors.ruc?.message}
          required
        >
          <input
            {...register('ruc')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="RUC de la empresa"
          />
        </FormField>
        
        <FormField
          label="Teléfono"
          error={errors.phone?.message}
        >
          <input
            {...register('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Teléfono de contacto"
          />
        </FormField>
        
        <FormField
          label="Dirección"
          error={errors.address?.message}
        >
          <input
            {...register('address')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Dirección de la empresa"
          />
        </FormField>
        
        <FormField
          label="Sitio Web"
          error={errors.website?.message}
        >
          <input
            {...register('website', {
              pattern: {
                value: /^https?:\/\/.+$/,
                message: 'Debe comenzar con http:// o https://',
              },
            })}
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://www.empresa.com"
          />
        </FormField>
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
      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          Guardar
        </button>
      </div>
    </form>
  );
}
