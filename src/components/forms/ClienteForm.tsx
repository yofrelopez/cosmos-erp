'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { DocumentType } from '@prisma/client';
import { clientSchema, ClientFormValues } from '@/lib/validators/clienteSchema';
import { useClients } from '@/hooks/useClients';
import { useCompanyStore } from '@/lib/store/useCompanyStore';

import { mutate as globalMutate } from 'swr'




/* 🗂 Enum dinámico → si cambias el schema de Prisma se refleja aquí */
const documentTypes = Object.values(DocumentType) as DocumentType[];

type Props = {
  onSuccess?: (client: ClientFormValues & { id: number }) => void;
  initialData?: ClientFormValues & { id: number; createdAt?: Date };
  searchTerm?: string;
  isInModal?: boolean;
};

export function ClientForm({ onSuccess, initialData, searchTerm, isInModal = false }: Props) {
  const { mutate } = useClients({});
  const companyId = useCompanyStore((s) => s.company?.id);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData,
  });

  /* 🔄 Rellenar el formulario si llega initialData */
  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  useEffect(() => {
    if (companyId) {
      setValue('companyId', companyId, { shouldValidate: true });
    }
  }, [companyId, setValue]);

  /* 🔄 Pre-llenar con searchTerm cuando esté disponible */
  useEffect(() => {
    if (searchTerm && !initialData) {
      // Detectar si es un número (DNI/RUC) o texto (nombre)
      const isNumeric = /^\d+$/.test(searchTerm.trim());
      
      if (isNumeric) {
        // Es un documento
        setValue('documentNumber', searchTerm);
        if (searchTerm.length === 8) {
          setValue('documentType', 'DNI');
        } else if (searchTerm.length === 11) {
          setValue('documentType', 'RUC');
        }
      } else {
        // Es un nombre - detectar si parece empresa o persona
        const isCompany = /\b(S\.A\.C|S\.R\.L|E\.I\.R\.L|S\.A\.A|EIRL|SAC|SRL|S\.A\.)\b/i.test(searchTerm);
        
        if (isCompany) {
          setValue('businessName', searchTerm);
          setValue('documentType', 'RUC');
        } else {
          setValue('fullName', searchTerm);
          setValue('documentType', 'DNI');
        }
      }
    }
  }, [searchTerm, initialData, setValue]);

  /* 🔍 Pre-llenar con searchTerm si está disponible */
  useEffect(() => {
    if (searchTerm && !initialData) {
      // Detectar si es un número (posible DNI/RUC) o nombre
      const isNumeric = /^\d+$/.test(searchTerm.trim());
      
      if (isNumeric) {
        setValue('documentNumber', searchTerm.trim());
        // Detectar tipo de documento por longitud
        if (searchTerm.length === 8) {
          setValue('documentType', 'DNI');
        } else if (searchTerm.length === 11) {
          setValue('documentType', 'RUC');
        }
      } else {
        // Es un nombre, detectar si es persona o empresa
        const hasBusinessKeywords = /\b(S\.A\.C|S\.A|S\.R\.L|EIRL|E\.I\.R\.L)\b/i.test(searchTerm);
        
        if (hasBusinessKeywords) {
          setValue('businessName', searchTerm);
          setValue('documentType', 'RUC');
        } else {
          setValue('fullName', searchTerm);
          setValue('documentType', 'DNI');
        }
      }
    }
  }, [searchTerm, initialData, setValue]);


  /* onSubmit */

  const onSubmit = async (data: ClientFormValues) => {
    console.log('enviado')
  if (!companyId) {
    toast.error('No se ha seleccionado una empresa');
    return;
  }

  const payload = { ...data, companyId };

  try {
    const res = await fetch(
      initialData ? `/api/clients/${initialData.id}` : '/api/clients',
      {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err?.error || 'No se pudo guardar el cliente');
      return;
    }

    const newClient = await res.json(); // ← ya sabemos que hay cuerpo válido
                            // 🔁 refresca solo tras éxito

    toast.success(
      initialData ? 'Cliente actualizado con éxito' : 'Cliente registrado con éxito'
    );
    reset();
    onSuccess?.(newClient);
    mutate();   
    
  } catch (error) {
    console.error(error);
    toast.error('Ocurrió un error inesperado');
  }
};


  /* 🎨 Estilo moderno con Tailwind */
  const FormWrapper = isInModal ? 'div' : 'form';
  const formProps = isInModal ? {} : {
    onSubmit: handleSubmit(onSubmit,
      (formErrors) => console.log('❌ errores de validación', formErrors)
    )
  };

  return (
    <FormWrapper
      {...formProps}
      className={isInModal 
        ? "space-y-4" 
        : "bg-white rounded-xl shadow-lg max-w-xl w-full mx-auto px-8 py-6 space-y-6"
      }
    >


    {/* Grid responsive compacto */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

      {/* Tipo de documento */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
          <span className="text-blue-600">📋</span>
          Tipo de documento <span className="text-red-500">*</span>
        </label>
        <select
          {...register('documentType')}
          disabled={isSubmitting}
          className={`rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm ${
            errors.documentType 
              ? 'border-2 border-red-400 focus:border-red-500 bg-red-50 text-red-900' 
              : 'border border-gray-200 focus:border-blue-500 bg-white hover:border-gray-300'
          }`}
        >
          <option value="">Seleccionar…</option>
          {documentTypes.map((dt) => (
            <option key={dt} value={dt}>
              {dt}
            </option>
          ))}
        </select>
        {errors.documentType && (
          <p className="mt-1 text-xs text-red-700 bg-red-50 rounded px-2 py-1">
            {errors.documentType.message}
          </p>
        )}
      </div>

      {/* Nº documento */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
          <span className="text-green-600">🔢</span>
          Nº documento <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('documentNumber')}
          disabled={isSubmitting}
          placeholder="12345678 (DNI) • 20123456789 (RUC)"
          className={`rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm ${
            errors.documentNumber 
              ? 'border-2 border-red-400 focus:border-red-500 bg-red-50 text-red-900 placeholder-red-400' 
              : 'border border-gray-200 focus:border-blue-500 bg-white hover:border-gray-300 placeholder-gray-400'
          }`}
        />
        {errors.documentNumber && (
          <p className="mt-1 text-xs text-red-700 bg-red-50 rounded px-2 py-1">
            {errors.documentNumber.message}
          </p>
        )}
      </div>

      {/* Nombre completo */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
          <span className="text-blue-600">👤</span>
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('fullName')}
          disabled={isSubmitting}
          placeholder="Juan Pérez García"
          className={`rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm ${
            errors.fullName 
              ? 'border-2 border-red-400 focus:border-red-500 bg-red-50 text-red-900 placeholder-red-400' 
              : 'border border-gray-200 focus:border-blue-500 bg-white hover:border-gray-300 placeholder-gray-400'
          }`}
        />
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-700 bg-red-50 rounded px-2 py-1">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Razón social */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
          <span className="text-purple-600">🏢</span>
          Razón social
        </label>
        <input
          type="text"
          {...register('businessName')}
          disabled={isSubmitting}
          placeholder="Ferretería Los Andes S.A.C"
          className="rounded-lg px-3 py-2.5 text-sm font-medium border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm bg-white hover:border-gray-300 placeholder-gray-400"
        />
        {errors.businessName && (
          <p className="mt-1 text-xs text-red-700 bg-red-50 rounded px-2 py-1">
            {errors.businessName.message}
          </p>
        )}
      </div>

      {/* Continuar con los campos opcionales en el mismo grid */}

      {/* Teléfono */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
          <span className="text-green-600">📱</span>
          Teléfono
        </label>
        <input
          type="tel"
          {...register('phone')}
          disabled={isSubmitting}
          placeholder="999 123 456"
          className="rounded-lg px-3 py-2.5 text-sm font-medium border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm bg-white hover:border-gray-300 placeholder-gray-400"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
          <span className="text-blue-600">📧</span>
          Email
        </label>
        <input
          type="email"
          {...register('email')}
          disabled={isSubmitting}
          placeholder="juan@email.com"
          className="rounded-lg px-3 py-2.5 text-sm font-medium border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm bg-white hover:border-gray-300 placeholder-gray-400"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-700 bg-red-50 rounded px-2 py-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Dirección */}
      <div className="flex flex-col sm:col-span-2">
        <label className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
          <span className="text-orange-600">📍</span>
          Dirección
        </label>
        <input
          type="text"
          {...register('address')}
          disabled={isSubmitting}
          placeholder="Av. Los Libertadores 123, Lima"
          className="rounded-lg px-3 py-2.5 text-sm font-medium border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm bg-white hover:border-gray-300 placeholder-gray-400"
        />
      </div>

      {/* Observaciones */}
      <div className="flex flex-col sm:col-span-2">
        <label className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
          <span className="text-gray-600">📝</span>
          Observaciones
        </label>
        <textarea
          rows={3}
          {...register('notes')}
          disabled={isSubmitting}
          placeholder="Notas adicionales sobre el cliente..."
          className="rounded-lg px-3 py-2.5 text-sm font-medium border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm bg-white hover:border-gray-300 placeholder-gray-400 resize-none"
        />
      </div>
    </div>

    {/* Sección de botón compacta */}
    <div className="border-t border-gray-100 pt-4 space-y-3">
      <button
        type={isInModal ? 'button' : 'submit'}
        onClick={isInModal ? handleSubmit(onSubmit) : undefined}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Guardando cliente...</span>
          </>
        ) : (
          <>
            <span className="text-lg">✨</span>
            <span>{initialData ? 'Actualizar Cliente' : 'Crear Cliente'}</span>
          </>
        )}
      </button>
      
      {/* Mensaje de error compacto */}
      {(errors.documentType || errors.documentNumber || errors.fullName) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <span className="text-red-600 text-lg">⚠️</span>
          <p className="text-sm font-medium text-red-800">
            Completa los campos marcados con *
          </p>
        </div>
      )}
    </div>
  </FormWrapper>
);

}
