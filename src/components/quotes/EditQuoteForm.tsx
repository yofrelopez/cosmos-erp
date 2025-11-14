'use client';

import { useMemo } from 'react';          // 👈 nuevo

import { useForm, FormProvider } from 'react-hook-form';
import QuoteItemsForm from './QuoteItemsForm';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuoteItemInput {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal?: number;
}

interface EditQuoteFormProps {
  quoteId: number;
  clientId: number;
  notes: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  items: QuoteItemInput[];
}


export default function EditQuoteForm({
  quoteId,
  clientId,
  notes,
  status,
  items,
}: EditQuoteFormProps) {
  const router = useRouter();

  // 🔒 Mantiene la misma referencia mientras las props no cambien
  const defaultValues = useMemo(
    () => ({ id: quoteId, clientId, notes, status, items }),
    [quoteId, clientId, notes, status, items]
  );

  const methods = useForm({ defaultValues });

  const onSubmit = async (data: any) => {
    try {
      // Solo enviar datos que realmente han cambiado
      const payload: any = {
        status: data.status,
        notes: data.notes,
      };
      
      // 🔍 En modo edición, NO enviar items para preservar imágenes
      // Solo enviar status y notes para evitar recrear items sin imágenes

      console.log('🔍 EditQuoteForm payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar los cambios');
      }

      const result = await response.json();
      
      // Notificación especial si se creó un contrato
      if (result.contract) {
        toast.success(`🎉 ¡Cotización aprobada y contrato ${result.contract.code} creado!`, {
          duration: 5000,
          description: 'La cotización ha sido convertida automáticamente en contrato'
        });
      } else {
        toast.success('Cotización actualizada correctamente');
      }
      
      router.push('/admin/cotizaciones');
    } catch (error) {
      toast.error('No se pudo actualizar la cotización');
      console.error(error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <QuoteItemsForm isEditMode defaultValues={{ id: quoteId, clientId, notes, status, items }} />
       
        {/* Botones de acción mejorados */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">        
          <button
            type="button"
            onClick={() => router.push('/admin/cotizaciones')}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 min-h-[44px] sm:min-h-0"
          >
            <XCircle className="w-4 h-4" />
            Cancelar
          </button>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm min-h-[44px] sm:min-h-0"
          >
            <CheckCircle className="w-4 h-4" />
            Guardar cambios
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
