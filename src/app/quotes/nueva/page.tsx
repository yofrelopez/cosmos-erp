// app/quotes/nueva/page.tsx
'use client'

import { useEffect, useState } from 'react'
import ClientAutocomplete from '@/components/quotes/ClientAutocomplete'
import AddClientModal from '@/components/clients/AddClientModal'

import { useForm, FormProvider } from 'react-hook-form';

import { Client } from '@/types'
import QuoteItemsWrapper from '@/components/quotes/QuoteItemsWrapper'
import { toast } from 'sonner';

export default function NuevaCotizacionPage() {



    const [client, setClient] = useState<Client | null>(null)
  const [showAddClient, setShowAddClient] = useState(false)




const savedItems =
  typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('quoteItems') || '[]')
    : [];

const methods = useForm({
  defaultValues: {
    clientId: '',
    items: savedItems,
  },
});

useEffect(() => {
  const subscription = methods.watch((value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quoteItems', JSON.stringify(value.items || []));
    }
  });
  return () => subscription.unsubscribe();
}, [methods]);










  const onSubmit = (data: any) => {
  console.log('Datos del formulario de cotización:', data);
  // Aquí podrías agregar la lógica para enviar la cotización
};


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Nueva Cotización</h1>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">

        {/* Autocompletado de cliente */}
        <ClientAutocomplete
          onSelect={setClient}
          onCreateNew={() => setShowAddClient(true)}
        />

        {/* Mostrar info del cliente seleccionado */}
        {client && (
          <div className="text-sm text-gray-600 border rounded p-3 bg-gray-50">
            <p><strong>Nombre/Razón Social:</strong> {client.fullName || client.businessName}</p>
            <p><strong>Documento:</strong> {client.documentNumber}</p>
          </div>
        )}

        {/* Modal para crear nuevo cliente */}
        {showAddClient && (
          <AddClientModal
            onSuccess={async (newClient) => {
              // Fetch the full client object after creation if needed
              const response = await fetch(`/api/clients/${newClient.id}`);
              const fullClient: Client = await response.json();
              setClient(fullClient);
              setShowAddClient(false);
            }}
          />
        )}

        <QuoteItemsWrapper />

        {/* Botón para limpiar los ítems guardados localStorage */}

   {methods.watch('items')?.length > 1 && (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            toast('¿Estás seguro de borrar los ítems?', {
              description: 'Esta acción no se puede deshacer.',
              action: {
                label: 'Sí, borrar',
                onClick: () => {
                  localStorage.removeItem('quoteItems');
                  methods.reset({
                    ...methods.getValues(),
                    items: [],
                  });
                  toast.success('Ítems borrados correctamente');
                },
              },
            });
          }}
          className="border border-gray-400 text-gray-700 px-3 py-1 rounded hover:bg-gray-100 text-sm transition"
        >
          🧹 Limpiar ítems
        </button>
      </div>
    )}



        {/* Botón para guardar la cotización */}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
        >
          Guardar cotización
        </button>
      </form>

      </FormProvider>

    </div>
  )
}
