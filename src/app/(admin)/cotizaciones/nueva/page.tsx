// app/quotes/nueva/page.tsx
'use client'

import { useEffect, useState } from 'react'
import ClientAutocomplete from '@/components/quotes/ClientAutocomplete'
import AddClientModal from '@/components/clients/AddClientModal'

import { useForm, FormProvider } from 'react-hook-form';

import { Client } from '@/types'
import QuoteItemsWrapper from '@/components/quotes/QuoteItemsWrapper'
import { toast } from 'sonner';

import { QuoteItem, QuoteStatus } from '@prisma/client';

import { useSaveQuote } from '@/hooks/useSaveQuote';
import { PlusCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useCompanyStore } from '@/lib/store/useCompanyStore';
import MobileMenuButton from '@/components/ui/MobileMenuButton';




export interface FormData {
  clientId: number;            
  companyId?: number;          // lo añadimos manualmente desde Zustand
  notes?: string;
  status?: QuoteStatus; // 'PENDING' por defecto
  items: QuoteItem[];          // puedes usar el tipo de Prisma aquí sin problema
}


export default function NuevaCotizacionPage() {

    const [client, setClient] = useState<Client | null>(null)
    const [showAddClient, setShowAddClient] = useState(false)

    const companyId = useCompanyStore((s) => s.company?.id);


    const { saveQuote } = useSaveQuote();

    const router = useRouter();




    const methods = useForm<FormData>({
      defaultValues: {
      clientId: 0,
      items: [],
      notes: '',
      status: 'PENDING', // valor por defecto interno
    }
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
        methods.setValue('clientId', client.id); // ⚠️ Este campo debe estar en el `defaultValues` también
      }
    }, [client, methods]);


    const onSubmit = async (data: FormData) => {
      if (!data.clientId) {
        toast.error("Selecciona un cliente antes de guardar la cotización.");
        return;
      }

        if (!companyId) {
    toast.error("No se ha seleccionado una empresa.");
    return;
  }

      await saveQuote({
        ...data,
        companyId, // ✅ ahora sí cumple con el backend
      });

      // ✅ Limpiar localStorage
      localStorage.removeItem('quoteItems');

      // ✅ Resetear formulario
      methods.reset({
      clientId: 0,  // ⚠️ esto es number
      items: [],
    });


      toast.success("Formulario limpio. Listo para nueva cotización.");


      // ✅ Limpiar estado del cliente seleccionado
      setClient(null);
    };




    

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header responsive con borde azul */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b-4 border-blue-800 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Botón hamburguesa integrado - Solo móvil */}
              <div className="lg:hidden">
                <MobileMenuButton />
              </div>
              
              <div className="w-1 h-4 sm:h-6 bg-orange-500 rounded-full"></div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">Nueva Cotización</h1>
                <nav className="text-gray-500 text-xs hidden sm:block">
                  <span>Cotizaciones</span>
                  <span className="mx-1">/</span>
                  <span className="text-blue-800">Nueva</span>
                </nav>
              </div>
            </div>
            
            {/* Contador de items - Visible siempre */}
            <div className="flex items-center gap-2">
              {methods.watch('items')?.length > 0 && (
                <span className="text-xs sm:text-sm text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full font-medium border border-blue-200">
                  {methods.watch('items')?.length} {methods.watch('items')?.length === 1 ? 'item' : 'items'}
                </span>
              )}
              
              {/* Indicador de progreso móvil - Solo si no hay items */}
              {(!methods.watch('items')?.length || methods.watch('items')?.length === 0) && (
                <div className="flex items-center gap-1 sm:hidden">
                  <div className="w-2 h-2 bg-blue-800 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal responsive */}
      <div className="pt-16 sm:pt-20 px-4 sm:px-6 pb-6">
        <div className="max-w-7xl mx-auto">
        <FormProvider {...methods}>
        
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">

            {/* Card de selección de cliente */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-l-4 border-blue-800 px-4 sm:px-6 py-3">
                <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                  Información del Cliente
                </h2>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4">
                <ClientAutocomplete
        key={client ? client.id : 'empty'} // 👈 fuerza reinicio visual
          onSelect={(clientLite) => {
            setClient(clientLite as Client); // Conversión explícita
            methods.setValue('clientId', clientLite.id);
          }}
          onCreateNew={() => setShowAddClient(true)}
        />




                {/* Info del cliente seleccionado */}
                {client && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-green-800">Cliente Seleccionado</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium text-gray-700">Nombre/Razón Social:</span> <span className="text-gray-900">{client.fullName || client.businessName}</span></p>
                      <p><span className="font-medium text-gray-700">Documento:</span> <span className="text-gray-900">{client.documentNumber}</span></p>
                    </div>
                  </div>
                )}
              </div>
            </div>

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

            {/* Card de Items de cotización */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6">
                <QuoteItemsWrapper />
              </div>
            </div>





            {/* Panel de estado de ítems */}
            {methods.watch('items')?.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-800 rounded-full"></div>
                    <div>
                      <span className="text-sm font-semibold text-blue-800">
                        {methods.watch('items')?.length} {methods.watch('items')?.length === 1 ? 'item agregado' : 'items agregados'}
                      </span>
                      <p className="text-xs text-blue-600 mt-1">
                        Los datos se guardan automáticamente
                      </p>
                    </div>
                  </div>
                  
                  {methods.watch('items')?.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        toast('¿Estás seguro de borrar todos los ítems?', {
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
                      className="bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm font-medium transition-all duration-200 hover:shadow-md min-h-[44px] sm:min-h-0"
                    >
                      🗑️ Limpiar todo
                    </button>
                  )}
                </div>
              </div>
            )}



            {/* Botones de acción responsive */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                
                {/* Mensaje si no hay cliente - Mobile First */}
                {!client && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                      <p className="text-sm text-orange-800 font-medium">
                        Selecciona un cliente para continuar
                      </p>
                    </div>
                  </div>
                )}

                {/* Botones responsivos */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                  
                  {/* Botón Cancelar */}
                  <button
                    type="button"
                    onClick={() => router.push('/cotizaciones')}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-4 sm:py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300 hover:shadow-md min-h-[48px] sm:min-h-0 order-2 sm:order-1"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancelar
                  </button>

                  {/* Botón Guardar - Destacado */}
                  {client && methods.watch('items')?.length > 0 && (
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-800 to-blue-700 text-white px-8 py-4 sm:py-3 rounded-lg hover:from-blue-900 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl border-2 border-orange-500 min-h-[48px] sm:min-h-0 order-1 sm:order-2"
                    >
                      <PlusCircle className="w-5 h-5" />
                      <span>Guardar Cotización</span>
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        {methods.watch('items')?.length}
                      </span>
                    </button>
                  )}

                  {/* Estado si falta información */}
                  {(!client || !methods.watch('items')?.length) && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 order-1 sm:order-2 flex-1 sm:flex-none">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-4 bg-orange-500 rounded-full"></div>
                        <p className="text-sm font-medium text-orange-800">
                          {!client ? 'Selecciona un cliente' : 'Agrega al menos un item'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                </div>
              </div>
            </div>



          </form>
        </FormProvider>

        </div>
      </div>
    </div>
  )
}
