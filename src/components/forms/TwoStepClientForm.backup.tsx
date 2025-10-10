'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';

import { DocumentType } from '@prisma/client';
import { clientSchema, ClientFormValues } from '@/lib/validators/clienteSchema';
import { useClients } from '@/hooks/useClients';
import { useCompanyStore } from '@/lib/store/useCompanyStore';

const documentTypes = Object.values(DocumentType) as DocumentType[];

type Props = {
  onSuccess?: (client: ClientFormValues & { id: number }) => void;
  initialData?: ClientFormValues & { id: number; createdAt?: Date };
  searchTerm?: string;
  isInModal?: boolean;
};

type Step = 1 | 2;

export function TwoStepClientForm({ onSuccess, initialData, searchTerm, isInModal = false }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const { mutate } = useClients({});
  const companyId = useCompanyStore((s) => s.company?.id);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    getValues,
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
      const isNumeric = /^\d+$/.test(searchTerm.trim());
      
      if (isNumeric) {
        setValue('documentNumber', searchTerm);
        if (searchTerm.length === 8) {
          setValue('documentType', 'DNI');
        } else if (searchTerm.length === 11) {
          setValue('documentType', 'RUC');
        }
      } else {
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

  /* 📝 Validación para avanzar al Step 2 */
  const handleNextStep = async () => {
    const step1Fields = ['documentType', 'documentNumber', 'fullName'] as const;
    const isValid = await trigger(step1Fields);
    
    if (isValid) {
      setCurrentStep(2);
    } else {
      toast.error('Completa los campos requeridos antes de continuar');
    }
  };

  /* ⬅️ Regresar al Step 1 */
  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  /* 💾 Enviar formulario */
  const onSubmit = async (data: ClientFormValues) => {
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

      const newClient = await res.json();

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

  /* 🎨 Indicador de progreso minimalista */
  const ProgressIndicator = () => (
    <div className="mb-4">
      <div className="flex items-center justify-center space-x-2">
        {/* Step 1 */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
          currentStep >= 1 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-500'
        }`}>
          {currentStep > 1 ? <Check size={12} /> : '1'}
        </div>

        {/* Línea conectora */}
        <div className={`w-8 h-px transition-colors ${
          currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
        }`} />

        {/* Step 2 */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
          currentStep >= 2 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-500'
        }`}>
          2
        </div>
      </div>
      
      {/* Label del step actual */}
      <div className="text-center mt-2">
        <span className="text-xs text-gray-600 font-medium">
          {currentStep === 1 ? 'Información básica' : 'Datos adicionales'}
        </span>
      </div>
    </div>
  );

  /* 🏗️ Wrapper del formulario */
  const FormWrapper = isInModal ? 'div' : 'form';
  const formProps = isInModal ? {} : {
    onSubmit: handleSubmit(onSubmit)
  };

  return (
    <FormWrapper
      {...formProps}
      className={isInModal 
        ? "space-y-6 w-full" 
        : "bg-white rounded-xl shadow-lg max-w-xl w-full mx-auto px-8 py-6 space-y-6"
      }
    >
      <ProgressIndicator />

      {/* STEP 1: Información Básica */}
      {currentStep === 1 && (
        <div className="space-y-4">

          <div className="w-full grid grid-cols-1 gap-4">
            {/* Tipo de documento */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
                <span className="text-blue-600">📋</span>
                Tipo de documento <span className="text-red-500">*</span>
              </label>
              <select
                {...register('documentType')}
                disabled={isSubmitting}
                className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm ${
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
                placeholder="Ej: 12345678"
                className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm ${
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
                className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm ${
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
                placeholder="Empresa S.A.C"
                className="w-full rounded-lg px-3 py-2.5 text-sm font-medium border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm bg-white hover:border-gray-300 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Botón Siguiente */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span>Siguiente</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Información Adicional */}
      {currentStep === 2 && (
        <div className="space-y-4">

          {/* Resumen del Step 1 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">📋 Resumen información básica:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Documento:</strong> {getValues('documentType')} - {getValues('documentNumber')}</p>
              <p><strong>Nombre:</strong> {getValues('fullName')}</p>
              {getValues('businessName') && (
                <p><strong>Razón social:</strong> {getValues('businessName')}</p>
              )}
            </div>
          </div>

          <div className="w-full grid grid-cols-1 gap-4">
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
                className="w-full rounded-lg px-3 py-2.5 text-sm font-medium border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm bg-white hover:border-gray-300 placeholder-gray-400"
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
                className="w-full rounded-lg px-3 py-2.5 text-sm font-medium border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm bg-white hover:border-gray-300 placeholder-gray-400"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-700 bg-red-50 rounded px-2 py-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
                <span className="text-orange-600">📍</span>
                Dirección
              </label>
              <input
                type="text"
                {...register('address')}
                disabled={isSubmitting}
                placeholder="Dirección completa"
                className="w-full rounded-lg px-3 py-2.5 text-sm font-medium border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm bg-white hover:border-gray-300 placeholder-gray-400"
              />
            </div>

            {/* Observaciones */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
                <span className="text-gray-600">📝</span>
                Observaciones
              </label>
              <textarea
                rows={3}
                {...register('notes')}
                disabled={isSubmitting}
                placeholder="Notas adicionales..."
                className="w-full rounded-lg px-3 py-2.5 text-sm font-medium border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:bg-gray-50 transition-all duration-200 shadow-sm bg-white hover:border-gray-300 placeholder-gray-400 resize-none"
              />
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ArrowLeft size={16} />
              <span>Anterior</span>
            </button>

            <button
              type={isInModal ? 'button' : 'submit'}
              onClick={isInModal ? handleSubmit(onSubmit) : undefined}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">✨</span>
                  <span>{initialData ? 'Actualizar Cliente' : 'Crear Cliente'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </FormWrapper>
  );
}