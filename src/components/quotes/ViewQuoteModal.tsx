'use client'


import * as Dialog from '@radix-ui/react-dialog'

import { saveAs } from 'file-saver';

import QuoteStatusBadge from './QuoteStatusBadge'

import { Prisma } from "@prisma/client";
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type QuoteWithClientAndItems = Prisma.QuoteGetPayload<{
  include: { client: true; items: true };
}>;

interface ViewQuoteModalProps {
  quote: QuoteWithClientAndItems
  open: boolean
  onClose: () => void
}

export default function ViewQuoteModal({ quote, open, onClose }: ViewQuoteModalProps) {
    if (!quote || !quote.items) return null;
    const [downloading, setDownloading] = useState(false);

    const handlePdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/quotes/${quote.id}/pdf`);
      if (!res.ok) throw new Error();

      const blob = await res.blob();
      saveAs(blob, `cotizacion-${quote.code}.pdf`);
    } catch {
      toast.error('No se pudo generar PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed z-50 bg-white w-[92%] max-w-2xl p-6 rounded-2xl shadow-2xl
                     left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     animate-in fade-in-90 zoom-in-90"
        >
          {/* Encabezado */}
            <div className="mb-6 flex items-center justify-between">
            {/* Código + estado */}
            <Dialog.Title className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                Cotización #{quote.code || quote.id}

                {/* Etiqueta de estado */}
                <QuoteStatusBadge status={quote.status} />

            </Dialog.Title>

            <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-600 text-xl leading-none">
                &times;
                </button>
            </Dialog.Close>
            </div>

          
            {/* ✅ 2. Descripción invisible pero accesible */}
            <Dialog.Description className="sr-only">
                Vista detallada de la cotización, cliente e ítems.
            </Dialog.Description>


            {/* Datos del cliente ─ 2 columnas */}
            <section className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Datos del cliente</h3>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {/* Columna 1 */}
                <div className="space-y-1">
                <p className="font-semibold text-gray-800">
                    {quote.client?.fullName || quote.client?.businessName}
                </p>
                <p className="text-gray-600">
                    {quote.client?.documentType} {quote.client?.documentNumber}
                </p>
                </div>

                {/* Columna 2 */}
                <div className="space-y-1">
                <p className="text-gray-600">
                    📞 {quote.client?.phone ?? '—'}
                </p>
                <p className="text-gray-600">
                    📍 {quote.client?.address ?? '—'}
                </p>
                </div>

                {/* Fila completa (span 2) con fecha y estado */}
                <div className="col-span-2 text-gray-600">
                Fecha:&nbsp;{new Date(quote.createdAt).toLocaleDateString()}
                </div>
            </div>
</section>

          {/* Ítems */}
          <section className="border rounded-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-600 to-sky-400" />
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Descripción</th>
                  <th className="px-2 py-2 text-center">Cant.</th>
                  <th className="px-2 py-2 text-center">P. Unit</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-2 py-2 text-center">{item.quantity}</td>
                    <td className="px-2 py-2 text-center">{item.unitPrice}</td>
                    <td className="px-4 py-2 text-right">
                      {item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end px-4 py-3 border-t bg-gray-50">
              <span className="font-semibold">
                Total:&nbsp;S/ {quote.total.toFixed(2)}
              </span>
            </div>
          </section>

          {/* Observaciones */}
          {quote.notes && (
            <section className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Observaciones</h3>
              <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                <p className="text-sm text-gray-800 whitespace-pre-line">{quote.notes}</p>
              </div>
            </section>
          )}

<section className="mt-6 flex justify-end">
          <button
            onClick={handlePdf}
            disabled={downloading}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2
                      rounded-lg hover:bg-blue-700 disabled:opacity-60 cursor-pointer transition"
          >
            {downloading && <Loader2 className="h-4 w-4 animate-spin" />}
            Descargar PDF
          </button>
        </section>

      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
  )
}
