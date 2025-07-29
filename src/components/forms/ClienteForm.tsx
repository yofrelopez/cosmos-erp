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
};

export function ClientForm({ onSuccess, initialData }: Props) {
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
  return (
  <form
    onSubmit={handleSubmit(onSubmit,
      (formErrors) => console.log('❌ errores de validación', formErrors)  // 👈
    )}
    className="bg-white rounded-xl shadow-lg max-w-xl w-full mx-auto px-8 py-6 space-y-8"
  >
   {/*  <h2 className="text-xl font-semibold text-gray-800">
      {initialData ? 'Editar cliente' : 'Nuevo cliente'}
    </h2> */}

    {/* Grid responsive */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

      {/* Tipo de documento */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Tipo de documento
        </label>
        <select
          {...register('documentType')}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-3 py-2
                     focus:border-blue-600 focus:ring-1 focus:ring-blue-600
                     disabled:bg-gray-100"
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
        <label className="text-sm font-medium text-gray-700 mb-1">
          Nº documento
        </label>
        <input
          type="text"
          {...register('documentNumber')}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-3 py-2
                     focus:border-blue-600 focus:ring-1 focus:ring-blue-600
                     disabled:bg-gray-100"
        />
        {errors.documentNumber && (
          <p className="mt-1 text-xs text-red-700 bg-red-50 rounded px-2 py-1">
            {errors.documentNumber.message}
          </p>
        )}
      </div>

      {/* Nombre completo (ocupa 2 columnas en sm+) */}
      <div className="flex flex-col sm:col-span-2">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Nombre completo
        </label>
        <input
          type="text"
          {...register('fullName')}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-3 py-2
                     focus:border-blue-600 focus:ring-1 focus:ring-blue-600
                     disabled:bg-gray-100"
        />
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-700 bg-red-50 rounded px-2 py-1">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Teléfono */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Teléfono</label>
        <input
          type="text"
          {...register('phone')}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-3 py-2
                     focus:border-blue-600 focus:ring-1 focus:ring-blue-600
                     disabled:bg-gray-100"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          {...register('email')}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-3 py-2
                     focus:border-blue-600 focus:ring-1 focus:ring-blue-600
                     disabled:bg-gray-100"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-700 bg-red-50 rounded px-2 py-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Dirección */}
      <div className="flex flex-col sm:col-span-2">
        <label className="text-sm font-medium text-gray-700 mb-1">Dirección</label>
        <input
          type="text"
          {...register('address')}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-3 py-2
                     focus:border-blue-600 focus:ring-1 focus:ring-blue-600
                     disabled:bg-gray-100"
        />
      </div>

      {/* Observaciones */}
      <div className="flex flex-col sm:col-span-2">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Observaciones
        </label>
        <textarea
          rows={3}
          {...register('notes')}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-3 py-2
                     focus:border-blue-600 focus:ring-1 focus:ring-blue-600
                     disabled:bg-gray-100"
        />
      </div>
    </div>

    {/* Botón */}
    <button
      type="submit"
      disabled={isSubmitting}
      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                 text-white w-full sm:w-auto px-6 py-2 rounded-lg disabled:opacity-60
                 cursor-pointer transition-colors duration-200"
    >
      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
      {initialData ? 'Actualizar' : 'Guardar'}
    </button>
  </form>
);

}
