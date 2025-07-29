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
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: data.status,
          notes: data.notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar los cambios');
      }

      toast.success('Cotización actualizada correctamente');
      router.push('/cotizaciones');
    } catch (error) {
      toast.error('No se pudo actualizar la cotización');
      console.error(error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <QuoteItemsForm isEditMode defaultValues={{ id: quoteId, clientId, notes, status, items }} />
       
        <div className="flex gap-4 pt-4">        

        <button
          type="button"
          onClick={() => router.push('/quotes')}
          className="cursor-pointer flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
        >
          <XCircle className="w-5 h-5" />
          Cancelar
        </button>

        <button
          type="submit"
          className="cursor-pointer flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          <CheckCircle className="w-5 h-5" />
          Guardar cambios
        </button>

      </div>


      </form>
    </FormProvider>
  );
}
