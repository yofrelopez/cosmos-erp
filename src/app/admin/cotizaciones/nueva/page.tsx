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
import PageHeader from '@/components/common/PageHeader';




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
    const [searchTerm, setSearchTerm] = useState('')

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
    <main className="page-container">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Nueva Cotización"
          subtitle={methods.watch('items')?.length > 0 
            ? `${methods.watch('items')?.length} ${methods.watch('items')?.length === 1 ? 'ítem agregado' : 'ítems agregados'} - Total: S/. ${methods.watch('items')?.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0).toFixed(2) || '0.00'}`
            : "Crear una nueva cotización para tus clientes"
          }
          showBreadcrumb={true}
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Cotizaciones', href: '/admin/cotizaciones' },
            { label: 'Nueva', href: '/admin/cotizaciones/nueva' },
          ]}
        />

        {/* Barra de progreso minimalista */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            {/* Barra de progreso delgada */}
            <div className="flex items-center gap-1 flex-1 max-w-xs">
              {/* Cliente */}
              <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                client ? 'bg-green-500' : 'bg-gray-200'
              }`}></div>
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                client ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              
              {/* Ítems */}
              <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                methods.watch('items')?.length > 0 ? 'bg-blue-500' : 'bg-gray-200'
              }`}></div>
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                methods.watch('items')?.length > 0 ? 'bg-blue-500' : 'bg-gray-300'
              }`}></div>
              
              {/* Listo */}
              <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                (client && methods.watch('items')?.length > 0) ? 'bg-orange-500 animate-pulse' : 'bg-gray-200'
              }`}></div>
            </div>

            {/* Total en una línea */}
            {methods.watch('items')?.length > 0 && (
              <div className="text-right">
                <span className="text-sm text-gray-600">Total: </span>
                <span className="text-lg font-bold text-green-600">
                  S/. {methods.watch('items')?.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0).toFixed(2) || '0.00'}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  ({methods.watch('items')?.length} {methods.watch('items')?.length === 1 ? 'ítem' : 'ítems'})
                </span>
              </div>
            )}
          </div>
          
          {/* Labels minimalistas solo cuando sea necesario */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className={client ? 'text-green-600' : 'text-gray-400'}>
              {client ? '✓ Cliente' : '○ Cliente'}
            </span>
            <span className={methods.watch('items')?.length > 0 ? 'text-blue-600' : 'text-gray-400'}>
              {methods.watch('items')?.length > 0 ? `✓ ${methods.watch('items')?.length} ítems` : '○ Ítems'}
            </span>
            <span className={(client && methods.watch('items')?.length > 0) ? 'text-orange-600 animate-pulse' : 'text-gray-400'}>
              {(client && methods.watch('items')?.length > 0) ? '🚀 Listo' : '○ Pendiente'}
            </span>
          </div>
        </div>

        {/* Contenido principal responsive */}
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
        key={client ? `selected-client-${client.id}` : 'no-client-selected'} // 👈 key única y estable
          onSelect={(clientLite) => {
            setClient(clientLite as Client); // Conversión explícita
            methods.setValue('clientId', clientLite.id);
          }}
          onCreateNew={(term) => {
            setSearchTerm(term);
            setShowAddClient(true);
          }}
        />




                {/* Info del cliente seleccionado */}
                {client && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {(client.fullName || client.businessName || '').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-green-800">✓ Cliente Seleccionado</span>
                        <p className="text-xs text-green-600">Listo para agregar ítems</p>
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-2">
                      {/* Mostrar nombre o razón social según corresponda */}
                      {client.fullName && (
                        <p>
                          <span className="font-medium text-gray-700">👤 Nombre:</span> 
                          <span className="text-gray-900 ml-2">{client.fullName}</span>
                        </p>
                      )}
                      
                      {client.businessName && (
                        <p>
                          <span className="font-medium text-gray-700">🏢 Razón Social:</span> 
                          <span className="text-gray-900 ml-2">{client.businessName}</span>
                        </p>
                      )}
                      
                      <p>
                        <span className="font-medium text-gray-700">📋 Documento:</span> 
                        <span className="text-gray-900 ml-2">{client.documentType} - {client.documentNumber}</span>
                      </p>
                      
                      {/* Información adicional si existe */}
                      {client.email && (
                        <p>
                          <span className="font-medium text-gray-700">📧 Email:</span> 
                          <span className="text-gray-900 ml-2">{client.email}</span>
                        </p>
                      )}
                      
                      {client.phone && (
                        <p>
                          <span className="font-medium text-gray-700">📱 Teléfono:</span> 
                          <span className="text-gray-900 ml-2">{client.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal para crear nuevo cliente */}
            {showAddClient && (
              <AddClientModal
                searchTerm={searchTerm}
                onSuccess={(newClient) => {
                  // Crear objeto Client compatible
                  const clientData: Client = {
                    ...newClient,
                    businessName: newClient.businessName || null,
                    phone: newClient.phone || null,
                    email: newClient.email || null,
                    address: newClient.address || null,
                    notes: newClient.notes || null,
                    createdAt: new Date().toISOString(),
                  };
                  setClient(clientData);
                  methods.setValue('clientId', clientData.id);
                  setShowAddClient(false);
                  setSearchTerm(''); // Limpiar término
                }}
              />
            )}

            {/* Card de Items de cotización */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-l-4 border-blue-800 px-4 sm:px-6 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                    Items de la Cotización
                  </h2>
                  
                  {/* Contador de ítems en el header */}
                  {methods.watch('items')?.length > 0 && (
                    <span className="text-xs text-blue-800 bg-blue-100 px-3 py-1 rounded-full font-medium">
                      {methods.watch('items')?.length} {methods.watch('items')?.length === 1 ? 'ítem' : 'ítems'}
                    </span>
                  )}
                </div>
                
                {methods.watch('items')?.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Agrega productos o servicios a tu cotización
                  </p>
                )}
              </div>
              
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
    </main>
  );
}
