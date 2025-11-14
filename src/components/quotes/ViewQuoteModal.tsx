'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { saveAs } from 'file-saver';

import QuoteStatusBadge from './QuoteStatusBadge'
import { formatDescription } from '@/lib/formatDescription';

import { Prisma } from "@prisma/client";
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, X, Download, User, Calendar, MapPin, Phone } from 'lucide-react';
import ItemImages from './ItemImages';

type QuoteWithClientAndItems = Prisma.QuoteGetPayload<{
  include: { 
    client: true; 
    items: { 
      include: { 
        images: true 
      } 
    } 
  };
}>;

interface QuoteItemImage {
  id: number
  imageUrl: string
  fileName: string
  fileSize?: number
  createdAt: string
}

interface ViewQuoteModalProps {
  quote: QuoteWithClientAndItems
  open: boolean
  onClose: () => void
}

export default function ViewQuoteModal({ quote, open, onClose }: ViewQuoteModalProps) {
  if (!quote || !quote.items) return null;
  const [downloading, setDownloading] = useState(false);
  const [itemImages, setItemImages] = useState<{ [key: number]: QuoteItemImage[] }>({});

  // Cargar imágenes cuando se abre el modal - usar las que ya vienen incluidas
  useEffect(() => {
    if (!open) return;
    
    const imagesData: { [key: number]: QuoteItemImage[] } = {};
    
    // Usar las imágenes que ya vienen incluidas en quote.items
    for (const item of quote.items) {
      imagesData[item.id] = (item.images || []).map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        fileName: img.fileName,
        fileSize: img.fileSize ?? undefined,
        createdAt: img.createdAt.toISOString()
      }));
    }
    
    setItemImages(imagesData);
  }, [open, quote.items]);

  const handleImagesChange = async (itemId: number) => {
    try {
      const response = await fetch(`/api/quote-items/${itemId}/images`);
      if (response.ok) {
        const data = await response.json();
        setItemImages(prev => ({
          ...prev,
          [itemId]: (data.images || []).map((img: any) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            fileName: img.fileName,
            fileSize: img.fileSize ?? undefined,
            createdAt: img.createdAt
          }))
        }));
      }
    } catch (error) {
      console.error(`Error actualizando imágenes para item ${itemId}:`, error);
    }
  };

  const handlePdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/quotes/${quote.id}/pdf`);
      if (!res.ok) throw new Error('Error al generar PDF');

      const blob = await res.blob();
      saveAs(blob, `cotizacion-${quote.code}.pdf`);
      toast.success('PDF descargado correctamente');
    } catch {
      toast.error('No se pudo generar el PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleContractPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/contracts/by-quote/${quote.id}/pdf`);
      if (!res.ok) throw new Error('Error al generar PDF del contrato');

      const blob = await res.blob();
      
      // Extraer el nombre del archivo del header Content-Disposition
      const contentDisposition = res.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename="')[1]?.split('"')[0]
        : `contrato-${quote.code}.pdf`; // fallback
      
      saveAs(blob, filename);
      toast.success('PDF del contrato descargado correctamente');
    } catch {
      toast.error('No se pudo generar el PDF del contrato');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed z-50 bg-white w-[95%] sm:w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto
                     left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 
                     p-4 sm:p-6 lg:p-8
                     animate-in fade-in-90 zoom-in-95 duration-300"
        >
          {/* Encabezado Mejorado */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 pb-4 border-b border-gray-100">
            <Dialog.Title className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                Cotización #{quote.code || quote.id}
              </span>
              <QuoteStatusBadge status={quote.status} />
            </Dialog.Title>

            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">
            Vista detallada de la cotización, cliente e ítems.
          </Dialog.Description>

          {/* Datos del Cliente Mejorados */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-700">Información del Cliente</h3>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 sm:p-6 border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Información Principal */}
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-base sm:text-lg">
                      {quote.client?.fullName || quote.client?.businessName}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {quote.client?.documentType} {quote.client?.documentNumber}
                    </p>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{quote.client?.phone ?? 'No especificado'}</span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                    <span className="text-sm">{quote.client?.address ?? 'No especificada'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">
                      {new Date(quote.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tabla de Ítems Responsive */}
          <section className="mb-6 sm:mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
              📋 Detalle de Items
            </h3>
            
            {/* Mobile: Cards */}
            <div className="block sm:hidden space-y-3">
              {quote.items.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="font-medium text-gray-900 mb-2">
                    <div
                      className="leading-relaxed text-sm"
                      dangerouslySetInnerHTML={{ __html: formatDescription(item.description) }}
                    />
                  </div>
                  
                  {/* Imágenes del item */}
                  {item.images && item.images.length > 0 && (
                    <div className="mb-3">
                      <ItemImages
                        quoteItemId={item.id}
                        images={item.images.map(img => ({
                          id: img.id,
                          imageUrl: img.imageUrl,
                          fileName: img.fileName,
                          fileSize: img.fileSize ?? undefined,
                          createdAt: img.createdAt.toISOString()
                        }))}
                        onImagesChange={() => handleImagesChange(item.id)}
                        readonly={true}
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Cantidad: <span className="font-medium">{item.quantity}</span></div>
                    <div>P. Unitario: <span className="font-medium">S/ {item.unitPrice}</span></div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-right">
                      <span className="text-sm text-gray-600">Subtotal: </span>
                      <span className="font-semibold text-gray-900">S/ {item.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden sm:block border rounded-xl overflow-hidden shadow-sm">
              <div className="h-1 bg-gradient-to-r from-blue-600 to-sky-400" />
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left font-medium text-gray-700">Descripción</th>
                    <th className="px-3 lg:px-4 py-3 text-center font-medium text-gray-700">Imágenes</th>
                    <th className="px-3 lg:px-4 py-3 text-center font-medium text-gray-700">Cant.</th>
                    <th className="px-3 lg:px-4 py-3 text-center font-medium text-gray-700">P. Unit</th>
                    <th className="px-4 lg:px-6 py-3 text-right font-medium text-gray-700">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item, index) => (
                    <tr key={item.id} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}>
                      <td className="px-4 lg:px-6 py-3 text-gray-900">
                        <div
                          className="leading-relaxed text-sm"
                          dangerouslySetInnerHTML={{ __html: formatDescription(item.description) }}
                        />
                      </td>
                      <td className="px-3 lg:px-4 py-3">
                        {item.images && item.images.length > 0 && (
                          <div className="mt-2">
                            <ItemImages
                              quoteItemId={item.id}
                              images={item.images.map(img => ({
                                id: img.id,
                                imageUrl: img.imageUrl,
                                fileName: img.fileName,
                                fileSize: img.fileSize ?? undefined,
                                createdAt: img.createdAt.toISOString()
                              }))}
                              onImagesChange={() => handleImagesChange(item.id)}
                              readonly={true}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-3 lg:px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                      <td className="px-3 lg:px-4 py-3 text-center text-gray-700">S/ {item.unitPrice}</td>
                      <td className="px-4 lg:px-6 py-3 text-right font-medium text-gray-900">
                        S/ {item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Total */}
              <div className="bg-gradient-to-r from-gray-100 to-blue-100/50 px-4 lg:px-6 py-4 border-t">
                <div className="flex justify-end">
                  <div className="text-right">
                    <span className="text-gray-600 text-sm">Total de la Cotización</span>
                    <div className="text-xl font-bold text-gray-900">
                      S/ {quote.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Total */}
            <div className="block sm:hidden mt-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-200">
              <div className="text-center">
                <span className="text-gray-600 text-sm block">Total de la Cotización</span>
                <span className="text-2xl font-bold text-gray-900">S/ {quote.total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Observaciones Mejoradas */}
          {quote.notes && (
            <section className="mb-6 sm:mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                📝 Observaciones
              </h3>
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{quote.notes}</p>
              </div>
            </section>
          )}

          {/* Botones de Descarga */}
          <section className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3">
            {/* Botón PDF Cotización */}
            <button
              onClick={handlePdf}
              disabled={downloading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-600 
                         text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl 
                         hover:from-blue-700 hover:to-sky-700 
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-lg hover:shadow-xl
                         text-sm sm:text-base font-medium w-full sm:w-auto justify-center sm:justify-start"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {downloading ? 'Generando PDF...' : 'PDF Cotización'}
            </button>

            {/* Botón PDF Contrato - Solo si está aprobada */}
            {quote.status === 'ACCEPTED' && (
              <button
                onClick={handleContractPdf}
                disabled={downloading}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 
                           text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl 
                           hover:from-green-700 hover:to-emerald-700 
                           disabled:opacity-60 disabled:cursor-not-allowed
                           transition-all duration-200 shadow-lg hover:shadow-xl
                           text-sm sm:text-base font-medium w-full sm:w-auto justify-center sm:justify-start"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                PDF Contrato
              </button>
            )}
          </section>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}