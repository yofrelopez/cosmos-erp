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
import { PlusCircle, XCircle, Loader2, Save, CheckCircle } from 'lucide-react';
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
    const [isSaved, setIsSaved] = useState(false)

    const companyId = useCompanyStore((s) => s.company?.id);


    const { saveQuote, isLoading, error, clearError } = useSaveQuote();

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

      try {
        // Limpiar errores previos
        clearError();
        
        await saveQuote({
          ...data,
          companyId, // ✅ ahora sí cumple con el backend
        });

        // ✅ Marcar como guardado exitosamente
        setIsSaved(true);

        // ✅ Solo limpiar si el guardado fue exitoso
        localStorage.removeItem('quoteItems');

        // ✅ Resetear formulario
        methods.reset({
          clientId: 0,
          items: [],
        });

        // ✅ Limpiar estado del cliente seleccionado
        setClient(null);
        
        // Toast con opciones de navegación
        toast.success("¡Cotización guardada exitosamente!", {
          description: "¿Qué quieres hacer ahora?",
          duration: 4000,
          action: {
            label: "Ver lista",
            onClick: () => router.push('/admin/cotizaciones')
          },
          cancel: {
            label: "Crear otra",
            onClick: () => {
              // Ya está limpio el formulario, solo mostrar mensaje
              toast.success("Formulario listo para nueva cotización");
            }
          }
        });
        
        // Redirección automática después de 4 segundos si no hace nada
        setTimeout(() => {
          router.push('/admin/cotizaciones');
        }, 4000);
        
      } catch (error) {
        // El error ya se maneja en el hook
        console.log('Error handled by hook:', error);
      }
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
                isLoading ? 'bg-blue-500 animate-pulse' :
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
            <span className={
              isLoading ? 'text-blue-600 animate-pulse' :
              (client && methods.watch('items')?.length > 0) ? 'text-orange-600 animate-pulse' : 'text-gray-400'
            }>
              {isLoading ? '💾 Guardando...' : 
               (client && methods.watch('items')?.length > 0) ? '🚀 Listo' : '○ Pendiente'}
            </span>
          </div>
        </div>

        {/* Estado de guardado exitoso */}
        {isSaved && !isLoading && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">¡Cotización guardada exitosamente!</p>
                <p className="text-xs text-green-600">Redirigiendo a la lista de cotizaciones...</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-green-500">Ir a:</p>
                <p className="text-xs font-medium text-green-700">/admin/cotizaciones</p>
              </div>
            </div>
            
            {/* Barra de progreso de redirección */}
            <div className="mt-3 bg-white rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-green-400 to-green-600 h-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Estado de guardado global */}
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800">Guardando cotización...</p>
                <p className="text-xs text-blue-600">Se redirigirá automáticamente al completar</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-500">Destino:</p>
                <p className="text-xs font-medium text-blue-700">/admin/cotizaciones</p>
              </div>
            </div>
            
            {/* Barra de progreso animada */}
            <div className="mt-3 bg-white rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full animate-pulse"></div>
            </div>
          </div>
        )}

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

                {/* Mensaje de error si existe */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-red-800">Error al guardar</p>
                        <p className="text-xs text-red-600 mt-1">{error}</p>
                      </div>
                      <button
                        type="button"
                        onClick={clearError}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Botones responsivos */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                  
                  {/* Botón Cancelar */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => router.push('/admin/cotizaciones')}
                    className={`
                      flex items-center justify-center gap-2 px-6 py-4 sm:py-3 rounded-lg 
                      transition-all duration-200 font-medium border 
                      min-h-[48px] sm:min-h-0 order-2 sm:order-1
                      ${isLoading 
                        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' 
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:shadow-md'
                      }
                    `}
                  >
                    <XCircle className="w-5 h-5" />
                    Cancelar
                  </button>

                  {/* Botón Guardar - Destacado con estados */}
                  {client && methods.watch('items')?.length > 0 && (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`
                        flex items-center justify-center gap-3 px-8 py-4 sm:py-3 rounded-lg 
                        transition-all duration-200 font-semibold shadow-lg 
                        min-h-[48px] sm:min-h-0 order-1 sm:order-2
                        ${isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-800 to-blue-700 text-white hover:from-blue-900 hover:to-blue-800 hover:shadow-xl border-2 border-orange-500'
                        }
                      `}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Guardando...</span>
                          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                            {methods.watch('items')?.length}
                          </div>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Guardar Cotización</span>
                          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                            {methods.watch('items')?.length}
                          </span>
                        </>
                      )}
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
