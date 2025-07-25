// app/quotes/nueva/page.tsx
'use client'

import { useEffect, useState } from 'react'
import ClientAutocomplete from '@/components/quotes/ClientAutocomplete'
import AddClientModal from '@/components/clients/AddClientModal'

import { useForm, FormProvider } from 'react-hook-form';

import { Client } from '@/types'
import QuoteItemsWrapper from '@/components/quotes/QuoteItemsWrapper'
import { toast } from 'sonner';

import { QuoteItem } from '@prisma/client';
import { useSaveQuote } from '@/hooks/useSaveQuote';



interface FormData {
  clientId: string;
  items: QuoteItem[];
}



export default function NuevaCotizacionPage() {

    const [client, setClient] = useState<Client | null>(null)
    const [showAddClient, setShowAddClient] = useState(false)

    const { saveQuote } = useSaveQuote();



    const methods = useForm<FormData>({
      defaultValues: {
        clientId: '',
        items: [],
      },
    });


    // Restaurar ítems desde localStorage sin romper la hidratación
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const itemsFromStorage = localStorage.getItem('quoteItems');
        if (itemsFromStorage) {
          try {
            const parsed = JSON.parse(itemsFromStorage);
            if (Array.isArray(parsed)) {
              methods.setValue('items', parsed);
            }
          } catch (e) {
            console.warn('Error al parsear quoteItems desde localStorage', e);
          }
        }
      }
    }, [methods]);



    useEffect(() => {
      const subscription = methods.watch((value) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('quoteItems', JSON.stringify(value.items || []));
        }
      });
      return () => subscription.unsubscribe();
    }, [methods]);

    useEffect(() => {
      if (client?.id) {
        methods.setValue('clientId', String(client.id)); // ⚠️ Este campo debe estar en el `defaultValues` también
      }
    }, [client, methods]);


    const onSubmit = async (data: FormData) => {
      if (!data.clientId) {
        toast.error("Selecciona un cliente antes de guardar la cotización.");
        return;
      }

      await saveQuote(data);

      // ✅ Limpiar localStorage
      localStorage.removeItem('quoteItems');

      // ✅ Resetear formulario
      methods.reset({
        clientId: '',
        items: [],
      });

      toast.success("Formulario limpio. Listo para nueva cotización.");


      // ✅ Limpiar estado del cliente seleccionado
      setClient(null);
    };




    

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Nueva Cotización</h1>

      <FormProvider {...methods}>
        
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">

        {/* Autocompletado de cliente */}

        <ClientAutocomplete
        key={client ? client.id : 'empty'} // 👈 fuerza reinicio visual
          onSelect={(clientLite) => {
            setClient(clientLite as Client); // Conversión explícita
            methods.setValue('clientId', String(clientLite.id));
          }}
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
        { client && (
                  <button
          type="submit"
          className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Guardar cotización
        </button>
        )}




      </form>

      </FormProvider>

    </div>
  )
}
